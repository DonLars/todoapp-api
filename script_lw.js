"use strict";

/*    SETTING UP DOM ELEMENTS
========================================================================== */
const taskForm = document.getElementById("task-form"); // reference to form
const input = document.getElementById("input"); // reference to inputfield
const taskList = document.getElementById("task-list"); // reference to task list
const clearButton = document.getElementById("clear-btn"); // reference to clear button
const checkboxes = document.querySelectorAll(".toggle-complete"); // get all checkboxes

/* API ELEMENTS */
const apiUrl = "http://localhost:4730/todos";

/*    SETTING UP STATE
========================================================================== */
const state = {
  currentFilter: "all", // "all", "done", "open"
  tasks: [],
};

initialize();

/* FUNCTION - GET TODOS FROM API
========================================================================== */

function getTodosFromApi() {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((todosFromApi) => {
      state.tasks = todosFromApi.map((apiTodo) => {
        return {
          id: apiTodo.id,
          description: apiTodo.description,
          done: apiTodo.done,
        };
      });
      render();
    })
    .catch((error) => {
      console.error("Error getting todos from API:", error);
    });
}

/*    FUNCTION - SAVE TODOS TO API
========================================================================== */
function saveTodosToApi() {
  //localStorage.setItem("tasks", JSON.stringify(state.tasks)); // save to localStorage

  const newTodoText = input.value;
  const newTodo = {
    description: newTodoText,
    done: false,
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  })
    .then((res) => res.json())
    .then((newTodoFromApi) => {
      state.tasks.push(newTodoFromApi); // Beachten Sie die Änderung hier
      render();
    })
    .catch((error) => {
      console.error("Error saving todo to API:", error);
    });
}

/*    FUNCTION - UPDATE TASKS TO API
========================================================================== */
function updateTodoToApi(task) {
  fetch(apiUrl + `/${task.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })
    .then((res) => res.json())
    .then((updatedTodoFromApi) => {
      // Aktualisieren Sie den lokalen Zustand mit dem aktualisierten Task aus der API
      let taskUpdated = false;

      for (let i = 0; i < state.tasks.length; i++) {
        if (state.tasks[i].id === updatedTodoFromApi.id) {
          state.tasks[i] = updatedTodoFromApi;
          taskUpdated = true;
          break;
        }
      }

      if (taskUpdated) {
        render(); // Rendern Sie die Änderungen auf der Benutzeroberfläche
      } else {
        console.warn("Updated task not found in local state.");
      }
    })
    .catch((error) => {
      console.error("Error updating todo in API:", error);
    });
}

/*    FUNCTION - DELETE TASK FROM API
========================================================================== */
function deleteTodoFromApi(taskId) {
  fetch(apiUrl + `/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(() => {
      state.tasks = state.tasks.filter((task) => task.id !== parseInt(taskId));
      render();
    })
    .catch((error) => {
      console.error("Error deleting todo from API:", error);
    });
}

/*    FUNCTION - DELETE ALL TASKS FROM API
========================================================================== */
function removeDoneTodosFromApi() {
  const doneTodos = state.tasks.filter((task) => task.done);

  Promise.all(
    doneTodos.map((doneTodo) =>
      fetch(apiUrl + `/${doneTodo.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
    )
  )
    .then(() => {
      // Filtern Sie die erledigten Todos aus dem lokalen Zustand heraus
      state.tasks = state.tasks.filter((task) => !task.done);
      render();
    })
    .catch((error) => {
      console.error("Error removing done todos from API:", error);
    });
}

/*    FUNCTION - GENERATE HTML TEMPLATE
========================================================================== */
function generateTodoItemTemplate(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.id = "task-" + task.id; // Setzen Sie die ID für das li-Element

  const div = document.createElement("div");
  div.classList.add("checkbox-wrapper");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkbox-toogle-" + task.id;
  checkbox.classList.add("toggle-complete");

  checkbox.checked = task.done; // set "checked" attribut based on task.done

  // Event-Listener für das Ändern des Checkbox-Status hinzufügen
  checkbox.addEventListener("change", function () {
    task.done = checkbox.checked;

    if (checkbox.checked) {
      checkbox.setAttribute("checked", "");
    } else {
      checkbox.removeAttribute("checked");
    }
    updateTodoToApi(task);
  });

  const label = document.createElement("label");
  label.innerText = task.description;
  label.htmlFor = "checkbox-toggle-" + task.id;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "X";
  button.classList.add("delete-task");
  button.id = "delete-btn-" + task.id;

  div.append(checkbox, label);
  li.append(div, button);
  return li;
}

/*    EVENT LISTENER - SUBMIT BUTTON
// ========================================================================== */
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Check for duplicates, if there are some tasks which
  const isDuplicate = state.tasks.some(
    (task) =>
      task.description.toLowerCase() === input.value.trim().toLowerCase() // check if task in array === inputValue
  );

  if (isDuplicate) {
    alert("Sorry, you can't add a duplicate task!");
  } else {
    if (input.value.trim() !== "") {
      // Render state
      render();
      saveTodosToApi();

      input.value = ""; // clear input field
      input.focus(); // focus on input field for the next task
    } else {
      return; // do nothing
    }
  }
});

/*    EVENT LISTENER - FILTERING
========================================================================== */
const filterRadios = document.querySelectorAll('input[name="filter"]'); // select radio inputs
filterRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    state.currentFilter = this.value; // set currentfilter to this value
    render();
  });
});

/*    EVENT LISTENER - CLEAR DONE TASKS
========================================================================== */
clearButton.addEventListener("click", function () {
  if (confirm("Do you really want to delete all completed tasks?")) {
    removeDoneTodosFromApi();
  }
});

/*    FUNCTION - RENDER DATA FROM STATE
========================================================================== */
function render() {
  taskList.innerHTML = "";

  // Filtering
  const filteredTodos = state.tasks.filter((task) => {
    if (state.currentFilter == "done") {
      return task.done; // set task to done
    }
    if (state.currentFilter == "open") {
      return !task.done; // set task to NOT done
    }
    return true; // unfiltered tasks
  });

  for (const task of filteredTodos) {
    const newTodoItem = generateTodoItemTemplate(task);
    taskList.appendChild(newTodoItem);
  }

  /*    EVENT-LISTENER - REMOVE BUTTON
========================================================================== */
  const deleteButtons = document.querySelectorAll(".delete-task");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const buttonId = button.id; // save the button ID
      const taskId = buttonId.replace("delete-btn-", ""); // extract the ID
      deleteTodoFromApi(taskId);
    });
  });
}

/*    FUNCTION - GET TODOS AND RENDER
========================================================================== */
function initialize() {
  getTodosFromApi();
  render();
}
