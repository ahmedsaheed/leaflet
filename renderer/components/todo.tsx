import React, { useEffect } from "react";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import {ADDIcon} from "./icons"
export default function Todo() {
  const [todos, setTodos] = React.useState([]);
  const [task, setTask] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [tags, setTags] = React.useState([]);
  const [isAddingTodo, setIsAddingTodo] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isOpeningCalendar, setIsOpeningCalendar] =
    React.useState<boolean>(false);
  type Todo = {
    id: string;
    task: string;
    description: string;
    date: Date;
    tags: string[];
    completed: boolean;
  };

  function handleAddTodoClick() {
    setIsAddingTodo(true);
}
  function clearLocalStorage() {
    localStorage.clear();
  }

  function addDate() {
    return (
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
    );
  }

  function taskCompleted(id: string) {
    const newArray = todos.filter((todo) => todo.id !== id);
    setTodos(newArray);
    localStorage.setItem("todos", JSON.stringify(newArray));
  }
  function addTask() {
    const todo: Todo = {
      id: Math.random().toString(36).substr(2, 9).toString(),
      task: task,
      description: description,
      date: selectedDate ? selectedDate : new Date(),
      tags: tags,
      completed: false,
    };
    let todos = JSON.parse(localStorage.getItem("todos") || "[]");
    if (todos == null) {
      todos = [];
    }
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    setIsAddingTodo(false);
    setAllToDefault();
    setTodos(JSON.parse(localStorage.getItem("todos") || "[]"));
  }

  function setAllToDefault() {
    setTask("");
    setDescription("");
    setTags([]);
    setSelectedDate(null);
    setIsOpeningCalendar(false);
    setIsAddingTodo(false);
  }

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    setTodos(todos);
  }, []);

  function formatDate(date: Date) {
    return format(date, "EEE MMM d");
  }

  return (
    <div>
      <style>{`.rdp-cell { border: none }`}</style>
      <style>{`.rdp-head_cell{ border: none }`}</style>
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
            <p style={{display: "inline" }}>
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
              <p
                style={{
                  color: "grey",

                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  width: "90%",
                }}
              >
                This call must be made as sooon as possible. Thanks for your
                help
              </p>

              <p
                style={{
                  color: "grey",

                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  width: "90%",
                }}
              >
                This call must be made as sooon as possible. Thanks for your
                help
              </p>
            </div>
          </div>
        </div>
      ) : (
        todos.map((todo) =>
          todo.completed ? null : (
            <div style={{ borderBottom: "1px solid gray", padding: "1em" }}>
              <div style={{ display: "inline" }}>
                <input
                  type="radio"
                  onClick={() => taskCompleted(todo.id)}
                ></input>
              </div>
              <div
                style={{
                  display: "inline",
                  marginLeft: "1.2em",
                  lineHeight: "10px",
                }}
              >
                <p
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "90%",
                    display: "inline",
                  }}
                >
                  {todo.task}
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
                  {todo.description ? (
                    <p
                      style={{
                        margin: "0",
                        paddingLeft: "6px",
                        color: "grey",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "90%",
                      }}
                    >
                      {todo.description}
                    </p>
                  ) : null}
                  {todo.tags.length ? (
                    <p
                      style={{
                        color: "grey",
                        margin: "0",
                        paddingLeft: "6px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "90%",
                      }}
                    >
                      {todo.tags.map((tag) => (
                        <span style={{ display : "inline", color: "grey" , marginLeft: "2px"}}>{tag}</span>
                      ))}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )
        )
      )}

      {!isAddingTodo && (
        <div style={{ padding: "1em" }}>
          <button
            onClick={handleAddTodoClick}
            style={{
              alignItems: "center",
              color: "grey",
            }}
          >
            <ADDIcon/>&nbsp;Add Task
          </button>
        </div>
      )}

      {isAddingTodo && (
        <div id="todo-container" style={{ paddingTop: "0.6em" }}>
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

                {isOpeningCalendar && (
                <>
                <hr/>
                  <DayPicker
                    styles={{
                      table: {
                        border: "none",
                      },
                    }}
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                  </>
                )}
                <div>
                  <div
                    role="button"
                    onClick={() => setIsOpeningCalendar(!isOpeningCalendar)}
                    style={{
                      userSelect: "none",
                      display: "inline",
                      border: "1px solid grey",
                      borderRadius: "5px",
                      height: "28px",
                      width: "fit-content",
                      padding: "2px 8px",
                      alignItems: "center",
                    }}
                  >
                    {selectedDate ? formatDate(selectedDate) : "Today"}
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
              onClick={() => {
                setIsAddingTodo(false);
                setAllToDefault();
              }}
              style={{
                marginRight: "1em",
                border: "1px somid transparent",
                borderRadius: "5px",
                outline: "none",
                padding: "0 12px",
                height: "32px",

              }}
              className="cancel"
            >
              Cancel
            </button>
            <button 

              style={{
                marginRight: "1em",
                border: "1px somid transparent",
                borderRadius: "5px",
                outline: "none",
                padding: "0 12px",
                height: "32px",

              }}
              className="cancel"
            disabled={!task} onClick={addTask}>
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
