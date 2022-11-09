import fs from 'fs';
import { MARKDOWNIcon } from './icons';

export function FileTree({
   struct,
   parentDirClick,
   path,
   fileNameBox,
   onFileTreeClick,
   creatingFileOrFolder, 
   isCreatingFolder,
   setFileName
   
}){

    return (
        <>
        {struct.map((file, index) =>
              file.children ? (
                !fs.existsSync(file.path) ? null : !fs.readdirSync(
                    file.path
                  ).length ? null : (
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
                      onClick={() => {parentDirClick(file.path)}}
                    >
                      {" "}
                      {file.name.charAt(0).toUpperCase() +
                        file.name.slice(1)}
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
                                    parentDirClick(file.path)
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
                                      path === child.path &&
                                      !fileNameBox
                                        ? "selected files"
                                        : "greys files"
                                    }
                                    onClick={() => {
                                      onFileTreeClick(
                                        child.path,
                                        child.name
                                      );
                                    }
                                }
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    <button
                                      style={{
                                        marginLeft: "0.2em",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        maxWidth: "100%",
                                        outline: "none",
                                      }}
                                      tabIndex={-1}
                                    >
                                      <p
                                        style={{
                                          marginLeft: "0.7em",
                                          display: "inline",
                                          width: "100%",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          outline: "none",
                                        }}
                                      >
                                        <MARKDOWNIcon />{" "}
                                        {child.name.slice(0, -3)}
                                      </p>
                                    </button>
                                  </ol>
                                ))
                                .sort((a, b) => {
                                  if (
                                    a.props.children[0]?.props
                                      .children[1]
                                  ) {
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
                          onClick={(e) => {
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
                            <p
                              style={{
                                display: "inline",
                                width: "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                outline: "none",
                              }}
                            >
                              <MARKDOWNIcon /> {child.name.slice(0, -3)}
                            </p>
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
                      <p
                        style={{
                          marginLeft: "1em",
                          outline: "none",
                          display: "inline",
                          width: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <MARKDOWNIcon /> {file.name.slice(0, -3)}
                      </p>
                    </button>
                  </ol>
                </>
              )
            ).sort((a, b) => {
              if (a?.props?.children[0]?.props?.children[1]) {
                return -1;
              } else {
                return 1;
              }
            })}

            
                 {fileNameBox ? (
                    <form
                      className="files greys selected"
                      onSubmit={() => {creatingFileOrFolder()}}
                    >
                      <input
                        autoFocus
                        className="createFile"
                        type="text"
                        placeholder={
                          isCreatingFolder ? "Folder Name" : "File Name"
                        }
                        onChange={(e) => setFileName(e.target.value)}
                      />
                    </form>
                  ) : null}
            

</>
    )
    
} 