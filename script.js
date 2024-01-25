"use strict";

/* SETTING UP REFERENCES ======================================================== */
const taskForm = document.getElementById("task-form");
const input = document.getElementById("input");
const taskList = document.getElementById("task-list");
const clearButton = document.getElementById("clear-btn");
const checkboxes = document.querySelectorAll(".toggle-complete");
const claim = document.querySelector(".claim");

/* SETTING UP STATE ============================================================= */
const state = {
  currentFilter: "all", // "all", "done", "open"
  tasks: [],
};

// Add a default "testTodo" if there are no tasks in localStorage
if (state.tasks.length === 0 && localStorage.getItem("tasks") === null) {
  const testTodo = {
    id: new Date().getTime(),
    description: "Start your first task 😜",
    isDone: false,
  };
  state.tasks.push(testTodo);
  saveTodosToApi();
}

/* FUNCTION - LOAD TODOS FROM API ====================================== */

function getTodosFromApi() {
  //state.tasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

  fetch("http://localhost:4730/todos")
    .then((res) => res.json())
    .then((todosFromApi) => {
      state.tasks = todosFromApi;
      console.log(state.tasks);
      render();
    });
}

/* FUNCTION - SAVE TODOS TO API ======================================== */

function saveTodosToApi() {
  localStorage.setItem("tasks", JSON.stringify(state.tasks));
  // Additional code for saving to external API, if needed
  /*fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state.tasks),
  })
    .then((res) => res.json())
    .then((newTodoFromApi) => {
      //todos.push(state.tasks);
      state.tasks = newTodoFromApi;
      //render();
    })
    .catch((error) => {
      console.error("Error saving todos to API:", error);
      // Handle errors as needed
    });*/
}

/* FUNCTION - GENERATE HTML TEMPLATE ============================================ */
function generateTodoItemTemplate(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");

  const div = document.createElement("div");
  div.classList.add("checkbox-wrapper");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkbox-toogle-" + task.id;
  checkbox.classList.add("toggle-complete");

  checkbox.checked = task.isDone;

  checkbox.addEventListener("change", function () {
    task.isDone = checkbox.checked;

    if (checkbox.checked) {
      checkbox.setAttribute("checked", "");
    } else {
      checkbox.removeAttribute("checked");
    }
    saveTodosToApi();
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

/* EVENT LISTENER - SUBMIT BUTTON =============================================== */
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const isDuplicate = state.tasks.some(
    (task) =>
      task.description.toLowerCase() === input.value.trim().toLowerCase()
  );

  if (isDuplicate) {
    alert("Sorry, you can't add a duplicate task!");
  } else {
    if (input.value.trim() !== "") {
      state.tasks.push({
        //id: new Date().getTime(),
        description: input.value.trim(),
        isDone: false,
      });

      render();

      input.value = "";
      input.focus();
    } else {
      return;
    }
  }
});

/* EVENT LISTENER - FILTERING ================================================== */
const filterRadios = document.querySelectorAll('input[name="filter"]');
filterRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    state.currentFilter = this.value;
    render();
  });
});

/* EVENT LISTENER - CLEAR DONE TASKS ============================================ */
clearButton.addEventListener("click", function () {
  if (confirm("Do you really want to delete the complete list?")) {
    state.tasks = state.tasks.filter((task) => !task.isDone);
    saveTodosToApi();
    render();
  }
});

/* FUNCTION - DISPLAY =========================================================== */
function display() {
  taskList.innerHTML = "";

  const filteredTodos = state.tasks.filter((task) => {
    if (state.currentFilter == "done") {
      return task.isDone;
    }
    if (state.currentFilter == "open") {
      return !task.isDone;
    }
    return true;
  });

  filteredTodos.forEach(function (task) {
    const listItem = generateTodoItemTemplate(task);
    taskList.appendChild(listItem);
  });

  const checkboxes = document.querySelectorAll(".toggle-complete");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const taskId = parseInt(checkbox.id.replace("checkbox-", ""));
      const currentTask = state.tasks.find((task) => task.id === taskId);

      currentTask.isDone = checkbox.checked;
      onStateChange();
    });
  });

  const deleteButtons = document.querySelectorAll(".delete-task");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.id;
      state.tasks = state.tasks.filter(
        (removeTask) => removeTask.id !== parseInt(taskId)
      );
      saveTodosToApi();
      render();
      document.getElementById(taskId).remove();
    });
  });
}

/* FUNCTION - ON STAGE (SAVE + DISPLAY WRAPPER) ================================ */
function onStateChange() {
  localStorage.setItem("tasks", JSON.stringify(state.tasks));
  display();
  currentTaskCount();
}

/* COUNT OPEN TASK - FUNCTION =================================================== */
function currentTaskCount() {
  const openTasks = state.tasks.filter((task) => !task.isDone);

  if (openTasks.length > 0) {
    claim.textContent = `Getting ${openTasks.length} things done…`;
  } else {
    claim.textContent = `Great, all tasks are completed!`;
  }
}

/* FUNCTION - RENDER DATA FROM STATE =========================================== */
function render() {
  taskList.innerHTML = "";

  const filteredTodos = state.tasks.filter((task) => {
    if (state.currentFilter == "done") {
      return task.isDone;
    }
    if (state.currentFilter == "open") {
      return !task.isDone;
    }
    return true;
  });

  for (const task of filteredTodos) {
    const newTodoItem = generateTodoItemTemplate(task);
    taskList.appendChild(newTodoItem);
  }

  const deleteButtons = document.querySelectorAll(".delete-task");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const buttonId = button.id;
      const taskId = buttonId.replace("delete-btn-", "");
      state.tasks = state.tasks.filter(
        (removeTask) => removeTask.id !== parseInt(taskId)
      );
      saveTodosToApi();
      render();
      const listItem = document.getElementById(taskId).closest(".task-item");
      listItem.remove();
    });
  });

  saveTodosToApi();
}

/* FUNCTION - GET TODOS AND RENDER ============================================ */
function initialize() {
  getTodosFromApi();
  render();
  currentTaskCount();
}

initialize();
