import { format } from "date-fns";

function formatDate(date: Date) {
  return format(date, "EEE d MMM");
}

export const TodoMapper = ({ todoss, taskCompleted }) => {
  return (
    <div>
      {todoss.map((todo) => (
        <div className="todo">
          {Object.keys(todo)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((key) => {
              return (
                <div>
                  <h3>
                    {new Date() == new Date(key) ? (
                      "Today"
                    ) : (
                      <>
                        <span style={{ fontWeight: "bold" }}>
                          {" "}
                          {formatDate(new Date(key)).split(" ")[0]}
                        </span>
                        <span style={{ color: "grey" }}>
                          {" "}
                          {formatDate(new Date(key)).split(" ")[1]}{" "}
                          {formatDate(new Date(key)).split(" ")[2]}
                        </span>
                      </>
                    )}
                  </h3>
                  {todo[key].map((todo) => {
                    return (
                      <div className="taskRuler" style={{ padding: "1em" }}>
                        <div style={{ display: "inline" }}>
                          <input
                            type="radio"
                            className = "todochecker"
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
    </div>
  );
};

export const OverdueMapper = ({ overdue, taskCompleted }) => {
  return (
    <div>
      {overdue.length
        ? overdue.map((todo) => (
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
                                onClick={() =>
                                  taskCompleted(todo.date, todo.id)
                                }
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
          ))
        : null}
    </div>
  );
};
