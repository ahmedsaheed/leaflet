import React, { useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import "react-cmdk/dist/cmdk.css";
import { vim } from "@replit/codemirror-vim";
import {
  GETDATE,
  EXTENSIONS,
  openExternalInDefaultBrowser,
  toggleBetweenVimAndNormalMode,
  checkForPandoc,
  toDOCX,
  toPDF,
} from "../lib/util";
import { TopBar } from "../components/topBar";
import { ButtomBar } from "../components/bottomBar";
import { FileTree } from "../components/filetree";
import { QuickActions } from "../components/quickactions";
import { METADATE, METATAGS, METAMATERIAL } from "../components/metadata";
import { getMarkdown } from "../lib/mdParser";
import fs from "fs-extra";
import dragDrop from "drag-drop";
import mainPath from "path";
import pandoc from "../lib/pandocConverter";
import { CMDK } from "../components/cmdk";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { getStatistics, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { usePrefersColorScheme } from "../lib/theme";
import { basicLight } from "cm6-theme-basic-light";
import { ListenToKeys } from "../lib/keyevents";
let initialised = false;

export function Leaflet() {
  type file = {
    path: string;
    name: string;
    body: string;
    structure: { [key: string]: any };
  };

  const date = new Date();
  const [value, setValue] = useState<string>("");
  const [insert, setInsert] = useState<boolean>(false);
  const [files, setFiles] = useState<file[]>([]);
  const [name, setName] = useState<string>("");
  const [scroll, setScroll] = useState<number>(0);
  const [path, setPath] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<"root" | "projects">("root");
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [click, setClick] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [fileNameBox, setFileNameBox] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [pandocAvailable, setPandocAvailable] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string>("1L:1C");
  const [saver, setSaver] = useState<string>("");
  const appDir = mainPath.resolve(require("os").homedir(), "leaflet");
  const [struct, setStruct] = useState<{ [key: string]: any }>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [parentDir, setParentDir] = useState<string>(appDir);
  const [detailIsOpen, setDetailIsOpen] = useState<boolean>(false);
  const [fileTreeIsOpen, setFileTreeIsOpen] = useState<boolean>(true);
  const [editorview, setEditorView] = useState<EditorView>();
  const [isVim, setIsVim] = useState<boolean>(false);
  const refs = React.useRef<ReactCodeMirrorRef>({});
  const prefersColorScheme = usePrefersColorScheme();
  const isDarkMode = prefersColorScheme === "dark";

  useEffect(() => {
    if (!initialised) {
      initialised = true;
      openExternalInDefaultBrowser();
      checkForPandoc(setPandocAvailable);
      toggleBetweenVimAndNormalMode(setIsVim);
      ipcRenderer.invoke("getTheFile").then((files = []) => {
        setFiles(files);
        setValue(files[0] ? `${files[0].body}` : "");
        setName(files[0] ? `${files[0].name}` : "");
        setPath(files[0] ? `${files[0].path}` : "");
      });
    }
  }, []);

  useEffect(() => {
    if (refs.current?.view) setEditorView(refs.current?.view);
  }, [refs.current]);

  useEffect(() => {
    if (files.length > 0) {
      setStruct(files[0].structure.children);
    }
  }, [files]);

  const handleScroll = (event) => {
    let ScrollPercent = 0;
    const Scrolled = document.documentElement.scrollTop;
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    ScrollPercent = (Scrolled / MaxHeight) * 100;
    setScroll(ScrollPercent);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateCursor = (a, b) => {
    const line = a.number;
    const column = b - a.from;
    setCursor(`${line}L:${column}C`);
  };

  const checkEdit = (doc) => {
    if (!path) return;
    doc.toString() === fs.readFileSync(path, "utf8")
      ? setIsEdited(false)
      : setSaver("EDITED");
    setIsEdited(true);
  };

  /**
   * @description Function updates cm state on change
   */
  const onChange = useCallback(
    (doc, viewUpdate) => {
      setValue(doc.toString());
      let offset = getStatistics(viewUpdate).selection.main.head;
      let line = viewUpdate.state.doc.lineAt(offset);
      updateCursor(line, offset);
      if (line.number === viewUpdate.state.doc.length) {
        viewUpdate.state.doc.lineAt(offset).to = offset;
        viewUpdate.state.scrollIntoView = true;
      }

      checkEdit(doc);
    },
    [path]
  );

  /**
   * @description Function creates a new directory with a single file
   * @param {string} name - name of the directory
   */

  const createNewDir = (name: string) => {
    if (fs.existsSync(mainPath.join(parentDir, name)) || name === "") {
      return;
    }
    if (fs.existsSync(parentDir)) {
      fs.mkdirSync(`${parentDir}/${name}`);
      fs.writeFileSync(
        `${parentDir}/${name}/new.md`,
        `${name} created on ${GETDATE()} at ${date.toLocaleTimeString()}`
      );
      Update();
    }
    setIsCreatingFolder(false);
  };

  const Update = () => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setStruct(files[0].structure.children);
    });
  };

  useEffect(() => {
    ipcRenderer.on("save", function () {
      saveFile();
      Update();
    });
  }, [value, path]);

  useEffect(() => {
    ipcRenderer.on("insertClicked", function () {
      insert ? "" : setInsert(true);
    });

    ipcRenderer.on("previewClicked", function () {
      insert ? setInsert(false) : "";
    });
  }, [insert]);

  useEffect(() => {
    ipcRenderer.on("open", function () {
      fileDialog();
    });
  }, []);

  useEffect(() => {
    ipcRenderer.on("new", function () {
      setFileNameBox(true);
    });
  }, [fileNameBox]);

  /**
   * @description Function Convert docx file to markdown
   * @param {string} filePath - path of the file to be converted
   * @returns {void}
   */
  const docxToMd = (filePath) => {
    let destination = `${appDir}/${filePath.name.split(".")[0]}.md`;
    destination = destination.replace(/\s/g, "");
    try {
      pandoc(
        filePath.path,
        `-f docx -t markdown -o ${destination}`,
        function (err, result) {
          if (err) console.log(err);
          if (fs.existsSync(destination)) {
            Update();
          }
        }
      );
    } catch (e) {
      console.log(e);
    }

    return destination;
  };

  /**
   * Listen and handle drags and drops events
   */
  useEffect(() => {
    dragDrop("body", (files) => {
      const nameOfFileAtLastIndex = files[files.length - 1].name;
      const _files = files.map((file) => {
        let fileName = file.name;
        let filePath = file.path;
        const extension = file.path.split(".").pop();
        if (extension != "md" && extension === "docx") {
          const docx = docxToMd(file);
          fileName = mainPath.parse(docx).base;
          filePath = docx;
        }
        return {
          name: fileName,
          path: filePath,
        };
      });

      ipcRenderer.invoke("app:on-file-add", _files).then(() => {
        ipcRenderer.invoke("getTheFile").then((files = []) => {
          setFiles(files);
          setInsert(false);
          const index = files.findIndex(
            (file) => file.name === nameOfFileAtLastIndex.split(".")[0]
          );
          index !== -1
            ? () => {
                setValue(files[index].body);
                setName(files[index].name);
                setPath(files[index].path);
              }
            : () => {
                setValue(files[0].body);
                setName(files[0].name);
                setPath(files[0].path);
              };
          Update();
        });
      });
    });
  }, []);

  /**
   *
   * Creates a new file
   */
  const createNewFile = () => {
    fileName != ""
      ? ipcRenderer
          .invoke("createNewFile", parentDir, fileName.replace(/\.md$/, ""))
          .then(() => {
            setFiles(files);
            setInsert(false);
            Update();
          })
      : null;
  };

  /**
   * @description Function to delete a file
   * @param {string} path - path of the file to be deleted
   * @param {string} name - name of the file to be deleted
   * @returns {void}
   */
  const onDelete = (path: string, name: string) => {
    try {
      if (!fs.existsSync(path)) {
        return;
      }
      ipcRenderer.invoke("deleteFile", name, path).then(() => {
        Update();
        setStruct(files[0].structure.children);
        const index = Math.floor(Math.random() * files.length);
        setInsert(false);
        setValue(files[index].body);
        setName(files[index].name);
        setPath(files[index].path);
      });
    } catch (e) {
      console.log(e);
    }
  };

  // const fileTreeDrawer = () => {
  //   if (fileTreeIsOpen) {
  //     setFileTreeIsOpen(false);
  //   } else {
  //     setFileTreeIsOpen(true);
  //   }
  // };

  const saveFile = () => {
    try {
      setSaver("SAVING...");
      ipcRenderer.invoke("saveFile", path, value).then(() => {
        Update();
        setSaver("SAVED");
        setTimeout(() => {
          setIsEdited(false);
          setSaver("EDITED");
        }, 3000);
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    ListenToKeys(
      saveFile,
      editorview,
      insert,
      setInsert,
      toPDF,
      toDOCX,
      value,
      name,
      path,
      fileDialog,
      fileTreeDrawer,
      fileTreeIsOpen,
      setFileTreeIsOpen,
      setFileNameBox,
      setSearch,
      setClick,
      click
    );
  });

  const fileTreeDrawer = () => {
    if (fileTreeIsOpen) {
      setFileTreeIsOpen(false);
    } else {
      setFileTreeIsOpen(true);
    }
  };

  const creatingFileOrFolder = () => {
    if (fileName.length < 1) {
      setFileNameBox(false);
      return;
    }
    isCreatingFolder ? createNewDir(fileName) : createNewFile();
    setFileNameBox(false);
    setTimeout(() => {
      setFileName("");
    }, 100);
  };

  const fileDialog = () => {
    ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
      ipcRenderer.invoke("getTheFile").then((files = []) => {
        setFiles(files);
        Update();
      });
    });
  };

  function isEmpty(obj: object) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
  }

  /**
   * @description Function validate and render yaml metadata
   * @param {object} yaml - yaml object
   * @returns {React.ReactNode}
   * @todo - this function doesn't render the body, when yaml is not valid
   *
   */
  const ValidateYaml = (yaml: object | undefined) => {
    if (yaml === undefined) {
      return (
        <>
          <p>yaml is not valid</p>
          <hr />
        </>
      );
    }
    return (
      <div style={{ userSelect: "none" }}>
        <METADATE incoming={getMarkdown(value).metadata.date} />
        <METATAGS incoming={getMarkdown(value).metadata.tags} />
        <METAMATERIAL incoming={getMarkdown(value).metadata?.material} />
      </div>
    );
  };

  /**
   * @description Function to handle file selection from the sidebar
   * @param {string} path - path of the file to be selected
   * @param {string} name - name of the file to be selected
   * @returns {void}
   */
  const onFileTreeClick = (path: string, name: string) => {
    try {
      setParentDir(mainPath.dirname(path));
      saveFile();
      setValue(fs.readFileSync(path, "utf8"));
      setName(name);
      setPath(path);
      setInsert(false);

      document.documentElement.scrollTop = 0;
    } catch (err) {
      console.log(err);
    }
  };

  const addOpenToAllDetailTags = () => {
    const searchArea = document.getElementById(
      "fileTree"
    ) as HTMLDivElement | null;
    const allDetailTags = searchArea.getElementsByTagName("details");
    if (!detailIsOpen) {
      if (searchArea) {
        for (let i = 0; i < allDetailTags.length; i++) {
          allDetailTags[i].setAttribute("open", "");
        }
        setDetailIsOpen(true);
      }
    } else {
      if (searchArea) {
        for (let i = 0; i < allDetailTags.length; i++) {
          allDetailTags[i].removeAttribute("open");
        }
        setDetailIsOpen(false);
      }
    }
  };

  return (
    <>
      <div className="mainer" style={{ minHeight: "100vh" }}>
        <div>
          {TopBar(click, fileTreeIsOpen)}
          <div
            className="fs fixed"
            style={{
              width: "17.5em",
              maxWidth: "18.5em",
              minHeight: "100vh",
              display: fileTreeIsOpen ? "block" : "none",
            }}
          >
            <div>
              <div
                style={{
                  height: "100vh",
                  marginTop: "5vh",
                  paddingTop: "2em",
                }}
              >
                <QuickActions
                  createNewFile={() => setFileNameBox(true)}
                  addOpenToAllDetailTags={() => addOpenToAllDetailTags()}
                  detailIsOpen={detailIsOpen}
                  createNewFolder={() => {
                    setFileNameBox(true);
                    setIsCreatingFolder(true);
                  }}
                  sidebarCollapse={fileTreeDrawer}
                />

                <FileTree
                  struct={struct}
                  onFileTreeClick={(path, name) => {
                    onFileTreeClick(path, name);
                  }}
                  path={path}
                  fileNameBox={fileNameBox}
                  parentDirClick={(path) => {
                    setParentDir(path);
                  }}
                  creatingFileOrFolder={creatingFileOrFolder}
                  setFileName={(name) => {
                    setFileName(name);
                  }}
                  isCreatingFolder={isCreatingFolder}
                  onDelete={(path, name) => onDelete(path, name)}
                  toPDF={(body, name) => toPDF(body, name)}
                  toDOCX={(body, name) => toDOCX(body, name)}
                />
                <div
                  className={"fixed util"}
                  style={{
                    bottom: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      paddingLeft: "10px",
                      width: "17.5em",
                      maxWidth: "17.5em",
                    }}
                    className="menu"
                    role="button"
                    onClick={() => {
                      try {
                        setClick(true);
                        setSearch("");
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    Utilities
                    <span style={{ float: "right", marginRight: "2em" }}>
                      <code style={{ borderRadius: "2px" }}>⌘</code>{" "}
                      <code style={{ borderRadius: "2px" }}>k</code>
                    </span>
                    {click && (
                      <CMDK
                        value={value}
                        onNewFile={() => {
                          setFileNameBox(true);
                        }}
                        onCreatingFolder={() => {
                          try {
                            setIsCreatingFolder(true);
                            setFileNameBox(true);
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        setSearch={setSearch}
                        files={files}
                        pandocAvailable={pandocAvailable}
                        setClick={setClick}
                        page={page}
                        search={search}
                        onDocxConversion={(value: string, name: string) =>
                          toDOCX(value, name)
                        }
                        onPdfConversion={(value: string, name: string) =>
                          toPDF(value, name)
                        }
                        menuOpen={menuOpen}
                        onFileSelect={(file) => {
                          try {
                            saveFile();
                            setValue(file.body);
                            setName(file.name);
                            setPath(file.path);
                            setInsert(false);
                            document.documentElement.scrollTop = 0;
                          } catch (err) {
                            console.log(err);
                          }
                        }}
                        name={name}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: fileTreeIsOpen ? "calc(100vw - 17.5em)" : "100vw",
            minWidth: fileTreeIsOpen ? "calc(100vw - 17.5em)" : "100vw",
            maxWidth: fileTreeIsOpen ? "calc(100vw - 17.5em)" : "100vw",
          }}
        >
          <div
            style={{
              paddingTop: "13vh",
              padding: "40px",
            }}
          >
            {insert ? (
              <div className="markdown-content">
                <div style={{ overflow: "hidden" }}>
                  <CodeMirror
                    ref={refs}
                    value={value}
                    height="100%"
                    width="100%"
                    autoFocus={true}
                    theme={isDarkMode ? githubDark : basicLight}
                    basicSetup={false}
                    extensions={isVim ? [vim(), EXTENSIONS] : EXTENSIONS}
                    onChange={onChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={{ zIndex: "1", overflow: "hidden" }}>
                  <div style={{ paddingTop: "1em" }}>
                    {ValidateYaml(getMarkdown(value).metadata)}
                    <div style={{ overflow: "hidden" }}>
                      <div
                        id="previewArea"
                        style={{
                          marginBottom: "5em",
                          overflow: "scroll",
                        }}
                        className="third h-full w-full"
                        dangerouslySetInnerHTML={getMarkdown(value).document}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            {ButtomBar(
              insert,
              () => toggleBetweenVimAndNormalMode(setIsVim),
              isVim,
              value,
              cursor,
              scroll,
              editorview,
              fileTreeIsOpen
            )}
          </div>
        </div>
      </div>
    </>
  );
}
