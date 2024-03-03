/*
BUG: Test 2x, nach Alert F5 kommt doch rein
*/
"use strict";
Vue.createApp({
  data() {
    return {
      todos: [],
      newTodoText: "",
      apiUrl: "http://localhost:4730/todos/",
      filter: "all", // Initial filter "all", "open", "done"
    };
  },
  computed: {
    filteredTodos() {
      // selected filter
      if (this.filter === "open") {
        return this.todos.filter((todo) => !todo.done);
      } else if (this.filter === "done") {
        return this.todos.filter((todo) => todo.done);
      } else {
        // "all" or another filter
        return this.todos;
      }
    },
  },
  methods: {
    addTodo() {
      const newTodoObject = {
        description: this.newTodoText.trim(),
        done: false,
      };

      fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodoObject),
      })
        .then((response) => response.json())
        .then((jsonData) => {
          console.log();
          const isDuplicate = this.todos.some(
            (task) =>
              task.description.toLowerCase() ===
              this.newTodoText.trim().toLowerCase()
          );
          if (this.newTodoText === "") {
            alert("Write something down!");
          } else if (isDuplicate) {
            alert("You can't add a duplicate task!");
          } else {
            this.todos.push(jsonData);
            this.newTodoText = "";
          }
        });
    },
    updateTodo(todo) {
      const cloneCurrentTodo = {
        id: todo.id,
        description: todo.description,
        done: !todo.done,
      };
      fetch(this.apiUrl + cloneCurrentTodo.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cloneCurrentTodo),
      })
        .then((response) => response.json())
        .then((jsonDataUpdatedTodo) => {
          todo.done = !todo.done;
        })
        .catch((error) => {
          console.error(
            "Fehler beim Aktualisieren des Todos in der API:",
            error
          );
        });
    },
    deleteTodo(todoId) {
      fetch(this.apiUrl + todoId, {
        method: "DELETE",
      })
        .then(() => {
          this.todos = this.todos.filter((todo) => todo.id !== todoId);
        })
        .catch((error) => {
          console.error("Fehler beim Löschen des Todos:", error);
        });
    },

    deleteDoneTodos() {
      if (confirm("Do you really want to delete all completed tasks?")) {
        // Filter out completed todos from the current state
        const doneTodos = this.todos.filter((todo) => todo.done);
        if (doneTodos.length === 0) {
          // No done tasks
          console.log("No completed tasks to delete");
          return;
        }

        // Use Promise.all for multiple API requests and delete many completed todos
        Promise.all(
          doneTodos.map((doneTodo) =>
            fetch(this.apiUrl + `/${doneTodo.id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            })
          )
        )
          .then(() => {
            // Update the local state by filtering out completed todos
            this.todos = this.todos.filter((todo) => !todo.done);
          })
          .catch((error) =>
            console.error("Error removing done todos from API:", error)
          );
      }
    },
  },
  created() {
    fetch(this.apiUrl)
      .then((response) => response.json())
      .then((jsonData) => (this.todos = jsonData));
  },
}).mount("#app");
