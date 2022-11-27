import React, { useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { undo } from "@codemirror/commands";
import "react-cmdk/dist/cmdk.css";
import { vim } from "@replit/codemirror-vim";
import {
  GETDATE,
  LINK,
  BOLD,
  QUICKINSERT,
  ADDYAML,
  COMMENTOUT,
  EXTENSIONS,
} from "../lib/util";
import { ButtomBar } from "../components/bottomBar";
import { FileTree } from "../components/filetree";
import { QuickActions } from "../components/quickactions";
import { METADATE, METATAGS, METAMATERIAL } from "../components/metadata";
import { getMarkdown } from "../lib/mdParser";
import commandExists from "command-exists";
import fs from "fs-extra";
import dragDrop from "drag-drop";
import Head from "next/head";
import pandoc from "node-pandoc";
import mainPath from "path";
import open from "open";
import os from "os";
import { CMDK } from "../components/cmdk";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { getStatistics, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { usePrefersColorScheme } from "../lib/theme";
import { basicLight } from "cm6-theme-basic-light";
let initialised = false;

export default function Next() {
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
  const appDir = mainPath.resolve(os.homedir(), "leaflet");
  const [struct, setStruct] = useState<{ [key: string]: any }>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [parentDir, setParentDir] = useState<string>(appDir);
  const Desktop = require("os").homedir() + "/Desktop";
  const [detailIsOpen, setDetailIsOpen] = useState<boolean>(false);
  const [fileTreeIsOpen, setFileTreeIsOpen] = useState<boolean>(true);
  const [editorview, setEditorView] = useState<EditorView>();
  const [isVim, setIsVim] = useState<boolean>(false);
  const refs = React.useRef<ReactCodeMirrorRef>({});
  const prefersColorScheme = usePrefersColorScheme();
  const isDarkMode = prefersColorScheme === "dark";
  const onboardingDIR = mainPath.resolve(
    os.homedir(),
    "leaflet",
    "onboarding.md"
  );

  useEffect(() => {
    if (!initialised) {
      initialised = true;
      openExternalInDefaultBrowser();
      checkForPandoc();
      toggleBetweenVimAndNormalMode();
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

  /**
   * @description Function checks if pandoc is installed
   * @returns {boolean} - true if pandoc is installed
   * @deprecated
   * @todo remove this function
   */
  const checkForPandoc = () => {
    commandExists("pandoc", (err, exists) => {
      if (err) {
        console.log(err);
      }
      if (exists) {
        setPandocAvailable(true);
      }
    });
  };

  /**
   * @description Function toggles and updates between vim and normal mode
   * @returns {void}
   */
  const toggleBetweenVimAndNormalMode = () => {
    const whatMode = localStorage.getItem("writingMode");
    if (whatMode == undefined) {
      localStorage.setItem("writingMode", "normal");
      setIsVim(false);
    } else {
      if (whatMode === "normal") {
        localStorage.setItem("writingMode", "vim");
        setIsVim(true);
      } else {
        localStorage.setItem("writingMode", "normal");
        setIsVim(false);
      }
    }
  };

  /**
   * @description Function opens external links in default browser
   * @returns {void}
   */
  const openExternalInDefaultBrowser = () => {
    document.addEventListener("click", (event) => {
      const element = event.target as HTMLAnchorElement | null;
      if (
        element?.tagName === "A" &&
        element?.href.indexOf(window.location.href) > -1 === false
      ) {
        event.preventDefault();
        open(element?.href);
      }
    });
  };

  const Update = () => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setStruct(files[0].structure.children);
    });
  };

  /**
   * @description Function Convert specified file to pdf
   * @param {string} body - content to be converted
   * @param {string} name - name of the file
   * @returns {void}
   */
  const toPDF = (body: string, name: string) => {
    try {
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.pdf`;
      pandoc(body, `-f markdown -t pdf -o ${path}`, function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(path)) {
          open(path);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * @description Function Convert specified file to docx
   * @param {string} body - content to be converted
   * @param {string} name - name of the file
   * @returns {void}
   */
  const toDOCX = (body: string, name: string) => {
    try {
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.docx`;
      pandoc(body, `-f markdown -t docx -o ${path}`, function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(path)) {
          open(path);
        }
      });
    } catch (e) {
      console.log(e);
    }
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
      openWindow();
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

  const fileTreeDrawer = () => {
    if (fileTreeIsOpen) {
      setFileTreeIsOpen(false);
    } else {
      setFileTreeIsOpen(true);
    }
  };

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
    document.onkeydown = function ListenToKeys(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        saveFile();
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        if (!insert) {
          return;
        }
        BOLD(editorview);
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        toPDF(value, name);
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        toDOCX(value, name);
        e.preventDefault();
        return;
      }
      if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
        if (path != onboardingDIR) {
          setInsert(true);
          e.preventDefault();
          return;
        } else {
          setInsert(false);
          e.preventDefault();
          return;
        }
      } else if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
        setInsert(false);
        e.preventDefault();
        return;
      }

      if (e.key === "o" && (e.ctrlKey || e.metaKey)) {
        openWindow();
        e.preventDefault();
        return;
      }

      if ((e.key === "[" || e.key === "]") && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        LINK(editorview);
      }

      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        setFileNameBox(true);
        e.preventDefault();
        return;
      }
      if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        QUICKINSERT(editorview, GETDATE());
        e.preventDefault();
        return;
      }
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        COMMENTOUT(editorview);
        e.preventDefault();
        return;
      }

      if (e.key === "t" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }

        QUICKINSERT(editorview, date.toLocaleTimeString());
        e.preventDefault();
        return;
      }
      if (e.key === "j" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        ADDYAML(editorview);
        e.preventDefault();
        return;
      }
      if (e.metaKey && e.key === "z") {
        if (!insert || !editorview) return;
        undo(editorview);
      }

      if (e.metaKey && e.key === "\\") {
        fileTreeDrawer();
      }
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        setSearch("");
        setClick(!click);
        return;
      } else if (e.key === "Escape") {
        setClick(false);
        return;
      }
      if (e.key === "Tab") {
        if (!insert) {
          e.preventDefault();
          return;
        }
      }
    };
  });

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

  const openWindow = () => {
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
    console.log(yaml);
    if (yaml === undefined) {
      return (
        <>
          <p>yaml is not valid</p>
          <hr />
        </>
      );
    }
    return (
      <>
        <METADATE incoming={getMarkdown(value).metadata.date} />
        <METATAGS incoming={getMarkdown(value).metadata.tags} />
        <METAMATERIAL incoming={getMarkdown(value).metadata?.material} />
      </>
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
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
          integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X"
          crossOrigin="anonymous"
        />

        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"
          integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4"
          crossOrigin="anonymous"
        ></script>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js"
          integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <div className="mainer" style={{ minHeight: "100vh" }}>
        <div
          className="topBar"
          style={{
            position: "fixed",
            width: "100%",
            height: "40px",
            zIndex: click ? 0 : 100,
          }}
        >
          <div
            className="topBarLeft"
            style={{
              width: "17.5em",
              height: "40px",

              display: fileTreeIsOpen ? "block" : "none",
            }}
          >
          </div>
        </div>
        <div>
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
                  <div style={{ paddingTop: "1em", userSelect: "none" }}>
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
              () => toggleBetweenVimAndNormalMode(),
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
