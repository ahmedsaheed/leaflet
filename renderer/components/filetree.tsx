import fs from "fs";
import { MARKDOWNIcon } from "./icons";
import ContextMenuDemo from "./context-menu";
import React from "react";

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
      {/* {file.children ? (
        <DirectoryComponent
          file={file}
          parentDirClick={parentDirClick}
          path={path}
          fileNameBox={fileNameBox}
          onFileTreeClick={onFileTreeClick}
          onDelete={onDelete}
          toPDF={toPDF}
          toDOCX={toDOCX}
        />
      ) :
       ( */}
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

// file.children ? (
//   !fs.existsSync(file.path) ? null : !fs.readdirSync(file.path)
//       .length ? null : (
//     <details key={index} tabIndex={-1}>
//       <summary
//         className="files greys"
//         style={{
//           outline: "none",
//           cursor: "pointer",
//           fontSize: "12px",
//           fontWeight: "bold",
//           marginLeft: "1em",
//         }}
//         onClick={() => {
//           parentDirClick(file.path);
//         }}
//       >
//         {" "}
//         {file.name.charAt(0).toUpperCase() + file.name.slice(1)}
//       </summary>
//       {file.children.map((child, index) =>
//         !fs.existsSync(child.path) ? null : fs
//             .statSync(child.path)
//             .isDirectory() ? (
//           !fs.readdirSync(child.path).length ? null : (
//             <div
//               style={{
//                 marginLeft: "1.8em",
//               }}
//             >
//               <details key={index} tabIndex={-1}>
//                 <summary
//                   className="files greys"
//                   style={{
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     maxWidth: "100%",
//                     outline: "none",
//                     textOverflow: "ellipsis",
//                   }}
//                   onClick={() => {
//                     parentDirClick(file.path);
//                   }}
//                 >
//                   {" "}
//                   {child.name.charAt(0).toUpperCase() +
//                     child.name.slice(1)}
//                 </summary>
//                 {child.children
//                   .map((child, index) => (
//                     <ol
//                       className={
//                         path === child.path && !fileNameBox
//                           ? "selected files"
//                           : "greys files"
//                       }
//                       onClick={() => {
//                         onFileTreeClick(child.path, child.name);
//                       }}
//                       style={{
//                         cursor: "pointer",
//                       }}
//                     >
//                       <button
//                         style={{
//                           marginLeft: "0.2em",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           outline: "none",
//                         }}
//                         tabIndex={-1}
//                       >
//                         <ContextMenuDemo
//                           nameToDisplay={child.name.slice(0, -3)}
//                           handleDelete={() => {
//                             onDelete(child.path, child.name);
//                           }}
//                           toPDF={() => {
//                             toPDF(
//                               fs.readFileSync(child.path, "utf8"),
//                               file.name
//                             );
//                           }}
//                           toDOCX={() => {
//                             toDOCX(
//                               fs.readFileSync(child.path, "utf8"),
//                               file.name
//                             );
//                           }}
//                         />
//                       </button>
//                     </ol>
//                   ))
//                   .sort((a, b) => {
//                     if (a.props.children[0]?.props.children[1]) {
//                       return -1;
//                     } else {
//                       return 1;
//                     }
//                   })}
//               </details>
//             </div>
//           )
//         ) : (
//           <ol
//             className={
//               path === child.path && !fileNameBox
//                 ? "selected files"
//                 : "greys files"
//             }
//             onClick={() => {
//               onFileTreeClick(child.path, child.name);
//             }}
//             style={{
//               cursor: "pointer",
//             }}
//           >
//             <button
//               style={{
//                 marginLeft: "1.8em",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 maxWidth: "100%",
//                 outline: "none",
//               }}
//               tabIndex={-1}
//             >
//               <ContextMenuDemo
//                 nameToDisplay={child.name.slice(0, -3)}
//                 handleDelete={() => {
//                   onDelete(child.path, child.name);
//                 }}
//                 toPDF={() => {
//                   toPDF(
//                     fs.readFileSync(child.path, "utf8"),
//                     file.name
//                   );
//                 }}
//                 toDOCX={() => {
//                   toDOCX(
//                     fs.readFileSync(child.path, "utf8"),
//                     file.name
//                   );
//                 }}
//               />
//             </button>
//           </ol>
//         )
//       )}
//     </details>
//   )
// )
