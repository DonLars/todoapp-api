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

/* FUNCTION - LOAD TODOS FROM API ====================================== */

function getTodosFromApi() {
  state.tasks = JSON.parse(localStorage.getItem("tasks")) ?? []; // load tasks from localStorage OR set a new array
  /* fetch(apiUrl)
    .then((response) => response.json())
    .then((todosFromApi) => {
      state.tasks = todosFromApi;
      //console.log(state.tasks);
      render();
    })
    .catch((error) => {
      console.error("Error getting todos from API:", error);
    }); */
}

/*    FUNCTION - SAVE TODOS TO LOCAL STORAGE
========================================================================== */
function saveTodosToApi() {
  localStorage.setItem("tasks", JSON.stringify(state.tasks)); // save to localStorage

  /*   const newTodoText = "test";
  const newTodo = {
    description: newTodoText,
    done: false,
  }; */
  /* fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })
    .then((res) => res.json())
    .then((newTodoFromApi) => {
      state.tasks.push(input.value);
      render();
    })
    .catch((error) => {
      console.error("Error saving todo to API:", error);
    }); */
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

  checkbox.checked = task.isDone; // set "checked" attribut based on task.isDone

  // Event-Listener für das Ändern des Checkbox-Status hinzufügen
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
  if (confirm("Do you really want to delete the complete list?")) {
    state.tasks = state.tasks.filter((task) => !task.isDone);
    saveTodosToApi(); // save to localStorage after filtering
    render();
  }
});

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
      const taskId = buttonId.replace("delete-btn-", ""); // extract the ID

      // Filter out the task with the specified ID from the state
      state.tasks = state.tasks.filter(
        (removeTask) => removeTask.id !== parseInt(taskId)
      );
      saveTodosToApi(); // Save changes to the API
      render();

      const listItem = document.getElementById("task-" + taskId);
      listItem.remove(); // remove the entire <li> element
    });
  });
}

/*    FUNCTION - GET TODOS AND RENDER
========================================================================== */
function initialize() {
  getTodosFromApi();

  // Add a default "placeholderTodo" if there are no tasks in localStorage
  if (state.tasks.length === 0 && localStorage.getItem("tasks") === null) {
    const placeholderTodo = {
      id: new Date().getTime(),
      description: "Start your first task 😜",
      isDone: false,
    };
    state.tasks.push(placeholderTodo);
    saveTodosToApi();
  }

  render();
}
