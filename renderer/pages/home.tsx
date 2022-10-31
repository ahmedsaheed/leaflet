import React, { useCallback, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import "react-cmdk/dist/cmdk.css";
import {
  PDFIcon,
  DOCXIcon,
  MARKDOWNIcon,
  COMMANDPALLETEOPENIcon,
  COMMANDPALLETESELECTIcon,
} from "../lib/util";
import { 
  METADATE,
  METATAGS,
  METAMATERIAL
} from "../lib/metadata";
import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";
import { progress } from "../components/progress";
import { getMarkdown } from "../lib/mdParser";
import commandExists from "command-exists";
import { SYNONYMS } from "../lib/synonyms";
import fs from "fs-extra";
import dragDrop from "drag-drop";
import Head from "next/head";
import pandoc from "node-pandoc";
import mainPath from "path";
import open from "open";
import os from "os";
import { languages } from "@codemirror/language-data";
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {getStatistics} from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view";
import {tags} from "@lezer/highlight";
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";



export default function Next() {
  type file = {
    path: string;
    name: string;
    body: string;
    structure: { [key: string]: any };
  };
  const [value, setValue] = useState<string>("");
  const [insert, setInsert] = useState<boolean>(false);
  const [files, setFiles] = useState<file[]>([]);
  const [scroll, setScroll] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [page, setPage] = useState<"root" | "projects">("root");
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [click, setClick] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [fileNameBox, setFileNameBox] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [pandocAvailable, setPandocAvailable] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string>("1L:1C");
  const [thesaurus, setThesaurus] = useState<string[]>([]);
  const [displayThesaurus, setDisplayThesaurus] = useState<boolean>(false);
  const [clockState, setClockState] = useState<string>();
  const [whichIsActive, setWhichIsActive] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [finder, toogleFinder] = useState<boolean>(false);
  const [found, setFound] = useState<boolean>(true);
  const [saver, setSaver] = useState<string>("");
  const [wordToFind, setWordToFind] = useState<string>("");
  const appDir = mainPath.resolve(os.homedir(), "leaflet");
  const [struct, setStruct] = useState<{ [key: string]: any }>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [parentDir, setParentDir] = useState<string>(appDir);
  const Desktop = require("os").homedir() + "/Desktop";
  const ref = useRef<HTMLTextAreaElement>(null);
  let synonyms = {};

  useEffect(() => {
    openExternalInDefaultBrowser();
    checkForPandoc();
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
      setName(files[0] ? `${files[0].name}` : "");
      setPath(files[0] ? `${files[0].path}` : "");
    });

  }, []);


  // const highlight = HighlightStyle.define([
  //   {
  //     tag: tags.heading1,
  //     fontSize: '1.6em',
  //     fontWeight: 'bold'
  //   },
  //   {
  //     tag: tags.heading2,
  //     fontSize: '1.4em',
  //     fontWeight: 'bold'
  //   },
  //   {
  //     tag: tags.heading3,
  //     fontSize: '1.2em',
  //     fontWeight: 'bold'
  //   }
  // ])

  const transparentTheme = EditorView.theme({
    '&': {
      backgroundColor: 'transparent !important',
    },
  })

  useEffect(() => {
    let clock = setInterval(() => {
      const date = new Date();
      setClockState(date.toLocaleTimeString());
    }, 1000);
    return () => {
      clearInterval(clock);
    }
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      setStruct(files[0].structure.children);
    }
  }, [files]);

  useEffect(() => {
  const handleScroll = () => {
    let ScrollPercent = 0;
    const Scrolled = document.documentElement.scrollTop;
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    ScrollPercent = (Scrolled / MaxHeight) * 100;
    setScroll(ScrollPercent);
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const updateCursor = (a,b) => {
    const line = a.number
    const column = b - a.from
    setCursor(`${line}L:${column}C`)

  }
    
  const onChange = useCallback((doc, viewUpdate) => {
    setValue(doc.toString())
    updateCursor(viewUpdate.state.doc.lineAt(getStatistics(viewUpdate).selection.main.head), getStatistics(viewUpdate).selection.main.head)
    // if (doc.toString() === fs.readFileSync(path, "utf8")) {
    //   setIsEdited(false);
    // } else {
    //   setSaver("EDITED");
    //   setIsEdited(true);
    // }
  },[])
  const capitalize = (s: string) => {
    if (typeof s !== "string") return "";
    const words = s.split(" ");

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1) + " ";
    }
    words.join(" ");

    return words;
  };

  const filteredItems = filterItems(
    [
      {
        heading: "General",
        id: "general",
        items: [
          {
            id: "new",
            children: "New File",
            icon: "NewspaperIcon",
            showType: false,
            onClick: () => {
              setFileNameBox(true);
            },
          },
          {
            id: "folder",
            children: "New Folder",
            icon: "FolderOpenIcon",
            showType: false,
            onClick: () => {
              try {
                setIsCreatingFolder(true);
                setFileNameBox(true);
              } catch (e) {
                console.log(e);
              }
            },
          },
          {
            id: "export",
            showType: false,
            disabled: pandocAvailable ? false : true,
            children: `Export ${
              name.endsWith(".md")
                ? name.charAt(0).toUpperCase() + name.slice(1, -3)
                : name.charAt(0).toUpperCase() + name.slice(1)
            } to PDF`,
            icon: () => <PDFIcon />,
            onClick: () => {
              try {
                convertToPDF();
              } catch (e) {
                console.log(e);
              }
            },
          },
          {
            disabled: pandocAvailable ? false : true,
            id: "export",
            showType: false,
            children: `Export ${
              name.endsWith(".md")
                ? name.charAt(0).toUpperCase() + name.slice(1, -3)
                : name.charAt(0).toUpperCase() + name.slice(1)
            } to Docx`,
            icon: () => <DOCXIcon />,
            onClick: () => {
              try {
                converToDocx();
              } catch (e) {
                console.log(e);
              }
            },
          },
        ],
      },
      {
        heading: "Files",
        id: "files",
        // @ts-ignore
        items: [
          ...files.map((file) => ({
            id: file.name,
            showType: false,
            //children: file.name,
            children: (
              <p>
                {file.name} —{" "}
                <span style={{ fontSize: "12px", color: "#888888" }}>
                  {capitalize(
                    mainPath.basename(mainPath.dirname(file.path)).toLowerCase()
                  )}
                </span>
              </p>
            ),
            icon: "DocumentTextIcon",
            onClick: () => {
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
            },
          })),
        ],
      },
      {
        heading: "Help",
        id: "advanced",
        items: [
          {
            id: "help",
            showType: false,
            children: "Help & Documentation",
            icon: "QuestionMarkCircleIcon",
            onClick: (event) => {
              event.preventDefault();
              open("https://github.com/ahmedsaheed/Leaflet");
            },
          },
          {
            id: "keys",
            showType: false,
            children: "Keyboard Shortcuts",
            icon: "KeyIcon",
            onClick: (event) => {
              event.preventDefault();
              open(
                "https://github.com/ahmedsaheed/Leaflet#shortcuts-and-controls"
              );
            },
          },
        ],
      },
    ],
    search
  );
  const createNewDir = (name: string) => {
    if (fs.existsSync(mainPath.join(parentDir, name)) || name === "") {
      return;
    }
    if (fs.existsSync(parentDir)) {
      fs.mkdirSync(`${parentDir}/${name}`);
      fs.writeFileSync(
        `${parentDir}/${name}/new.md`,
        `${name} created on ${generateDate()} at ${clockState}`
      );
      Update();
    }
    setIsCreatingFolder(false);
  };

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

  const getSynonyms = () => {
    const answer: string[] = new Array();
    let response = find_synonym(activeWord());
    if (!response) {
      return;
    }

    for (let i = 0; i < response.length; i++) {
      answer.push(response[i]);
    }
    setThesaurus(answer);
    setDisplayThesaurus(true);
  };

  const find_synonym = (str: string) => {
    if (str.trim().length < 4) {
      return;
    }

    const target = str.toLowerCase();
    synonyms = SYNONYMS;

    if (synonyms[target]) {
      console.log(typeof synonyms[target]);
      return uniq(synonyms[target]);
    }

    if (target[target.length - 1] === "s") {
      const singular = synonyms[target.substr(0, target.length - 1)];
      if (synonyms[singular]) {
        return uniq(synonyms[singular]);
      }
    }
  };

  const activeWord = () => {
    const area = ref.current;
    const l = activeWordLocation();
    return area?.value.substr(l.from, l.to - l.from);
  };

  function uniq(a1: string[]) {
    var a2: string[] = new Array();
    for (const id in a1) {
      if (a2.indexOf(a1[id]) === -1) {
        a2[a2.length] = a1[id];
      }
    }
    return a2;
  }

  const activeWordLocation = () => {
    const area = ref.current;
    const position = area!.selectionStart;
    var from = position - 1;

    // Find beginning of word
    while (from > -1) {
      const char = area?.value[from];
      if (!char || !char.match(/[a-z]/i)) {
        break;
      }
      from -= 1;
    }

    // Find end of word
    let to = from + 1;
    while (to < from + 30) {
      const char = area?.value[to];
      if (!char || !char.match(/[a-z]/i)) {
        break;
      }
      to += 1;
    }

    from += 1;
    return { from: from, to: to, word: area?.value.substring(from, to) };
  };

  const replaceActiveWord = (word) => {
    try {
      if (!word) {
        return;
      }

      const area = ref.current;

      const l = activeWordLocation();
      const w = area?.value.substr(l.from, l.to - l.from);

      if (w?.substr(0, 1) === w?.substr(0, 1)?.toUpperCase()) {
        word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length);
      }
      area?.setSelectionRange(l.from, l.to);
      document.execCommand("insertText", false, word);
      area?.focus();
    } catch (e) {
      console.log(e);
    }
  };

  const nextSynonym = () => {
    setWhichIsActive(0);
    const element = document.getElementById("thesaurusWords");
    var previousWord = element!.children[whichIsActive] as HTMLElement;
    setWhichIsActive((whichIsActive + 1) % thesaurus.length);
    setCount(count + 1);
    const currentWord = element?.children[whichIsActive];
    if (previousWord) {
      previousWord.style.display = "none";
    }
    if (currentWord) {
      currentWord.classList.add("active");
      currentWord.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  function find(word: string) {
    if (word.trim().length < 4) {
      toogleFinder(false);
      setFound(true);
      setWordToFind("");
      return;
    }

    const area = ref.current;
    const startPos = area?.value.toLowerCase().indexOf(word) as number | null;
    const endPos = startPos + word.length;

    if (typeof area?.selectionStart != "undefined") {
      area?.focus();
      if (startPos !== -1) {
        scrollAnimate(area, endPos - 100, 200);
        area.setSelectionRange(startPos, endPos);
        toogleFinder(false);
      } else {
        area.setSelectionRange(area.selectionStart, area.selectionStart);
        setFound(false);
        setTimeout(() => {
          toogleFinder(false);
          setFound(true);
          setWordToFind("");
        }, 2000);
      }
      return startPos;
    }
    return startPos;
  }

  function scrollAnimate(element: HTMLElement, to: number, duration: number) {
    const start = element.scrollTop;
    const change = to - start;
    let currentTime = 0;
    const increment = 20;
    const animate = function () {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  function easeInOutQuad(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  const generateDate = () => {
    const date = new Date();
    const strArray = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const s =
      "" +
      (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()) +
      "-" +
      strArray[date.getMonth()] +
      "-" +
      date.getFullYear() +
      " ";
    return s;
  };

  const openExternalInDefaultBrowser = () => {
    document.addEventListener("click", (event) => {
      const element = event.target as HTMLAnchorElement | null;
      if (
         element?.tagName === "A" &&
        (element?.href.indexOf(window.location.href) > -1 === false) 
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
  const convertToPDF = () => {
    try {
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.pdf`;
      pandoc(value, `-f markdown -t pdf -o ${path}`, function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(path)) {
          open(path);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const converToDocx = () => {
    try {
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.docx`;
      pandoc(value, `-f markdown -t docx -o ${path}`, function (err, result) {
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

  useEffect(() => {
    dragDrop("body", (files) => {
      const checkIndexNameValue = files[files.length - 1].name;
      console.log(checkIndexNameValue);
      const _files = files.map((file) => {
        let fileName = file.name;
        console.log("maddddd", fileName);
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
          // set the value to currently added file
          const index = files.findIndex(
            (file) => file.name === checkIndexNameValue.split(".")[0]
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

  const commentOut = () => {
    const area = ref.current;
    if (area?.selectionEnd === area?.selectionStart) {
      return;
    }
    let first = area!.selectionStart;
    let second = area!.selectionEnd;
    let length = second - first;
    let selectedText = area!.value.substr(first, length);
    if (selectedText.startsWith("<!--") && selectedText.endsWith("-->")) {
      area!.value = area!.value.substr(0, first) + area?.value.substr(second);
      area?.setSelectionRange(first, first);
      document.execCommand(
        "insertText",
        false,
        `${selectedText.substr(4, selectedText.length - 8)}`
      );
    } else {
      area!.value = area?.value.substr(0, first) + area!.value.substr(second);
      area?.setSelectionRange(first, first);
      document.execCommand("insertText", false, `<!-- ${selectedText} -->`);
    }
  };

  const bold = () => {
    const area = ref.current;
    let first = area!.selectionStart;
    let second = area!.selectionEnd;
    let length = second - first;
    let selectedText = area!.value.substr(first, length);
    selectedText.startsWith("**") && selectedText.endsWith("**")
      ? document.execCommand(
          "insertText",
          false,
          `${selectedText.substr(2, selectedText.length - 4)}`
        )
      : document.execCommand("insertText", false, `**${selectedText}** `);
    area?.setSelectionRange(first + 2, first + 2);
  };

  const createLink = () => {
    const area = ref.current;
    let first = area!.selectionStart;
    let second = area!.selectionEnd;
    let length = second - first;
    let selectedText = area?.value.substr(first, length);
    if (selectedText?.match("[(.*?)]((.*?))")) {
      return;
    }
    area!.value = area!.value.substr(0, first) + area?.value.substr(second);
    area?.setSelectionRange(first, first);
    document.execCommand("insertText", false, `[${selectedText}](url)`);
    selectedText?.length === 0
      ? area?.setSelectionRange(first + 1, first + 1)
      : area?.setSelectionRange(
          first + 1 + selectedText!.length + 2,
          first + 1 + selectedText!.length + 5
        );
  };

  const createNewFile = () => {
    fileName != ""
      ? ipcRenderer
          .invoke("createNewFile", parentDir, fileName.replace(/\.md$/, ""))
          .then(() => {
            setFiles(files);
            Update();
          })
      : null;
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
        bold();
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        convertToPDF();
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        converToDocx();
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        if (!insert) {
          return;
        }
        toogleFinder(true);
        document.getElementById("finderInput")?.focus();
        e.preventDefault();
        return;
      }

      if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
        setInsert(true);
        e.preventDefault();
        return;
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
        createLink();
      }

      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        setFileNameBox(true);
        e.preventDefault();
        return;
      }

      // I need new key for this
      if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        insertInTexarea(generateDate());
        e.preventDefault();
        return;
      }
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        commentOut();
        e.preventDefault();
        return;
      }

      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        (e.ctrlKey || e.metaKey)
      ) {
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
        e.preventDefault();
        return;
      }

      if (e.key === "t" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        insertInTexarea(clockState);
        e.preventDefault();
        return;
      }
      if (e.key === "j" && (e.ctrlKey || e.metaKey)) {
        if (!insert) {
          return;
        }
        addYaml();
        e.preventDefault();
        return;
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
      if (displayThesaurus) {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            nextSynonym();
            replaceActiveWord(thesaurus[whichIsActive]);
            e.preventDefault();
            return;
          } else {
            replaceActiveWord(thesaurus[0]);
            setTimeout(() => {
              setDisplayThesaurus(false);
            }, 100);
            saveFile();
            e.preventDefault();
            return;
          }
        }
      }
    };
  });

  const insertInTexarea = (s: string) => {
    const area = ref.current;
    const pos = area.selectionStart;
    area.setSelectionRange(pos, pos);
    document.execCommand("insertText", false, s);
  };

  function newChangeHandler(doc: string) {
    setValue(doc);
    if (doc === fs.readFileSync(path, "utf8")) {
      setIsEdited(false);
    } else {
      setSaver("EDITED");
      setIsEdited(true);
    }

  }

  function handleChange(e) {
    setValue(e.target.value);
    if (e.target.value === fs.readFileSync(path, "utf8")) {
      setIsEdited(false);
    } else {
      setSaver("EDITED");
      setIsEdited(true);
    }
  }
  const openWindow = () => {
    ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
      ipcRenderer.invoke("getTheFile").then((files = []) => {
        setFiles(files);
        Update();
      });
    });
  };

  const addYaml = () => {
    const area = ref.current;
    const pos = area.selectionStart;
    area.setSelectionRange(pos, pos);
    document.execCommand(
      "insertText",
      false,
      `---
 tags:
  - programming
  - computers
  - conversations
 material:
  - {github: 'https://github.com/'} 
  - {mala: 'https://github.com/'}
  - {xala: 'https://github.com/'}   
---`
    );
    area.setSelectionRange(pos + 4, pos + 4);
  };

  const checkObject = (obj) => {
    // if (Object.keys(obj).length === 0) {
    //   return false;
    // }
    // return true;
    return typeof obj === 'object' && obj !== null;

  };

  

  const cursorUpdate = (e) => {
    if (e.target.selectionStart !== e.target.selectionEnd) {
      setCursor(`[${e.target.selectionStart}, ${e.target.selectionEnd}]`);
    } else {
      var textLines = e.target.value
        .substr(0, e.target.selectionEnd)
        .split("\n");
      var lineNo = textLines.length - 1;
      var colNo = textLines[lineNo].length;
      setCursor(`${lineNo}L ${colNo}C`);
    }
  };

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
        <div>
          <div
            className="fs fixed"
            style={{ width: "18.5em", maxWidth: "18.5em", minHeight: "100vh" }}
          >
            <div>
              <div
                style={{
                  height: "100vh",
                  marginTop: "10vh",
                  paddingTop: "2em",
                }}
              >
                <div
                  className="fileBody"
                  style={{
                    marginTop: "2vh",
                    marginBottom: "2vh",
                    maxHeight: "70vh",
                    overflow: "hidden",
                    outline: "none",
                    overflowY: "scroll",
                    textOverflow: "ellipsis",
                  }}
                >
                  <details tabIndex={-1} open>
                    <summary
                      style={{
                        outline: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        fontFamily:
                          "--apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                      }}
                    >
                      {" "}
                      Leaflet
                    </summary>
                    {struct
                      .map((file, index) =>
                        file.children ? (
                          !fs.existsSync(file.path) ? null : !fs.readdirSync(
                              file.path
                            ).length ? null : (
                            <details key={index} tabIndex={-1}>
                              <summary
                                className="files"
                                style={{
                                  outline: "none",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  fontFamily:
                                    "--apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                                  marginLeft: "1em",
                                }}
                                onClick={() => {
                                  setParentDir(file.path);
                                }}
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
                                          className="files"
                                          style={{
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            maxWidth: "100%",
                                            outline: "none",
                                            textOverflow: "ellipsis",
                                          }}
                                          onClick={() => {
                                            setParentDir(file.path);
                                          }}
                                        >
                                          {" "}
                                          {child.name.charAt(0).toUpperCase() +
                                            child.name.slice(1)}
                                        </summary>
                                        {child.children
                                          .map((child, index) => (
                                            <ol
                                              className="files"
                                              style={{
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                onFileTreeClick(
                                                  child.path,
                                                  child.name
                                                );
                                              }}
                                            >
                                              <button
                                                style={{
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  outline: "none",
                                                  maxWidth: "100%",
                                                  textOverflow: "ellipsis",
                                                }}
                                                tabIndex={-1}
                                                className={
                                                  path === child.path
                                                    ? "selected"
                                                    : "greys"
                                                }
                                              >
                                                <p
                                                  style={{
                                                    display: "inline",
                                                    width: "100%",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
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
                                    className="files"
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
                                      className={
                                        path === child.path
                                          ? "selected"
                                          : "greys"
                                      }
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
                                        <MARKDOWNIcon />{" "}
                                        {child.name.slice(0, -3)}
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
                              className="files"
                              onClick={() => {
                                onFileTreeClick(file.path, file.name);
                              }}
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              <button
                                tabIndex={-1}
                                style={{outline: "none"}}
                                className={
                                  path === file.path ? "selected" : "greys"
                                }
                              >
                                <p
                                  style={{
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
                        onSubmit={() => {
                          if (fileName.length < 1) {
                            setFileNameBox(false);
                            return;
                          }
                          isCreatingFolder
                            ? createNewDir(fileName)
                            : createNewFile();
                          setFileNameBox(false);
                          setTimeout(() => {
                            setFileName("");
                          }, 100);
                        }}
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
                  </details>
                </div>
                <div
                  className={"fixed util"}
                  style={{
                    bottom: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      paddingLeft: "10px",
                      width: "18.5em",
                      maxWidth: "18.5em",
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
                      <CommandPalette
                        onChangeSearch={setSearch}
                        onChangeOpen={setClick}
                        search={search}
                        isOpen={menuOpen}
                        page={page}
                        placeholder="Search for notes and utilities"
                        footer={
                          <div
                            style={{
                              fontSize: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                marginLeft: "2em",
                                display: "flex",
                                alignItems: "center",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                              }}
                            >
                              <span
                                style={{ marginRight: "2em", color: "#888888" }}
                              >
                                <COMMANDPALLETESELECTIcon />
                                &nbsp;Select
                              </span>

                              <span style={{ color: "#888888" }}>
                                <COMMANDPALLETEOPENIcon />
                                &nbsp;Open
                              </span>
                            </div>
                          </div>
                        }
                      >
                        <CommandPalette.Page id="root">
                          {filteredItems.length ? (
                            filteredItems.map((list) => (
                              <CommandPalette.List
                                key={list.id}
                                heading={list.heading}
                              >
                                {list.items.map(({ id, ...rest }) => (
                                  <CommandPalette.ListItem
                                    showType={true}
                                    key={id}
                                    index={getItemIndex(filteredItems, id)}
                                    {...rest}
                                  />
                                ))}
                              </CommandPalette.List>
                            ))
                          ) : (
                            <CommandPalette.FreeSearchAction />
                          )}
                        </CommandPalette.Page>

                        <CommandPalette.Page id="projects">
                        </CommandPalette.Page>
                      </CommandPalette>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "40px",
            width: "calc(100vw - 18.5em)",
            minWidth: "calc(100vw - 18.5em)",
            maxWidth: "calc(100vw - 18.5em)",
            paddingTop: "10vh",
          }}
        >
          {insert ? (
            <div className="markdown-content">
              <div style={{ overflow: "hidden" }}>
                {/* <textarea
                  ref={ref}
                  autoFocus
                  id="markdown-content"
                  value={value}
                  onScroll={() => {
                    displayThesaurus ? setDisplayThesaurus(false) : null;
                    finder ? toogleFinder(false) : null;
                  }}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    cursorUpdate(e);
                  }}
                  onKeyUp={(e) => {
                    cursorUpdate(e);
                    getSynonyms();
                  }}
                  onMouseUp={(e) => {
                    cursorUpdate(e);
                    getSynonyms();
                  }}
                  onMouseDown={(e) => {
                    cursorUpdate(e);
                    toogleFinder(false);
                    setDisplayThesaurus(false);
                    setWhichIsActive(0);
                  }}
                  spellCheck="false"
                  className="h-full w-full"
                  autoComplete="false"
                  autoCorrect="false"
                  style={{
                    marginTop: "2em",
                    height: "calc(100vh - 80px)",
                    backgroundColor: "transparent",
                    marginBottom: "5em",
                    overflow: "auto",
                    display: "block",
                  }}
                /> */}
                
                  <CodeMirror
                        value={value}
                        height="100%"
                        width="100%"
                        theme={githubDark}
                        basicSetup={false}
                        extensions={[ 
                          indentOnInput(),
                          //transparentTheme,
                        markdown({
                          base: markdownLanguage,
                          codeLanguages: languages,
                          addKeymap: true
                        }),
                        [EditorView.lineWrapping],
                        ]}
                        onChange={onChange}
                      />

              </div>
            </div>
          ) : (
            <>
              <div style={{ overflow: "hidden" }}>
                {/* <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    lineHeight: "1.2",
                    fontWeight: "700",
                    userSelect: "none",
                  }}
                >
                  <h1
                    style={{
                      width: "100%",
                      fontSize: "40px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      padding: "3px 2px",
                    }}
                  >
                    {name?.endsWith(".md")
                      ? capitalize(name.slice(0, -3).replace(/-/g, " "))
                      : capitalize(name.replace(/-/g, " ").replace(/_/g, " "))}
                  </h1>
                </div> */}
                <div style={{ paddingTop: "1em", userSelect: "none" }}>
                  {checkObject(getMarkdown(value).metadata) ? (
                    <>
                    <METADATE incoming={getMarkdown(value).metadata.date} />
                    <METATAGS incoming={getMarkdown(value).metadata.tags} />
                    <METAMATERIAL incoming={getMarkdown(value).metadata.material} />

                    </>
                  ) : null}
                </div>
                <div
                  id="previewArea"
                  style={{
                    marginTop: "2em",
                    marginBottom: "5em",
                    overflow: "scroll",
                  }}
                  className="third h-full w-full"
                  dangerouslySetInnerHTML={getMarkdown(value).document}
                />
              </div>
            </>
          )}
          <div
            className="fixed inset-x-0 bottom-0 ButtomBar"
            style={{
              display: "inline",
              userSelect: "none",
              marginLeft: "18.55em",
              maxHeight: "10vh",
              marginTop: "20px",
            }}
          >
            {displayThesaurus && insert ? (
              <div
                style={{
                  paddingTop: "5px",
                  paddingRight: "30px",
                  paddingBottom: "5px",
                  alignContent: "center",
                  overflow: "hidden",
                }}
              >
                <li
                  id="thesaurusWords"
                  style={{
                    marginBottom: "5px",
                    listStyleType: "none",
                    marginRight: "10px",
                    display: "inline",
                  }}
                >
                  {thesaurus.map((item, index) => {
                    return (
                      <ul
                        style={{
                          display: "inline",
                          overflowX: "scroll",
                          color: "grey",
                        }}
                      >
                        <span
                          style={{
                            textDecoration: `${
                              index === whichIsActive ? "underline" : "none"
                            }`,
                          }}
                        >
                          {item}
                        </span>
                      </ul>
                    );
                  })}
                </li>
              </div>
            ) : finder ? (
              <>
                <div
                  className="Left"
                  style={{
                    float: "left",
                    paddingLeft: "30px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  <span>
                    <b>Find:</b>
                    {found ? (
                      <form
                        style={{ display: "inline" }}
                        onSubmit={() => {
                          if (wordToFind.length < 1) {
                            toogleFinder(false);
                            return;
                          }
                          find(wordToFind);
                        }}
                      >
                        <input
                          id="finderInput"
                          autoFocus
                          className="createFile"
                          type="text"
                          placeholder="Search a word"
                          onChange={(e) =>
                            setWordToFind(e.target.value.toLowerCase())
                          }
                        />
                      </form>
                    ) : (
                      <span style={{ display: "inline" }}> Not Found</span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="Left"
                  style={{
                    float: "left",
                    paddingLeft: "30px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  <span>{`${insert ? "INSERT" : "PREVIEW"}`}</span>
                  <div style={{ display: "inline", marginRight: "30px" }}></div>
                  <span>{`${value.toString().split(" ").length}W ${
                    value.toString().length
                  }C `}</span>
                  <div style={{ display: "inline", marginRight: "30px" }}></div>
                  <div
                    style={{
                      display: "inline",
                      color: "grey",
                      overflow: "hidden",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: insert ? cursor : progress(scroll),
                    }}
                  />
                  {isEdited && insert ? (
                    <>
                      <div
                        style={{ display: "inline", marginRight: "30px" }}
                      ></div>
                      <button
                        style={{
                          display: "inline",
                          color: "grey",
                          overflow: "hidden",
                        }}
                        id="save"
                        tabIndex={-1}
                        onClick={() => {
                          try {
                            saveFile();
                          } catch {
                            console.log("error");
                          }
                        }}
                      >
                        {saver}
                      </button>
                    </>
                  ) : null}
                </div>
                <div
                  className="Right"
                  style={{
                    float: "right",
                    paddingRight: "40px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  <div style={{ display: "inline", marginLeft: "20px" }}></div>
                  {clockState}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
