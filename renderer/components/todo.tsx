import React, { useEffect } from "react";
import { format } from "date-fns";

export default function Todo() {
  const [todos, setTodos] = React.useState([]);
  const [task, setTask] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [tags, setTags] = React.useState([]);
  const [isAddingTodo, setIsAddingTodo] = React.useState(false);
  type Todo = {
    task: string;
    description: string;
    date: Date;
    tags: string[];
  };

  function handleAddTodoClick() {
    setIsAddingTodo(true);
  }

  function clearLocalStorage() {
    localStorage.clear();
  }
  function addTask() {
    const todo: Todo = {
      task: task,
      description: description,
      date: new Date(),
      tags: tags,
    };
    let todos = JSON.parse(localStorage.getItem("todos") || "[]");
    if (todos == null) {
      todos = [];
    }
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    setIsAddingTodo(false);
    setAllToDefault();
    // refresh todos
    setTodos(JSON.parse(localStorage.getItem("todos") || "[]"));
  }

  function setAllToDefault() {
    setTask("");
    setDescription("");
    setTags([]);
  }

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    setTodos(todos);
  }, []);

  function formatDate(date: Date) {
    console.log(date);
    return format(date, "EEE MMM d");
  }

  return (
    <div>
      <div>
        <h1>
          Today&nbsp;
          <span
            style={{ display: "inline", fontSize: "0.8rem", color: "gray" }}
          >
            {formatDate(new Date())}
          </span>
        </h1>
      </div>

      {!todos.length ? (
        <div style={{ borderBottom: "1px solid gray", padding: "1em" }}>
          <div style={{ display: "inline" }}>
            <input type="radio" onClick={() => console.log("hi mom")}></input>
          </div>
          <div
            style={{
              display: "inline",
              marginLeft: "1.2em",
              lineHeight: "10px",
            }}
          >
            <p style={{ color: "white", display: "inline" }}>
              Add Education Stack
            </p>
            <div style={{ float: "right", color: "grey" }}>
              <span style={{ marginRight: "1rem" }}>a</span>
              <span>b</span>
            </div>
            <div
              style={{
                fontSize: "12px",
                marginLeft: "2em",
              }}
            >
              <p style={{ color: "grey" }}>
                This call must be made as sooon as possible. Thanks for your
                help
              </p>

              <p style={{ color: "grey" }}>
                This call must be made as sooon as possible. Thanks for your
                help
              </p>
            </div>
          </div>
        </div>
      ) : (
        todos.map((todo) => (
          <div style={{ borderBottom: "1px solid gray", padding: "1em" }}>
            <div style={{ display: "inline" }}>
              <input type="radio" onClick={() => console.log("hi mom")}></input>
            </div>
            <div
              style={{
                display: "inline",
                marginLeft: "1.2em",
                lineHeight: "10px",
              }}
            >
              <p style={{ color: "white", display: "inline" }}>
                Add Education Stack {todo.task}
              </p>
              <div style={{ float: "right", color: "grey" }}>
                <span style={{ marginRight: "1rem" }}>a</span>
                <span>b</span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  marginLeft: "2em",
                }}
              >
                <p style={{ color: "grey",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "90%",
                }}>
                  This call must be made as sooon as possible. Thanks for your
                  help {todo.description}
                </p>

                <p style={{ color: "grey", 

                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "90%",
                }}>
                  This call must be made as sooon as possible. Thanks for your
                  help
                  {todo.tags.map((tag) => (
                    <span style={{ color: "grey" }}>{tag}</span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        ))
      )}

      {!isAddingTodo && (
        <div style={{ padding: "1em" }}>
          <button
            onClick={handleAddTodoClick}
            style={{
              color: "grey",
            }}
          >
            Add Task
          </button>
        </div>
      )}

      {isAddingTodo && (
        <div style={{ paddingTop: "0.6em" }}>
          <div
            style={{
              border: "1px solid grey",
              borderRadius: "10px",
            }}
          >
            <form>
              <div style={{ padding: "1em" }}>
                <input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Task"
                  style={{
                    border: "none",
                    width: "100%",
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                ></input>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  style={{
                    marginTop: "0.7em",
                    border: "none",
                    width: "100%",
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                ></textarea>

                <div>
                  <div
                    style={{
                      display: "inline",
                      border: "1px solid grey",
                      borderRadius: "5px",
                      height: "28px",
                      width: "fit-content",
                      padding: "2px 8px",
                      alignItems: "center",
                    }}
                  >
                    Today
                  </div>
                  <div
                    style={{
                      display: "inline",
                      height: "28px",

                      alignItems: "center",
                      float: "right",
                    }}
                  >
                    tags
                  </div>
                </div>
              </div>
            </form>
          </div>
<div
    style={{
        float: "right",
        paddingTop: "1em",
    }}
>
     <button
        onClick={() =>{ 
        setIsAddingTodo(false);
        setAllToDefault();
        }}
        style={{
            marginRight: "1em"}}
     >Cancel</button>
     <button
        disabled={!task}
        onClick={addTask}
     >Add Task</button>
     </div>
     </div>
      )}
    </div>
  );
}
