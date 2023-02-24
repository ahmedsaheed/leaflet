import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactElement,
} from "react";
import { ipcRenderer } from "electron";
import { vim } from "@replit/codemirror-vim";
import * as prettier from "prettier";
import "react-cmdk/dist/cmdk.css";
import {
  GETDATE,
  EXTENSIONS,
  toDOCX,
  toPDF,
  format,
  cleanFileNameForExport,
  toggleBetweenVimAndNormalMode,
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
import { ButtomBar } from "../components/bottomBar";
import { CMDK } from "../components/cmdk";
/*
import "react-cmdk/dist/cmdk.css";
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
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const DRAWERWIDTH = 250;
  // function formatMarkdown(markdown: string): string {
  //   return prettier.format(markdown, {
  //     parser: 'markdown',
  //     plugins: [prettier.plugins.markdown],
  //   });
  // }

  const saveFile = () => {
    try {
      setSaver("SAVING...");
      let newvalue = value;
      try{
        newvalue = format(value);
      }catch(e){
        console.log(e);
      }

      ipcRenderer.invoke("saveFile", path, newvalue).then(() => {
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
    setOpen
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
      open ? handleDrawerClose : handleDrawerOpen
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
      localStorage.setItem("currPath", path);
      setInsert(false);
      document.documentElement.scrollTop = 0;
    } catch (err) {
      console.log(err);
    }
  };

  const AppBars: React.FC = (): ReactElement => {
    return (
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
    );
  };

  function closeSecondaryMenu() {
    const secondaryMenu = document.getElementsByClassName(
      "second-nav"
    )[0] as HTMLElement;
    if (secondaryMenu) {
      secondaryMenu.style.transition =
        "transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms";
      setTimeout(() => {
        secondaryMenu.style.display = "none";
      }, 300);
    }
  }

  return (
    <div className="h-screen w-screen" style={{ overflow: "hidden" }}>
      <div className="flex" style={{minHeight: "100vh"}}>
        <div className="hidden md:flex md:flex-row">
          <div className="h-screen-fix no-scrollbar flex overflow-y-scroll bg-palette-0 bg-black"></div>
          <nav
            id="menu"
            className="drag custom-border z-40 flex flex-col justify-between border-r-[0.5px] bg-transparent pt-10"
          >
            <div className="flex flex-col overflow-y-hidden">
              <ul className="flex w-20 shrink-0 flex-col items-center justify-end bg-transparent px-5 pt-1 pb-px space-y-2.5">
                <li className="aspect-w-1 aspect-h-1 w-full">
                  <a
                    className="flex flex-col items-center justify-center rounded-full outline-none transition-all focus:outline-none sm:duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500"
                    href="/dashboard/feed"
                  >
                    <svg
                      className="w-6"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M22 17v-5.16c0-1.42 0-2.12-.18-2.77 -.16-.58-.43-1.13-.78-1.61 -.4-.55-.95-.99-2.06-1.88l-2-1.6c-1.79-1.43-2.68-2.15-3.67-2.42 -.88-.25-1.8-.25-2.67 0 -.99.27-1.89.98-3.67 2.41l-2 1.6c-1.11.88-1.66 1.32-2.06 1.87 -.36.48-.62 1.02-.78 1.6 -.18.65-.18 1.35-.18 2.76v5.15c0 2.76 2.23 5 5 5 1.1 0 2-.9 2-2v-4.01c0-1.66 1.34-3 3-3 1.65 0 3 1.34 3 3v4c0 1.1.89 2 2 2 2.76 0 5-2.24 5-5Z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
              <ul className="no-scrollbar flex w-20 grow flex-col items-center space-y-4 overflow-y-scroll bg-transparent py-4 px-5">
                <li className="aspect-w-1 aspect-h-1 w-full">
                  <a
                    className="flex flex-col items-center justify-center rounded-full outline-none transition-all focus:outline-none sm:duration-300 text-primary-500 ring ring-primary-300"
                    href="/dashboard/63f56b500b1b1944dd455528"
                    aria-current="page"
                  >
                    <span className="inline-block w-full text-center align-middle font-mono">
                      te
                    </span>
                  </a>
                </li>
                <div className="custom-border mx-auto h-px w-3/4 flex-shrink-0 grow-0 border-b-[0.5px]" />
                <li className="aspect-w-1 aspect-h-1 w-full">
                  <button className="flex flex-col items-center justify-center rounded-full transition-all duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500">
                    <svg
                      className="w-6"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h7m7 0h-7m0 0V5m0 7v7"
                      />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
            <ul className="flex w-20 flex-col items-center space-y-5 bg-transparent px-5 pb-5">
              <li className="aspect-w-1 aspect-h-1 relative w-full">
                <div
                  className="absolute top-[50%] left-[50%] h-[115%] w-[115%] -translate-y-[50%] -translate-x-[50%] rounded-full"
                  style={{
                    background:
                      "conic-gradient(var(--theme-primary-300) 0%, var(--theme-palette-0) 15%)",
                  }}
                />
                <div className="absolute top-[50%] left-[50%] h-[115%] w-[115%] -translate-y-[50%] -translate-x-[50%] rounded-full bg-primary-400 opacity-5" />
                <button className="flex flex-col items-center justify-center rounded-full transition-all duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500">
                  <svg
                    className="w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.11 10.1l4.6-5.76c1.31-1.64 1.96-2.46 2.54-2.55 .49-.08 1 .09 1.34.47 .39.42.39 1.47.39 3.57v1.75c0 .84 0 1.26.16 1.58 .14.28.37.51.65.65 .32.16.74.16 1.58.16h.6c1.59 0 2.39 0 2.8.32 .35.28.56.71.56 1.17 -.01.52-.5 1.14-1.5 2.39l-4.61 5.75c-1.32 1.63-1.97 2.45-2.55 2.54 -.5.07-1.01-.1-1.35-.48 -.4-.43-.4-1.48-.4-3.58v-1.76c0-.85 0-1.27-.17-1.59 -.15-.29-.38-.52-.66-.66 -.33-.17-.75-.17-1.59-.17h-.61c-1.6 0-2.4 0-2.81-.33 -.36-.29-.57-.72-.57-1.18 0-.53.49-1.15 1.49-2.4Z"
                    />
                  </svg>
                </button>
              </li>
              <div className="custom-border mx-auto h-px w-3/4 border-t-[0.5px]" />
              <li className="aspect-w-1 aspect-h-1 w-full">
                <a
                  className="flex flex-col items-center justify-center rounded-full outline-none transition-all focus:outline-none sm:duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500"
                  href="/dashboard/settings"
                >
                  <svg
                    className="w-6"
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
                      <path d="M4 18.8C4 16.149 6.14 14 8.8 14h6.4c2.65 0 4.8 2.14 4.8 4.8v0c0 1.76-1.44 3.2-3.2 3.2H7.2C5.43 22 4 20.56 4 18.8v0Z" />
                      <path d="M16 6c0 2.2-1.8 4-4 4 -2.21 0-4-1.8-4-4 0-2.21 1.79-4 4-4 2.2 0 4 1.79 4 4Z" />
                    </g>
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
          <div className="second-nav custom-border no-scrollbar z-30 flex min-w-[220px] grow flex-col overflow-y-scroll border-r-[0.5px] bg-transparent">
            <div className="drag flex shrink-0 flex-col justify-center px-4 h-16">
              <div className="flex items-center justify-between">
                <span className="w-full text-lg font-medium lowercase text-palette-800">
                  tese
                </span>
                <span
                  onClick={() => {
                    closeSecondaryMenu();
                  }}
                  className="flex h-[22px] items-center transition-all duration-300 smarthover:hover:text-primary-500 text-palette-600"
                >
                  <svg
                    className="h-full"
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
                      <path d="M12 4c-.7 0-1.39-.27-1.82-.82l-.46-.59C9.1 1.79 8 1.58 7.13 2.08l-1.31.75c-.87.5-1.23 1.56-.86 2.48l.27.68c.26.64.14 1.37-.21 1.97v0c-.35.6-.93 1.07-1.62 1.16l-.74.09c-1 .13-1.73.98-1.73 1.98v1.5c0 1 .73 1.84 1.72 1.98l.73.09c.69.09 1.26.56 1.61 1.16v0c.34.6.46 1.32.2 1.97l-.28.68c-.38.92-.02 1.98.85 2.48l1.3.75c.86.5 1.96.28 2.58-.51l.45-.59c.42-.56 1.11-.82 1.81-.82v0 0c.69 0 1.38.26 1.81.81l.45.58c.61.79 1.71 1 2.58.5l1.3-.76c.86-.51 1.22-1.57.85-2.49l-.28-.69c-.27-.65-.15-1.38.2-1.98v0c.34-.61.92-1.08 1.61-1.17l.73-.1c.99-.14 1.72-.99 1.72-1.99v-1.51c0-1.01-.74-1.85-1.73-1.99l-.74-.1c-.7-.1-1.27-.57-1.62-1.17v0c-.35-.61-.47-1.33-.21-1.98l.27-.69c.37-.93.01-1.99-.86-2.49l-1.31-.76c-.87-.51-1.97-.29-2.59.5l-.46.58c-.43.55-1.12.81-1.82.81v0 0Z" />
                      <path d="M15 12c0 1.65-1.35 3-3 3 -1.66 0-3-1.35-3-3 0-1.66 1.34-3 3-3 1.65 0 3 1.34 3 3Z" />
                    </g>
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
                    
                       <svg className="h-[1.25rem] w-[1.25rem] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M21 21l-3.64-3.64m0 0c1.62-1.63 2.63-3.88 2.63-6.37 0-4.98-4.03-9-9-9 -4.98 0-9 4.02-9 9 0 4.97 4.02 9 9 9 2.48 0 4.73-1.01 6.36-2.64Z"></path></svg>
                      <span className="align-middle font-mono text-sm" >
                        search
                      </span>
                    </span>
                  </li>
                  <li>
                    <a
                      className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-300 smarthover:hover:text-primary-500 bg-transparent text-palette-600"
                      href="/dashboard/63f56b500b1b1944dd455528/charts"
                    >
                      <svg
                        className="h-[1.25rem] w-[1.25rem]"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.36 2H4.62c-.91 0-1.64.73-1.64 1.63 0 2.11 1.01 4.09 2.73 5.32l1.92 1.37h0c.64.45.96.68 1.22.95 .53.55.89 1.26 1.04 2.02 .06.36.06.76.06 1.55v5.13c0 1.1.89 2 2 2 1.1 0 2-.9 2-2v-5.14c0-.79 0-1.19.06-1.56 .14-.77.5-1.47 1.04-2.03 .25-.28.58-.5 1.22-.96l1.92-1.38c1.71-1.23 2.73-3.21 2.73-5.33 0-.91-.74-1.64-1.64-1.64Z"
                        />
                      </svg>
                      <span className="align-middle font-mono text-sm">
                        charts
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-300 smarthover:hover:text-primary-500 bg-transparent text-palette-600"
                      href="/dashboard/63f56b500b1b1944dd455528/insight"
                    >
                      <svg
                        className="h-[1.25rem] w-[1.25rem]"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.75 5c-1.1 1.36-1.76 3.1-1.76 5 0 2.94 2.22 5.3 3.7 6.54 .76.64 1.29 1.56 1.29 2.57v0c0 1.59 1.29 2.88 2.88 2.88h.23c1.58 0 2.87-1.29 2.87-2.88v0c0-1.01.53-1.95 1.31-2.59 1.48-1.23 3.68-3.56 3.68-6.55 0-4.42-3.59-8-8-8 -1.07 0-2.08.2-3 .58m0 15.41s1 .5 3 .5"
                        />
                      </svg>
                      <span className="align-middle font-mono text-sm">
                        insight
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <div className="sticky top-0 bg-palette-0 pb-2">
                  <div className="flex items-center justify-between px-2 text-palette-700">
                    <div className="text-base font-medium">notes</div>
                    <div>
                      <button className="flex h-[22px] items-center transition-all duration-300 smarthover:hover:text-primary-500">
                        <svg
                          className="h-full p-px"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h7m7 0h-7m0 0V5m0 7v7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1">
                  <li>
                    <FileTree
                      structures={struct}
                      onNodeClicked={(path, name) => onNodeClicked(path, name)}
                      path={path}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
                        {name.endsWith(".md") ? name.slice(0, -3) : name}
                      </span>
                      <div className="flex justify-end space-x-5">
                      <button
                          className="focus:outline-none"
                          onClick={(e) => {
                           setInsert(!insert)
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
                        <button className="focus:outline-none" onClick={(e) => {
                            e.preventDefault();
                            ipcRenderer.send("show-context-menu", isVim);
                          }}>
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
              
                <div className="
                flex h-[calc(100vh-170px)] w-full flex-col 
                ">
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
                        extensions={isVim ? [vim(), EXTENSIONS] : EXTENSIONS}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                      <div style={{ paddingTop: "1em" }}>
                        <div style={{ padding: "40px" }}>
                          {ValidateYaml(resolvedMarkdown.metadata)}
                          <div>
                            <div
                              id="previewArea"
                              style={{
                                marginBottom: "5em",
                              }}
                              className=""
                              dangerouslySetInnerHTML={
                                resolvedMarkdown.document
                              }
                            />
                          </div>
                        </div>
                      </div>
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
          onPdfConversion={(value: string, name: string) => toPDF(value, name)}
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
  );
}

{
  /*<div style={{ display: "flex" }}>
      <AppBars />
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
          onNodeClicked={(path, name) => onNodeClicked(path, name)}
          path={path}
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
                        dangerouslySetInnerHTML={resolvedMarkdown.document}
                      />
                    </div>
                  </div>
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
                </div>
              </>
            )}
          </div>
        </div>
      </Main>
    </div>*/
}
