import React, { useEffect, Dispatch, SetStateAction } from "react";
import { ipcRenderer } from "electron";
import { EditorView } from "@codemirror/view";
import mainPath from "path";
import dragDrop from "drag-drop";
import {
  openExternalInDefaultBrowser,
  toggleBetweenVimAndNormalMode,
  checkForPandoc,
  toDOCX,
  toPDF,
  revealInFinder,
  docxToMd,
  imageUrl,
} from "./util";

import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
type Dispatcher<S> = Dispatch<SetStateAction<S>>;
type file = {
  path: string;
  name: string;
  body: string;
  structure: { [key: string]: any };
};
export function effects(
  initialised: boolean,
  setPandocAvailable: Dispatcher<boolean>,
  setIsVim: Dispatcher<boolean>,
  setFiles: Dispatcher<file[]>,
  setValue: Dispatcher<string>,
  setName: Dispatcher<string>,
  setPath: Dispatcher<string>,
  snackbar: boolean,
  setSnackbar: Dispatcher<boolean>,
  setSnackbarMessage: Dispatcher<Array<string>>,
  refs: React.MutableRefObject<ReactCodeMirrorRef>,
  setEditorView: Dispatcher<EditorView>,
  files: file[],
  setStruct: Dispatcher<{ [key: string]: any }>,
  path: string,
  name: string,
  value: string,
  saveFile: () => void,
  Update: () => void,
  onDelete: (path: string, name: string) => void,
  setInsert: Dispatcher<boolean>,
  insert: boolean,
  fileDialog: () => void,
  setScroll: Dispatcher<number>,
  handleDrawerClose
) {
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
    if (snackbar == true) {
      setTimeout(() => {
        setSnackbar(false);
        setSnackbarMessage([]);
      }, 3500);
    }
  }, [snackbar]);

  useEffect(() => {
    if (refs.current?.view) setEditorView(refs.current?.view);
  }, [refs.current]);

  useEffect(() => {
    if (files.length > 0) {
      setStruct(files[0].structure.children);
    }
  }, [files]);

  useEffect(() => {
    let ignore = false;
    ipcRenderer.on("in-app-command-revealInFinder", function () {
      if (!ignore) {
        revealInFinder(path);
      }
    });

    return () => {
      ignore = true;
    };
  }, [path]);

  useEffect(() => {
    let ignore = false;
    ipcRenderer.on("in-app-command-totrash", function () {
      if (!ignore) {
        onDelete(path, name);
      }
    });

    return () => {
      ignore = true;
    };
  }, [path, name]);

  useEffect(() => {
    let ignore = false;
    ipcRenderer.on("in-app-command-togglevim", function () {
      if (!ignore) {
        toggleBetweenVimAndNormalMode(setIsVim);
      }
    });

    return () => {
      ignore = true;
    };
  }, [path, name]);

  useEffect(() => {
    let ignore = false;
    ipcRenderer.on("in-app-command-topdf", function () {
      if (!ignore) {
        toPDF(value, name, setSnackbar, setSnackbarMessage);
      }
    });

    return () => {
      ignore = true;
    };
  }, [value, name]);

  useEffect(() => {
    let ignore = false;
    ipcRenderer.on("in-app-command-todocx", function () {
      if (!ignore) {
        toDOCX(value, name, setSnackbar, setSnackbarMessage);
      }
    });

    return () => {
      ignore = true;
    };
  }, [value, name]);

  useEffect(() => {
    let save = false;
    ipcRenderer.on("save", function () {
      if (!save) {
        saveFile();
        Update();
      }
    });

    return () => {
      save = true;
    };
  }, [value, path]);

  /**
   * Listen and handle drags and drops events
   */
  // useEffect(() => {
  //   dragDrop("body", (files) => {
  //     const nameOfFileAtLastIndex = files[files.length - 1].name;
  //     const extension = (file) => file.substr(file.lastIndexOf(".") + 1);
  //     const _files = files
  //       .filter(
  //         (file) =>
  //           extension(file.path) != "md" || extension(file.path) != "docx"
  //       )
  //       .map((file) => {
  //         let fileName = file.name;
  //         let filePath = file.path;
  //         // const extension = file.path.split(".").pop();
  //         if (extension(file.path) != "md" && extension(file.path) === "docx") {
  //           const docx = docxToMd(file, Update);
  //           fileName = mainPath.parse(docx).base;
  //           filePath = docx;
  //         }
  //         return {
  //           name: fileName,
  //           path: filePath,
  //         };
  //       });

  //     ipcRenderer.invoke("app:on-file-add", _files).then(() => {
  //       ipcRenderer.invoke("getTheFile").then((files = []) => {
  //         setFiles(files);
  //         setInsert(false);
  //         const index = files.findIndex(
  //           (file) => file.name === nameOfFileAtLastIndex.split(".")[0]
  //         );
  //         index !== -1
  //           ? () => {
  //               setValue(files[index].body);
  //               setName(files[index].name);
  //               setPath(files[index].path);
  //             }
  //           : () => {
  //               setValue(files[0].body);
  //               setName(files[0].name);
  //               setPath(files[0].path);
  //             };
  //         Update();
  //       });
  //     });
  //   });
  // }, []);

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

  const handleScroll = (event) => {
    let ScrollPercent = 0;
    const Scrolled = document.documentElement.scrollTop;
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    ScrollPercent = (Scrolled / MaxHeight) * 100;
    setScroll(ScrollPercent);
  };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);
  const [isRunning, setIsRunning] = React.useState(false);
  const dragDropImage = React.useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      dragDrop(".markdown-content", (images) => {
        const imageFiles = images.filter((file) => {
          const ext = mainPath.extname(file.path);
          return ext === ".jpg" || ext === ".jpeg" || ext === ".png";
        });
        imageFiles.map((validImage) =>
          imageUrl(refs.current?.view, validImage.path)
        );
        setIsRunning(false);
      });
    }
  }, [isRunning, refs.current]);
  const dragDropRef = React.useRef(dragDropImage);
  dragDropRef.current = dragDropImage;

  useEffect(() => {
    if (insert) {
      dragDropRef.current();
    }
  }, [insert, refs.current]);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(max-width: 600px)").matches) {
        handleDrawerClose();
        // call your function here
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
}
