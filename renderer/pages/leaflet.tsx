import React, { useRef, useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { vim } from "@replit/codemirror-vim";
import {
  GETDATE,
  EXTENSIONS,
  toDOCX,
  toPDF,
  format,
  cleanFileNameForExport,
} from "../lib/util";
import { effects } from "../lib/effects";
import { SIDEBARCOLLAPSEIcon } from "../components/icons";
import { FileTree } from "../components/filetree";
import { QuickAction, QuickActions } from "../components/quickactions";
import { METADATE, METATAGS, METAMATERIAL } from "../components/metadata";
import { getMarkdown } from "../lib/mdParser";
import fs from "fs-extra";
import mainPath from "path";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { getStatistics, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { usePrefersColorScheme } from "../lib/theme";
import { basicLight } from "cm6-theme-basic-light";
import { ListenToKeys } from "../lib/keyevents";
import {
  appBarMouseOver,
  appBarMouseLeave,
  Main,
  AppBar,
  DrawerHeader,
} from "../components/skeleton";
import Drawer from "@mui/material/Drawer";
import { toast } from "react-hot-toast";
/*
import "react-cmdk/dist/cmdk.css";
import { ButtomBar } from "../components/bottomBar";
import { CMDK } from "../components/cmdk";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled, useTheme } from "@mui/material/styles";
*/

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
  const [editorview, setEditorView] = useState<EditorView>();
  const [isVim, setIsVim] = useState<boolean>(false);
  const [open, setOpen] = React.useState(true);
  const refs = React.useRef<ReactCodeMirrorRef>({});
  const headerRef = useRef<HTMLHeadingElement>(null);
  const prefersColorScheme = usePrefersColorScheme();
  const isDarkMode = prefersColorScheme === "dark";
  const resolvedMarkdown = getMarkdown(value);
  const handleDrawerOpen = () => {setOpen(true)};
  const handleDrawerClose = () => {setOpen(false);};
  const DRAWERWIDTH = 250
  
  const saveFile = () => {
    try {
      setSaver("SAVING...");
      // if (insert) {
      //   format(refs);
      // }
      ipcRenderer.invoke("saveFile", path, value).then(() => {
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
  const onDelete = (path: string, name: string) => {
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
  };

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
    setScroll,
    handleDrawerClose,
    setOpen,
  );

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
      open ? handleDrawerClose : handleDrawerOpen,
    );
  });

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

  useEffect(() => {
    ipcRenderer.on("new", function () {
      setFileNameBox(true);
    });
  }, [fileNameBox]);

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
      <div className="meta" style={{ userSelect: "none" }}>
        <METADATE incoming={resolvedMarkdown.metadata.date} />
        <METATAGS incoming={resolvedMarkdown.metadata.tags} />
        <METAMATERIAL incoming={resolvedMarkdown.metadata?.material} />
      </div>
    );
  };

 
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
      localStorage.setItem(
        "currPath",path)
      setInsert(false);
      document.documentElement.scrollTop = 0;
    } catch (err) {
      console.log(err);
    }
  };

  return (
          <div style={{ display: "flex" }}>
            <AppBar
              ref={headerRef}
              onMouseOver={appBarMouseOver}
              onMouseLeave={appBarMouseLeave}
              position="fixed"
              open={open}
              className="topBar"
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                zIndex: "1",
              }}
            >
              <div
                style={{
                  flex: 1,
                  paddingLeft: "75px",
                  paddingTop: "6px",
                }}
              >
                <button
                  aria-label="open drawer"
                  className="quickAction topbar-bottons"
                  onClick={open ? handleDrawerClose : handleDrawerOpen}
                  style={{
                    padding: 0,
                    border: "1px solid transparent",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ padding: "0 5px" }} title="Collapse Sidebar">
                    <SIDEBARCOLLAPSEIcon />
                  </div>
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <strong style={{ display: "inline" }}>
                  {cleanFileNameForExport(name)}
                </strong>
              </div>
              <div
                style={{
                  paddingRight: "20px",
                  alignItems: "center",
                }}
              >
                <span className="topbar-bottons">
                  <QuickAction
                    modeSwitch={() => setInsert(!insert)}
                    addOpenToAllDetailTags={() => {}}
                    detailIsOpen={detailIsOpen}
                    createNewFolder={() => {
                      setFileNameBox(true);
                      setIsCreatingFolder(true);
                    }}
                    insert={insert}
                    isVim={isVim}
                  />
                </span>
              </div>
            </AppBar>
            <Drawer
              sx={{
                width: DRAWERWIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: DRAWERWIDTH,
                  boxSizing: "border-box",
                  overflow: "scroll",
                },
              }}
              variant="persistent"
              anchor="left"
              open={open}
              className={open ? "drawer" : ""}
              style={{ overflow: "scroll" }}
            >
              <div
                onMouseOver={appBarMouseOver}
                onMouseLeave={appBarMouseLeave}
                className="mane"
                style={{ backgroundColor: "transparent", minHeight: "37px" }}
              ></div>
              <QuickActions
                createNewFile={() => setFileNameBox(true)}
                addOpenToAllDetailTags={() => {}}
                detailIsOpen={detailIsOpen}
                createNewFolder={() => {
                  setFileNameBox(true);
                  setIsCreatingFolder(true);
                }}
              />

              <FileTree
              structures={struct}
              onNodeClicked={(path, name)=>onNodeClicked(path, name)}
              path={path}
              />

            </Drawer>
            <Main open={open} style={{ overflow: "scroll" }}>
              <div>
                <DrawerHeader />
                <div className="content">
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
                          {ValidateYaml(resolvedMarkdown.metadata)}
                          <div style={{ overflow: "hidden" }}>
                            <div
                              id="previewArea"
                              style={{
                                marginBottom: "5em",
                                overflow: "scroll",
                              }}
                              className="third h-full w-full"
                              dangerouslySetInnerHTML={
                                resolvedMarkdown.document
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Main>
          </div>
  );
}
