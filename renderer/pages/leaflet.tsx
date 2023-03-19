import React, { useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { vim } from "@replit/codemirror-vim";
import "react-cmdk/dist/cmdk.css";
import {
  GETDATE,
  EXTENSIONS,
  toDOCX,
  toPDF,
  format,
  toggleBetweenVimAndNormalMode,
  ValidateYaml,
} from "../lib/util";
import { effects } from "../lib/effects";
import { FileTree } from "../components/filetree";
import { getMarkdown } from "../lib/mdParser";
import fs from "fs-extra";
import mainPath from "path";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { getStatistics, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView, highlightActiveLine } from "@codemirror/view";
import { usePrefersColorScheme } from "../lib/theme";
import { basicLight } from "cm6-theme-basic-light";
import { ListenToKeys } from "../lib/keyevents";
import { toast } from "react-hot-toast";
import { ButtomBar } from "../components/bottomBar";
import { CMDK } from "../components/cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Nav } from "../components/nav";

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
  const appDir = mainPath.resolve(require("os").homedir(), "leaflet");
  const [struct, setStruct] = useState<{ [key: string]: any }>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [parentDir, setParentDir] = useState<string>(appDir);
  const [editorview, setEditorView] = useState<EditorView>();
  const [isVim, setIsVim] = useState<boolean>(false);
  const [open, setOpen] = React.useState(true);
  const refs = React.useRef<ReactCodeMirrorRef>({});
  const prefersColorScheme = usePrefersColorScheme();
  const isDarkMode = prefersColorScheme === "dark";
  const resolvedMarkdown = getMarkdown(value);
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
      setFileNameBox,
      setSearch,
      setClick,
      click,
      open ? handleDrawerClose : handleDrawerOpen
    );
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const saveFile = () => {
    try {
      let newvalue = value;
      try {
        newvalue = format(value);
      } catch (e) {
        console.log(e);
      }

      ipcRenderer.invoke("saveFile", path, newvalue).then(() => {
        setTimeout(() => {
          setIsEdited(false);
        }, 3000);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fileDialog = () => {
    ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
      ipcRenderer.invoke("getTheFile").then((files = []) => {
        setFiles(files);
        Update();
      });
    });
  };

  /**
   * @description delete a file node
   * @param {string} path - path of the file to be deleted
   * @param {string} name - name of the file to be deleted
   * @returns {void}
   */
  function onDelete(path: string, name: string): void {
    try {
      if (!fs.existsSync(path)) {
        return;
      }
      ipcRenderer.invoke("deleteFile", name, path).then(() => {
        Update();
        toast("File moved to trash", {
          icon: "🗑️",
          style: {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        });

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
  }

  const Update = () => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setStruct(files[0].structure.children);
    });
  };

  effects(
    false,
    setPandocAvailable,
    setIsVim,
    setFiles,
    setValue,
    setName,
    setPath,
    refs,
    setEditorView,
    files,
    setStruct,
    path,
    name,
    value,
    saveFile,
    Update,
    onDelete,
    setInsert,
    insert,
    fileDialog,
    setScroll
  );

  const updateCursor = (a, b) => {
    const line = a.number;
    const column = b - a.from;
    setCursor(`${line}L:${column}C`);
  };

  const checkEdit = (doc) => {
    if (!path) return;
    doc.toString() === fs.readFileSync(path, "utf8")
      ? setIsEdited(false)
      : () => {};
    setIsEdited(true);
  };

  /**
   * @description updates cm state on change
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
   * @description creates a new directory with a single file
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

  useEffect(() => {
    ipcRenderer.on("open", function () {
      fileDialog();
    });
  }, []);

  function CommandMenu() {
    return (
      click && (
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
          onPdfConversion={(value: string, name: string) => toPDF(value, name)}
          menuOpen={menuOpen}
          onFileSelect={(file) => {
            try {
              onNodeClicked(file.path, file.name);
            } catch (err) {
              console.log(err);
            }
          }}
          name={name}
        />
      )
    );
  }
  useEffect(() => {
    ipcRenderer.on("new", function () {
      setFileNameBox(true);
    });
  }, [fileNameBox]);

  /**
   * @description handle file selection from the sidebar
   * @param {string} path - path of the file to be selected
   * @param {string} name - name of the file to be selected
   * @returns {void}
   */
  const onNodeClicked = (path: string, name: string): void => {
    try {
      saveFile();
      setValue(fs.readFileSync(path, "utf8"));
      setName(name);
      setPath(path);
      localStorage.setItem("currPath", path);
      setInsert(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen w-screen" style={{ overflow: "hidden" }}>
      <div className="flex" style={{ minHeight: "100vh" }}>
        <div className="hidden md:flex md:flex-row">
          <div className="h-screen-fix no-scrollbar flex overflow-y-scroll bg-palette-0 bg-black"></div>
          <Nav
            open={open}
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleDrawerClose}
            setClick={() => setClick(!click)}
            click={click}
          />
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                animate={{ width: 220 }}
                initial={{ width: 0 }}
                exit={{ width: 0 }}
                className="second-nav custom-border no-scrollbar z-30 flex grow flex-col overflow-y-scroll border-r-[0.5px] bg-transparent"
              >
                <div className="drag flex shrink-0 flex-col justify-center px-4 h-16">
                  <div className="flex items-center justify-between">
                    <span className="w-full text-lg font-small text-palette-800">
                      Notes
                    </span>
                    <span
                      onClick={() => {
                        setOpen(false);
                      }}
                      className="flex h-[22px] items-center transition-all duration-300 smarthover:hover:text-primary-500 text-palette-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="h-6 w-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M4 12h16M4 18h7"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="no-scrollbar mx-2.5 space-y-5 overflow-y-auto pb-32">
                  <div>
                    <ul className="space-y-1">
                      <li>
                        <span
                          className="cursor-pointer flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-300 smarthover:hover:text-primary-500 bg-palette-100 text-primary-500 dark:bg-palette-50"
                          onClick={() => setClick(!click)}
                          aria-current="page"
                        >
                          <svg
                            className="h-[1.25rem] w-[1.25rem] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-width="2"
                              d="M21 21l-3.64-3.64m0 0c1.62-1.63 2.63-3.88 2.63-6.37 0-4.98-4.03-9-9-9 -4.98 0-9 4.02-9 9 0 4.97 4.02 9 9 9 2.48 0 4.73-1.01 6.36-2.64Z"
                            ></path>
                          </svg>
                          <span className="align-middle font-mono text-sm">
                            search
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <div className="sticky top-0 bg-palette-0 pb-2"></div>
                    <ul className="space-y-1">
                      <li className="overflow-y-scroll">
                        <FileTree
                          structures={struct}
                          onNodeClicked={(path, name) =>
                            onNodeClicked(path, name)
                          }
                          path={path}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          className="flex grow flex-col overflow-hidden transition-all duration-150"
          style={{ willChange: "transform" }}
        >
          <div
            id="dashboard-view-container"
            className="relative flex grow flex-col overflow-y-auto"
            data-projection-id={11}
            style={{ transform: "none", opacity: 1 }}
          >
            <div className="absolute inset-x-0 top-0 z-100">
              <div className="topbar drag fixed top-0 z-100 mx-auto flex w-full flex-col bg-palette-0">
                <div className="custom-border flex h-14 shrink-0 border-b-[0.5px] bg-transparent md:px-4 md:h-16">
                  <button
                    type="button"
                    className="custom-border pl-4 text-palette-900 focus:outline-none md:hidden"
                  >
                    <span className="sr-only">Open sidebar</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <div className="flex flex-1 items-center justify-between px-4 md:px-0">
                    <div className="flex w-full items-center">
                      <span className="w-full text-lg font-medium lowercase text-palette-800">
                        <AnimatePresence>
                          <motion.div
                            key={path}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {name.endsWith(".md") ? name.slice(0, -3) : name}
                          </motion.div>
                        </AnimatePresence>
                      </span>
                      <div className="flex justify-end space-x-5">
                        <button
                          className="focus:outline-none"
                          onClick={(e) => {
                            setInsert(!insert);
                          }}
                        >
                          <div className="h-[22px] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500">
                            <svg
                              className="h-[22px] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500 p-[0.5px]"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g
                                strokeLinecap="round"
                                strokeWidth={2}
                                stroke="currentColor"
                                fill="none"
                                strokeLinejoin="round"
                              >
                                <path
                                  opacity=".15"
                                  d="M2 12c0 2.25.74 4.32 2 6m18-6.01c0-2.26-.74-4.33-1.99-6"
                                />
                                <path d="M2 7.5V4m0 3.5C2 7.5 5.33 2 12 2c3.29 0 6.19 1.57 8.01 4M1.99 7.5h3.5m15.5 9s-3.48 5.5-9 5.5c-3.28 0-6.18-1.58-8-4m17-1.51h-3.5m3.5 0v3.5" />
                              </g>
                            </svg>
                          </div>
                        </button>
                        <button
                          className="focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            ipcRenderer.send("show-context-menu", isVim);
                          }}
                        >
                          <svg
                            className="h-[22px] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 13L16.2933 15.8534C14.7191 16.6405 13.932 17.034 13.1064 17.1889C12.3752 17.3261 11.6248 17.3261 10.8936 17.1889C10.068 17.034 9.28094 16.6405 7.70675 15.8534L2 13M22 18L16.2933 20.8534C14.7191 21.6405 13.932 22.034 13.1064 22.1889C12.3752 22.3261 11.6248 22.3261 10.8936 22.1889C10.068 22.034 9.28094 21.6405 7.70675 20.8534L2 18M5.72433 9.86217L9.13783 11.5689C10.1873 12.0936 10.712 12.356 11.2624 12.4593C11.7499 12.5507 12.2501 12.5507 12.7376 12.4593C13.288 12.356 13.8127 12.0936 14.8622 11.5689L18.2757 9.86217C20.1181 8.94095 21.0393 8.48035 21.3349 7.85705C21.5922 7.31464 21.5922 6.68536 21.3349 6.14295C21.0393 5.51965 20.1181 5.05905 18.2757 4.13783L14.8622 2.43108C13.8127 1.90635 13.288 1.64399 12.7376 1.54073C12.2501 1.44927 11.7499 1.44927 11.2624 1.54073C10.712 1.64399 10.1873 1.90635 9.13783 2.43108L5.72433 4.13783C3.88191 5.05905 2.96069 5.51965 2.66508 6.14295C2.40782 6.68536 2.40782 7.31464 2.66508 7.85705C2.96069 8.48035 3.88191 8.94095 5.72433 9.86217Z"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="no-scrollbar grow pt-[3.5rem] md:pt-[4rem]">
              <div className="virtual-list h-full">
                <div
                  className="
                flex h-[calc(100vh-170px)] w-full flex-col 
                "
                >
                  {insert ? (
                    <div
                      className="markdown-content"
                      style={{ padding: "40px", zIndex: "-1" }}
                    >
                      <div>
                        <CodeMirror
                          ref={refs}
                          value={value}
                          height="100%"
                          width="100%"
                          autoFocus={true}
                          theme={isDarkMode ? githubDark : basicLight}
                          basicSetup={false}
                          extensions={
                            isVim ? [vim(), ...EXTENSIONS] : EXTENSIONS
                          }
                          onChange={onChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence>
                        <motion.div
                          key={path}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          style={{ paddingTop: "1em" }}
                        >
                          <div id="content" style={{ padding: "40px" }}>
                            {ValidateYaml(resolvedMarkdown.metadata)}
                            <div>
                              <div
                                id="previewArea"
                                style={{
                                  marginBottom: "5em",
                                }}
                                dangerouslySetInnerHTML={
                                  resolvedMarkdown.document
                                }
                              />
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                      {ButtomBar(
                        insert,
                        () => toggleBetweenVimAndNormalMode(setIsVim),
                        isVim,
                        value,
                        cursor,
                        scroll,
                        editorview,
                        open
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommandMenu />
    </div>
  );
}
