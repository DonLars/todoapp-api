"use strict";
import { fetchData, postData } from "./apiutils.js";

Vue.createApp({
  data() {
    return {};
  },
  computed: {},
  methods: {},
}).mount("#app");

/* State and initializing
========================================================================== */

// DOM elements
const taskForm = document.getElementById("task-form");
const input = document.getElementById("input");
const taskList = document.getElementById("task-list");
const clearButton = document.getElementById("clear-btn");
/* const apiUrl = "http://localhost:4730/todos";
 */

// State
const state = {
  currentFilter: "all", // "all", "done", "open"
  tasks: [],
};

initialize();

/* FUNCTION - to render filtered data from state
========================================================================== */
function render() {
  taskList.innerHTML = "";

  // Filtering todos
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
    taskList.appendChild(generateTodoItemTemplate(task));
  }
}

/* FUNCTION - to get todos from the API
========================================================================== */
function getTodosFromApi() {
  fetchData() // Nochmal anschauen
    .then((todosFromApi) => {
      state.tasks = todosFromApi;
      render();
    })
    .catch((error) => {
      console.error("Error getting todos from API:", error);
      alert("Sorry, API is offline!");
    });
  //.finally(() => console.log("test if api is online and offline"));
}

/* FUNCTION - to save a new todo to the API
========================================================================== */
function saveTodoToApi() {
  const newTodoText = input.value.trim();
  const newTodo = { description: newTodoText, done: false };

  postData(newTodo)
    .then((newTodoFromApi) => {
      state.tasks.push(newTodoFromApi);
      render();
    })
    .catch((error) => console.error("Error saving todo to API:", error));
}

/*  FUNCTION -  to update a todo in the API
========================================================================== */
function updateTodoToApi(task) {
  fetch(apiUrl + `/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then((response) => response.json())
    .then((updatedTodoFromApi) => {
      // finding the position from the changed task in the local state
      const index = state.tasks.findIndex(
        (task) => task.id === updatedTodoFromApi.id
      );
      // -1 means: not in this array
      if (index !== -1) {
        state.tasks[index] = updatedTodoFromApi;
        render();
      } else {
        console.warn("Updated task not found in local state.");
      }
    })
    .catch((error) => console.error("Error updating todo in API:", error));
}

/* FUNCTION - to delete a todo from the API
========================================================================== */
function deleteTodoFromApi(taskId) {
  fetch(apiUrl + `/${taskId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then(() => {
      // Remove the task with the specified id from the state.tasks array
      state.tasks = state.tasks.filter((task) => task.id !== parseInt(taskId));
      render();
    })
    .catch((error) => console.error("Error deleting todo from API:", error));
}

/* FUNCTION - to remove all completed todos from the API
========================================================================== */
function removeDoneTodosFromApi() {
  // Filter out completed todos from the current state
  const doneTodos = state.tasks.filter((task) => task.done);

  // Use Promise.all for multiple API requests and delete many completed todos
  //Promise All Settled
  Promise.all(
    doneTodos.map((doneTodo) =>
      fetch(apiUrl + `/${doneTodo.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
    )
  )
    .then(() => {
      // Update the local state by filtering out completed todos
      state.tasks = state.tasks.filter((task) => !task.done);
      render();
    })
    .catch((error) =>
      console.error("Error removing done todos from API:", error)
    );
}

/* FUNCTION - to generate HTML template for a todo item
========================================================================== */
function generateTodoItemTemplate(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.id = `task-${task.id}`;

  const div = document.createElement("div");
  div.classList.add("checkbox-wrapper");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `checkbox-toogle-${task.id}`;
  checkbox.classList.add("toggle-complete");
  checkbox.checked = task.done;

  /* EVENT LISTENER - for changing the checkbox status
  ========================================================================== */
  checkbox.addEventListener("change", () => {
    task.done = checkbox.checked;
    checkbox.checked
      ? checkbox.setAttribute("checked", "")
      : checkbox.removeAttribute("checked");

    // Check if the task is already in the API
    const existingTask = state.tasks.find((t) => t.id === task.id);

    if (existingTask) {
      // If present, update the task in the API
      updateTodoToApi(task);
    } else {
      // If not present, it's a new task. Handle this case if needed.
      console.warn("Task not found in API.");
    }
  });

  const label = document.createElement("label");
  label.innerText = task.description;
  label.htmlFor = `checkbox-toggle-${task.id}`;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "X";
  button.classList.add("delete-task");
  button.id = `delete-btn-${task.id}`;

  /* EVENT LISTENER - for delete one task
  ========================================================================== */
  button.addEventListener("click", (event) => {
    const taskId = parseInt(event.target.id.replace("delete-btn-", ""), 10);
    deleteTodoFromApi(taskId);
  });

  div.append(checkbox, label);
  li.append(div, button);
  return li;
}

/* EVENT LISTENER - for submit form
========================================================================== */
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const isDuplicate = state.tasks.some(
    (task) =>
      task.description.toLowerCase() === input.value.trim().toLowerCase()
  );

  if (isDuplicate) {
    alert("You can't add a duplicate task!");
  } else if (input.value.trim() !== "") {
    render();
    saveTodoToApi();
    input.value = "";
    input.focus();
  }
});

/* EVENT LISTENER - for filter radio buttons
========================================================================== */
const filterRadios = document.querySelectorAll('input[name="filter"]');
filterRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.currentFilter = radio.value;
    render();
  });
});

/* EVENT LISTENER - for clearing completed tasks
========================================================================== */
clearButton.addEventListener("click", () => {
  if (confirm("Do you really want to delete all completed tasks?")) {
    removeDoneTodosFromApi();
  }
});

/* Function to initialize the application
========================================================================== */
function initialize() {
  getTodosFromApi();
  render();
}
