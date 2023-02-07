import fs from "fs-extra";
import { MARKDOWNIcon } from "./icons";
import ContextMenuDemo from "./context-menu";
import React, { useState, useLayoutEffect, Dispatch, SetStateAction } from "react";
import Tree from "../lib/Tree/Tree.js";
type Structure = { [key: string]: any };
type Dispatcher<S> = Dispatch<SetStateAction<S>>;

 function convertObject(obj: Structure): Array<{}> {
  const struct: Array<{}> = [];
  for (let key in obj) {
    for (let i = 0; i < obj[key].length; i++) {
      let node = obj[key][i];
      if (node?.children) {
        if (node?.name !== "undefined" && node?.name !== undefined) {
          struct.push({
            type: "folder",
            name: node.name,
            files: convertObject(node),
          });
        }
      } else {
        if (node?.name !== "undefined" && node?.name !== undefined) {
          struct.push({
            type: "file",
            name: node.name,
            path: node.path,
          });
        }
      }
    }
  }
  return struct;
}



export function FileTrees ({
  structures,
  onNodeClicked,
}: {
  structures: Structure;
  onNodeClicked: (path: string, name:string) => void;
}
 ) {
  let [data, setData] = useState<Array<{}>>([]);
  React.useEffect(() => {
    const incoming = convertObject({structures});
    setData(incoming);
  }, [structures]);

const handleClick = (node) => {
    if (node.node.type === "file") {
    let path = node.node?.path;
    let name = node.node?.name; 
    const value = fs.readFileSync(path, "utf8");
    onNodeClicked(path, name)
      }
  };
  const handleUpdate = (state) => {
    localStorage.setItem(
      "tree",
      JSON.stringify(state, function (key, value) {
        if (key === "parentNode" || key === "id") {
          return null;
        }
        return value;
      })
    );
  };

  return (
    //@ts-ignore
    <Tree
      // children={null}
      data={data}
      onUpdate={handleUpdate}
      onNodeClick={(node) => {handleClick(node)}}
    />
  );
}

export function FileTree({
  struct,
  parentDirClick,
  path,
  fileNameBox,
  onFileTreeClick,
  creatingFileOrFolder,
  isCreatingFolder,
  setFileName,
  onDelete,
  toPDF,
  toDOCX,
}) {
  return (
    <div
      id="fileTree"
      className="fileBody"
      style={{
        marginTop: "0.2vh",
        marginBottom: "2vh",
        maxHeight: "70vh",
        overflow: "hidden",
        outline: "none",
        overflowY: "scroll",
        textOverflow: "ellipsis",
      }}
    >
      {struct
        .map((file, index) =>
          file.children ? (
            !fs.existsSync(file.path) ? null : !fs.readdirSync(file.path)
                .length ? null : (
              <details key={index} tabIndex={-1}>
                <summary
                  className="files greys"
                  style={{
                    outline: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginLeft: "1em",
                  }}
                  onClick={() => {
                    parentDirClick(file.path);
                  }}
                >
                  {" "}
                  {file.name.charAt(0).toUpperCase() + file.name.slice(1)}
                </summary>
                {file.children.map((child, index) =>
                  !fs.existsSync(child.path) ? null : fs
                      .statSync(child.path)
                      .isDirectory() ? (
                    !fs.readdirSync(child.path).length ? null : (
                      <div
                        style={{
                          marginLeft: "1.8em",
                        }}
                      >
                        <details key={index} tabIndex={-1}>
                          <summary
                            className="files greys"
                            style={{
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              maxWidth: "100%",
                              outline: "none",
                              textOverflow: "ellipsis",
                            }}
                            onClick={() => {
                              parentDirClick(file.path);
                            }}
                          >
                            {" "}
                            {child.name.charAt(0).toUpperCase() +
                              child.name.slice(1)}
                          </summary>
                          {child.children
                            .map((child, index) => (
                              <ol
                                className={
                                  path === child.path && !fileNameBox
                                    ? "selected files"
                                    : "greys files"
                                }
                                onClick={() => {
                                  onFileTreeClick(child.path, child.name);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                <button
                                  style={{
                                    marginLeft: "0.2em",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    outline: "none",
                                  }}
                                  tabIndex={-1}
                                >
                                  <ContextMenuDemo
                                    nameToDisplay={child.name.slice(0, -3)}
                                    handleDelete={() => {
                                      onDelete(child.path, child.name);
                                    }}
                                    toPDF={() => {
                                      toPDF(
                                        fs.readFileSync(child.path, "utf8"),
                                        file.name
                                      );
                                    }}
                                    toDOCX={() => {
                                      toDOCX(
                                        fs.readFileSync(child.path, "utf8"),
                                        file.name
                                      );
                                    }}
                                  />
                                </button>
                              </ol>
                            ))
                            .sort((a, b) => {
                              if (a.props.children[0]?.props.children[1]) {
                                return -1;
                              } else {
                                return 1;
                              }
                            })}
                        </details>
                      </div>
                    )
                  ) : (
                    <ol
                      className={
                        path === child.path && !fileNameBox
                          ? "selected files"
                          : "greys files"
                      }
                      onClick={() => {
                        onFileTreeClick(child.path, child.name);
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <button
                        style={{
                          marginLeft: "1.8em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          maxWidth: "100%",
                          outline: "none",
                        }}
                        tabIndex={-1}
                      >
                        <ContextMenuDemo
                          nameToDisplay={child.name.slice(0, -3)}
                          handleDelete={() => {
                            onDelete(child.path, child.name);
                          }}
                          toPDF={() => {
                            toPDF(
                              fs.readFileSync(child.path, "utf8"),
                              file.name
                            );
                          }}
                          toDOCX={() => {
                            toDOCX(
                              fs.readFileSync(child.path, "utf8"),
                              file.name
                            );
                          }}
                        />
                      </button>
                    </ol>
                  )
                )}
              </details>
            )
          ) : (
            <>
              <ol
                className={
                  path === file.path && !fileNameBox
                    ? "files selected"
                    : "files greys"
                }
                onClick={() => {
                  onFileTreeClick(file.path, file.name);
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                <button tabIndex={-1} style={{ outline: "none" }}>
                  <ContextMenuDemo
                    nameToDisplay={file.name.slice(0, -3)}
                    handleDelete={() => {
                      onDelete(file.path, file.name);
                    }}
                    toPDF={() => {
                      toPDF(fs.readFileSync(file.path, "utf8"), file.name);
                    }}
                    toDOCX={() => {
                      toDOCX(fs.readFileSync(file.path, "utf8"), file.name);
                    }}
                  />
                </button>
              </ol>
            </>
          )
        )
        .sort((a, b) => {
          if (a?.props?.children[0]?.props?.children[1]) {
            return -1;
          } else {
            return 1;
          }
        })}

      {fileNameBox ? (
        <form
          className="files greys selected"
          onSubmit={() => {
            creatingFileOrFolder();
          }}
        >
          <input
            autoFocus
            className="createFile"
            type="text"
            placeholder={isCreatingFolder ? "Folder Name" : "File Name"}
            onChange={(e) => setFileName(e.target.value)}
          />
        </form>
      ) : null}
    </div>
  );
}

const DirectoryComponent = ({
  file,
  parentDirClick,
  path,
  fileNameBox,
  onFileTreeClick,
  onDelete,
  toPDF,
  toDOCX,
}) => {
  return (
    <>
      {file.children ? (
        !fs.existsSync(file.path) ? null : !fs.readdirSync(file.path)
            .length ? null : (
          <details tabIndex={-1}>
            <summary
              className="files greys"
              style={{
                outline: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                marginLeft: "1em",
              }}
              onClick={() => {
                parentDirClick(file.path);
              }}
            >
              {" "}
              {file.name.charAt(0).toUpperCase() + file.name.slice(1)}
            </summary>
            {file.children.map((child, index) =>
              !fs.existsSync(child.path) ? null : fs
                  .statSync(child.path)
                  .isDirectory() ? (
                !fs.readdirSync(child.path).length ? null : (
                  <div
                    style={{
                      marginLeft: "1.8em",
                    }}
                  >
                    <details key={index} tabIndex={-1}>
                      <summary
                        className="files greys"
                        style={{
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          maxWidth: "100%",
                          outline: "none",
                          textOverflow: "ellipsis",
                        }}
                        onClick={() => {
                          parentDirClick(file.path);
                        }}
                      >
                        {" "}
                        {child.name.charAt(0).toUpperCase() +
                          child.name.slice(1)}
                      </summary>
                      <FileComponents
                        parentDirClick={() => {
                          parentDirClick(file.path);
                        }}
                        file={child}
                        path={path}
                        fileNameBox={fileNameBox}
                        toPDF={() => {
                          toPDF(fs.readFileSync(child.path, "utf8"), file.name);
                        }}
                        toDOCX={() => {
                          toDOCX(
                            fs.readFileSync(child.path, "utf8"),
                            file.name
                          );
                        }}
                        onFileTreeClick={() => {
                          onFileTreeClick(child.path, child.name);
                        }}
                        onDelete={() => {
                          onDelete(child.path, child.name);
                        }}
                      />

                      {/*

                      child.children
                        .map((child, index) => (
                          <ol
                            className={
                              path === child.path && !fileNameBox
                                ? "selected files"
                                : "greys files"
                            }
                            onClick={() => {
                              onFileTreeClick(child.path, child.name);
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <button
                              style={{
                                marginLeft: "0.2em",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                outline: "none",
                              }}
                              tabIndex={-1}
                            >
                              <ContextMenuDemo
                                nameToDisplay={child.name.slice(0, -3)}
                                handleDelete={() => {
                                  onDelete(child.path, child.name);
                                }}
                                toPDF={() => {
                                  toPDF(
                                    fs.readFileSync(child.path, "utf8"),
                                    file.name
                                  );
                                }}
                                toDOCX={() => {
                                  toDOCX(
                                    fs.readFileSync(child.path, "utf8"),
                                    file.name
                                  );
                                }}
                              />
                            </button>
                          </ol>
                        ))
                        .sort((a, b) => {
                          if (a.props.children[0]?.props.children[1]) {
                            return -1;
                          } else {
                            return 1;
                          }
                        })
        
                        */}
                    </details>
                  </div>
                )
              ) : (
                <FileComponents
                  parentDirClick={() => {
                    parentDirClick(file.path);
                  }}
                  file={child}
                  path={path}
                  fileNameBox={fileNameBox}
                  toPDF={() => {
                    toPDF(fs.readFileSync(child.path, "utf8"), file.name);
                  }}
                  toDOCX={() => {
                    toDOCX(fs.readFileSync(child.path, "utf8"), file.name);
                  }}
                  onFileTreeClick={() => {
                    onFileTreeClick(child.path, child.name);
                  }}
                  onDelete={() => {
                    onDelete(child.path, child.name);
                  }}
                />
              )
            )}
          </details>
        )
      ) : null}
    </>
  );
};

const FileComponents = ({
  file,
  path,
  fileNameBox,
  onFileTreeClick,
  onDelete,
  toPDF,
  toDOCX,
  parentDirClick,
}) => {
  return (
    <>
      <ol
        className={
          path === file.path && !fileNameBox ? "files selected" : "files greys"
        }
        onClick={onFileTreeClick}
        style={{
          cursor: "pointer",
        }}
      >
        <button tabIndex={-1} style={{ outline: "none" }}>
          <ContextMenuDemo
            nameToDisplay={file.name.slice(0, -3)}
            handleDelete={onDelete}
            toPDF={toPDF}
            toDOCX={toDOCX}
          />
        </button>
      </ol>
    </>
  );
};
