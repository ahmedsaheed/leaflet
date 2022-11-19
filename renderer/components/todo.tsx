import React, { useEffect } from "react";
import "react-day-picker/dist/style.css";
import { TodoMapper } from "./todomapper";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ADDIcon, TAGIcon, CALENDARIcon } from "./icons";
export default function Todo() {
  const [overDue, setOverDue] = React.useState([]);
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

  type newTodo = {
    [key: string]: Todo[];
  };

  function handleAddTodoClick() {
    setIsAddingTodo(true);
  }
  function clearLocalStorage() {
    localStorage.clear();
  }

  function taskCompleted(date: Date, id: string) {
    setTimeout(() => {
      let todos = JSON.parse(localStorage.getItem("todos") || "[]");
      todos.forEach((todos) => {
        Object.keys(todos).forEach((key) => {
          todos[key].forEach((todo) => {
            if (todo.id === id) {
              const index = todos[key].indexOf(todo);
              todos[key].splice(index, 1);
              if (todos[key].length === 0) {
                delete todos[key];
              }
            }
          });
        });
      });
      localStorage.setItem("todos", JSON.stringify(todos));
      handleTodoState();
    }, 10000);
  }

  function setAllToDefault() {
    setTask("");
    setDescription("");
    setTags([]);
    setSelectedDate(null);
    setIsOpeningCalendar(false);
    setIsAddingTodo(false);
  }
  const addNewTodo = () => {
    const todo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      task,
      description,
      date: selectedDate ? selectedDate : new Date(),
      tags,
      completed: false,
    };

    const newTodo: newTodo = {
      [selectedDate ? selectedDate.toString() : new Date().toString()]: [todo],
    };

    let todos = JSON.parse(localStorage.getItem("todos") || "[]");
    if (todos == null) {
      todos = [];
    }
    const dateExists = todos.find(
      (todo) =>
        todo[selectedDate ? selectedDate.toString() : new Date().toString()]
    );
    if (dateExists) {
      dateExists[selectedDate.toString()].push(todo);
    } else {
      todos.push(newTodo);
    }
    localStorage.setItem("todos", JSON.stringify(todos));
    setIsAddingTodo(false);
    setAllToDefault();
    handleTodoState();
  };
  function handleTodoState() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const overdue = todos.filter(
      (todo) =>
        new Date(Object.keys(todo).toString()) < new Date() &&
        new Date(Object.keys(todo).toString()) != new Date()
    );
    setOverDue(overdue);
    const notOverdue = todos.filter(
      (todo) => new Date(Object.keys(todo).toString()) >= new Date()
    );
    setTodos(notOverdue);
  }

  useEffect(() => {
    handleTodoState();
  }, []);

  useEffect(() => {
    document.onkeydown = function listenToKeys(e) {
      if (isAddingTodo && e.key == "Escape") {
        setIsAddingTodo(false);
      }
    };
  }, [isAddingTodo]);

  function formatDate(date: Date) {
    return format(date, "EEE MMM d");
  }

  return (
    <div>
      <style>{`.rdp-cell { border: none }`}</style>
      <style>{`.rdp-head_cell{ border: none }`}</style>
      <div></div>

      {!todos.length && !overDue.length && !isAddingTodo ? (
        // Tailwind put h1 in mid of screen
        <div
        // style={{
        //     height: "100vh !important",
        //     minHeight: "100vh !important",
        //     backgroundColor: "#f5f5f5",
        // }}
        >
          <h1
            style={{
              // Tailwind put h1 in mid of screen
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#a0aec0",
            }}
            className="text-gray-500"
          >
            All caught up!
          </h1>
        </div>
      ) : null}

      {overDue.map((todo) => (
        <div className="todo">
          {Object.keys(todo)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((key) => {
              return (
                <div style={{}}>
                  <h3>{formatDate(new Date(key))}</h3>
                  {todo[key].map((todo) => {
                    return (
                      <div className="taskRuler" style={{ padding: "1em" }}>
                        <div style={{ display: "inline" }}>
                          <input
                            type="radio"
                            onClick={() => taskCompleted(todo.date, todo.id)}
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
                            {todo.tags?.length ? (
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
                                  <span
                                    style={{
                                      display: "inline",
                                      color: "grey",
                                      marginLeft: "2px",
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      ))}

      {}
      <TodoMapper
        todoss={todos}
        taskCompleted={(date, id) => taskCompleted(date, id)}
      />

      {!isAddingTodo && (
        <div style={{ padding: "1em" }}>
          <button
            onClick={handleAddTodoClick}
            style={{
              alignItems: "center",
              color: "grey",
            }}
          >
            <ADDIcon />
            &nbsp;Add Task
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
                    <hr />
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
                    <CALENDARIcon />{" "}
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
                    <button>
                      <TAGIcon />
                      &nbsp;tags
                    </button>
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
              disabled={!task}
              onClick={addNewTodo}
            >
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
