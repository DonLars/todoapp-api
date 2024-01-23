"use strict";

/*    SETTING UP REFERENCES
========================================================================== */
const taskForm = document.getElementById("task-form"); // reference to form
const input = document.getElementById("input"); // reference to inputfield
const taskList = document.getElementById("task-list"); // reference to task list
const clearButton = document.getElementById("clear-btn"); // reference to clear button
const checkboxes = document.querySelectorAll(".toggle-complete"); // get all checkboxes
const claim = document.querySelector(".claim"); // reference to claim

/*    SETTING UP STATE
========================================================================== */
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
  saveTodosToLocalStorage();
}

/*    FUNCTION - LOAD TODOS FROM LOCAL STORAGE
========================================================================== */
function getTodosFromLocalStorage() {
  //  state.tasks = JSON.parse(localStorage.getItem("tasks")) ?? []; // load tasks from localStorage OR set a new array

  fetch("http://localhost:4730/todos")
    .then((res) => res.json())
    .then((todosFromApi) => {
      state.tasks = todosFromApi;
      console.log(state.tasks);
      render();
    });
}

/*    FUNCTION - SAVE TODOS TO LOCAL STORAGE
========================================================================== */
function saveTodosToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(state.tasks)); // save to localStorage
  currentTaskCount();
}

/*    FUNCTION - GENERATE HTML TEMPLATE
========================================================================== */
function generateTodoItemTemplate(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");

  const div = document.createElement("div");
  div.classList.add("checkbox-wrapper");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkbox-toogle-" + task.id;
  checkbox.classList.add("toggle-complete");

  checkbox.checked = task.isDone; // set "checked" attribut based on task.isDone

  // Event-Listener für das Ändern des Checkbox-Status hinzufügen
  checkbox.addEventListener("change", function () {
    task.isDone = checkbox.checked;

    if (checkbox.checked) {
      checkbox.setAttribute("checked", "");
    } else {
      checkbox.removeAttribute("checked");
    }
    saveTodosToLocalStorage();
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
      // if field is NOT clear update state
      state.tasks.push({
        id: new Date().getTime(), // get time for create an id
        description: input.value.trim(), // get input field, trim whitespaces before and after
        isDone: false, // set complete status to false
      });

      // Render state
      render();

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
  if (confirm("Do you really want to delete the complete list?")) {
    state.tasks = state.tasks.filter((task) => !task.isDone);
    saveTodosToLocalStorage(); // save to localStorage after filtering
    render();
  }
});

/*    FUNCTION - DISPLAY
========================================================================== */
function display() {
  taskList.innerHTML = ""; // clear taskList

  // Filter
  const filteredTodos = tasks.filter((task) => {
    if (currentFilter == "done") {
      return task.isDone; // set task to isDone
    }
    if (currentFilter == "open") {
      return !task.isDone; // set task to NOT isDone
    }
    return true; // unfiltered tasks
  });

  // Building list element with for each
  filteredTodos.forEach(function (task) {
    const listItem = document.createElement("li"); // create list element
    listItem.setAttribute("id", task.id); // add id to list element
    listItem.classList.add("task-item"); // add task-item class to list element
    listItem.innerHTML = `
    <div class="checkbox-wrapper">
      <input type="checkbox" name="is-done" class="toggle-complete" id="checkbox-${
        task.id
      }" ${task.isDone ? "checked" : ""}>
      <label for="checkbox-${task.id}">${task.description}</label>
      </div>
      <button class="delete-task" id="${task.id}">X</button>
    `; // add HTML template with the complete list item, checkbox, label, delete Button

    taskList.append(listItem); // append to UL List
  });

  // EVENTLISTENER - CHECKBOXES
  const checkboxes = document.querySelectorAll(".toggle-complete"); // get all checkboxes
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const taskId = parseInt(checkbox.id.replace("checkbox-", "")); // remove checkbox prefix
      const currentTask = tasks.find((task) => task.id === taskId); // find in tasks the current Task by compare the IDs

      // Änderungen für Checkboxen
      currentTask.isDone = checkbox.checked; // set current Task to the checked checkbox

      onStateChange(); // save in localStorage and update the display
    });
  });

  /*    EVENT-LISTENER - REMOVE BUTTON
========================================================================== */
  const deleteButtons = document.querySelectorAll(".delete-task");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.id; // Get id of the currently clicked "delete" button and save it to taskId
      tasks = tasks.filter((removeTask) => removeTask.id !== parseInt(taskId)); // filter tasks array, keeping only tasks whose id is not equal to the clicked buttons id

      localStorage.setItem("tasks", JSON.stringify(tasks)); // save tasks to localStorage
      document.getElementById(taskId).remove(); // delete choosen ID from DOM
    });
  });
}

/*    FUNCTION - ON STAGE (SAVE + DISPLAY WRAPPER)
========================================================================== */
function onStateChange() {
  //    Save to localstorage
  localStorage.setItem("tasks", JSON.stringify(tasks)); // save to localStorage
  display();
  currentTaskCount();
}

/*    COUNT OPEN TASK - FUNCTION
========================================================================== */

function currentTaskCount() {
  const openTasks = state.tasks.filter((task) => !task.isDone); // filter all tasks, if not isDone

  if (openTasks.length > 0) {
    claim.textContent = `Getting ${openTasks.length} things done…`; // update frontend claim
  } else {
    claim.textContent = `Great, all tasks are completed!`;
  }
}

/*    FUNCTION - RENDER DATA FROM STATE
========================================================================== */
function render() {
  taskList.innerHTML = "";

  // Filtering
  const filteredTodos = state.tasks.filter((task) => {
    if (state.currentFilter == "done") {
      return task.isDone; // set task to isDone
    }
    if (state.currentFilter == "open") {
      return !task.isDone; // set task to NOT isDone
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
      const taskId = buttonId.replace("delete-btn-", ""); // extract the id

      state.tasks = state.tasks.filter(
        (removeTask) => removeTask.id !== parseInt(taskId)
      );
      saveTodosToLocalStorage(); // save to localStorage
      render();
      const listItem = document.getElementById(taskId).closest(".task-item");
      listItem.remove(); // delete entire <li> element
    });
  });

  saveTodosToLocalStorage();
}

/*    FUNCTION - GET TODOS AND RENDER
========================================================================== */
function initialize() {
  getTodosFromLocalStorage();
  render();
  currentTaskCount();
}

initialize();
