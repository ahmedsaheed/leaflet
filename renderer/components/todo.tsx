import React, { useEffect } from "react";
import { format } from "date-fns";

export default function Todo() {
  const [todos, setTodos] = React.useState([]);
  const [task, setTask] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [tags, setTags] = React.useState([]);
  const [form, setForm] = React.useState(false);
  type Todo = {
    task: string;
    description: string;
    date: Date;
    tags: string[];
  };

  function handleClick() {
    console.log("hi");
    setForm(true);
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
    setForm(false);
    setAllToDefault();
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

      {todos.map((todo) => (
        <div
         style={{borderBottom: "1px solid gray", padding: "1em"}}
        >
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
                marginLeft: "2em",
              }}
            >
              <p style={{ color: "grey" }}>
                This call must be made as sooon as possible. Thanks for your
                help {todo.description}
              </p>

              <p style={{ color: "grey" }}>
                This call must be made as sooon as possible. Thanks for your
                help
                {todo.tags.map((tag) => (
                    <span style={{ color: "grey" }}>{tag}</span>
                    ))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
