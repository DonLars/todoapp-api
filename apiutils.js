const apiUrl = "http://localhost:4730/todos";

/* FUNCTION - to get todos from the API*/

export function fetchData(path = "", options = {}) {
  return fetch(apiUrl + path, options).then((response) => response.json());
}

export function postData(newTodo) {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  };
  return fetchData("", options);
  //return fetch(apiUrl + path, options).then((response) => response.json());
}
/* 
export function deleteAllData(newTodo) {
  Promise.all(
    doneTodos.map((doneTodo) =>
      fetch(apiUrl + `/${doneTodo.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
    )
  );
}
 */
