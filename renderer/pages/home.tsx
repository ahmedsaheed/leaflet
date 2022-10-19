import React, { useEffect, useRef } from "react";
import { ipcRenderer } from "electron";
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

export default function Next() {
  type file = {
    path: string;
    name: string;
    body: string;
    structure: {[key: string]: any}
  };
  const [value, setValue] = React.useState<string>("");
  const [insert, setInsert] = React.useState<boolean>(false);
  const [scroll, setScroll] = React.useState<number>(0);
  const [files, setFiles] = React.useState<file[]>([]);
  const [name, setName] = React.useState<string>("");
  const [path, setPath] = React.useState<string>("");
  const [isEdited, setIsEdited] = React.useState<boolean>(false);
  const [fileNameBox, setFileNameBox] = React.useState<boolean>(false);
  const [fileName, setFileName] = React.useState<string>("");
  const [pandocAvailable, setPandocAvailable] = React.useState<boolean>(false);
  const [cursor, setCursor] = React.useState<string>("1L:1C");
  const [thesaurus, setThesaurus] = React.useState<string[]>([]);
  const [displayThesaurus, setDisplayThesaurus] = React.useState<boolean>(false);
  const [clockState, setClockState] = React.useState<string>();
  const [whichIsActive, setWhichIsActive] = React.useState<number>(0);
  const [count, setCount] = React.useState<number>(0);
  const [finder, toogleFinder] = React.useState<boolean>(false);
  const [found, setFound] = React.useState<boolean>(true);
  const [buttomMenuState, setButtomMenuState] = React.useState<boolean>(false);
  const [saver, setSaver] = React.useState<string>("");
  const [wordToFind, setWordToFind] = React.useState<string>("");
  const appDir = mainPath.resolve(os.homedir(), "leaflet");
  const [struct, setStruct] = React.useState<{[key: string]: any}>([]);
  const [isCreatingFolder, setIsCreatingFolder] = React.useState<boolean>(false);
  const [parentDir, setParentDir] = React.useState<string>(appDir);
  const Desktop = require("os").homedir() + "/Desktop";
  const ref = useRef<HTMLTextAreaElement>(null);
  let synonyms = {};
 

  useEffect(() => {
    openExternalInDefaultBrowser();
    checkForPandoc();
    window.addEventListener("scroll", onScroll);
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
      setName(files[0] ? `${files[0].name}` : "");
      setPath(files[0] ? `${files[0].path}` : "");
    });
    setInterval(() => {
      const date = new Date();
      setClockState(date.toLocaleTimeString());
    }, 1000);
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      setStruct(files[0].structure.children);
    }
  }, [files]);


  const createNewDir =(name) =>{
    if(fs.existsSync(mainPath.join(parentDir, name)) || name === "" ){return}
    if (fs.existsSync(parentDir)){
      fs.mkdirSync(`${parentDir}/${name}`);
      //create new file
      fs.writeFileSync(`${parentDir}/${name}/new.md`, 
      `${name} created on ${generateDate()} at ${clockState}`);
      Update();
    }
    setIsCreatingFolder(false);


  }

  const checkForPandoc = () => {
    commandExists("pandoc", (err, exists) => {
      if (exists) {
        setPandocAvailable(true);
      }
    });
  };

  const getSynonyms = () => {
    const answer:string[] = new Array() 

    let response =  find_synonym(activeWord())
    if (!response) {
      return;
    }

    for (let i = 0; i < response.length; i++) {
      answer.push(response[i]);
    }
    setThesaurus(answer);
    setDisplayThesaurus(true);
  };

  const find_synonym = (str) => {
    if (str.trim().length < 4) {
      return;
    }

    const target = str.toLowerCase();
    synonyms = SYNONYMS;

    if (synonyms[target]) {
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

  function uniq(a1) {
    var a2:string[] = new Array() 
    for (const id in a1) {
      if (a2.indexOf(a1[id]) === -1) {
        a2[a2.length] = a1[id];
      }
    }
    return a2;
  }

  const activeWordLocation = () => {
    const area = ref.current;
    const position = area!.selectionStart
    //let position:number = area?.selectionEnd;
    var from = position  - 1;

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

    function find(word) {
    if (word.trim().length < 4) {
      toogleFinder(false)
      setFound(true)
      setWordToFind("")
      return;
    }

    const area = ref.current; 
    const startPos = area?.value.toLowerCase().indexOf(word) as number | null;
    const endPos = startPos + word.length;

    if (typeof area?.selectionStart != "undefined") {
      area?.focus();
      if (startPos !== -1) {
        scrollAnimate(ref.current, endPos -100, 200)
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

  function scrollAnimate (element, to, duration) {
    const start = element.scrollTop
    const change = to - start
    let currentTime = 0
    const increment = 20 
    const animate = function () {
      currentTime += increment
      const val = easeInOutQuad(currentTime, start, change, duration)
      element.scrollTop = val
      if (currentTime < duration) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }
 
  function easeInOutQuad (t, b, c, d) {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
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
      const element = event.target  as HTMLAnchorElement | null;;
      if (element?.tagName === "A") {
        event.preventDefault();
        open(element?.href);
      }
    });

  };

  const Update = () => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setStruct(files[0].structure.children)

    });
  };
  const convertToPDF = () => {
    try{
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.pdf`;
      pandoc(value, `-f markdown -t pdf -o ${path}`, function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(path)) {
          open(path);
        }
      });
    }catch(e){
      console.log(e)
    }
  };

  const converToDocx = () => {
    try{
      const path = `${Desktop}/${name.replace(/\.md$/, "")}.docx`;
      pandoc(value, `-f markdown -t docx -o ${path}`, function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(path)) {
          open(path);
        }
      });
    }catch(e){
      console.log(e)
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
      const checkIndexNameValue = files[files.length - 1].name 
      console.log(checkIndexNameValue)
      const _files = files.map((file) => {
        let fileName = file.name;
        console.log("maddddd",fileName)
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
          const index = files.findIndex((file) => file.name === checkIndexNameValue.split(".")[0]);
        index !== -1 ?
        () => {
          setValue(files[index].body);
          setName(files[index].name);
          setPath(files[index].path);
        } : () => {
          setValue(files[0].body);
          setName(files[0].name);
          setPath(files[0].path);
        }
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
      ? ipcRenderer.invoke("createNewFile",parentDir, fileName.replace(/\.md$/, "")).then(() => {
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
            setStruct(files[0].structure.children)
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
      if (e.key === "Tab") {
        if (!insert) {
          e.preventDefault();
          return;
        }
        if (!displayThesaurus) {
          insertInTexarea("    ");
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

  const insertInTexarea = (s) => {
    const pos = ref.current!.selectionStart;
    ref.current?.setSelectionRange(pos, pos);
    document.execCommand("insertText", false, s);
  };

  const onScroll = () => {
    let ScrollPercent = 0;
    const Scrolled = document.documentElement.scrollTop;
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    ScrollPercent = (Scrolled / MaxHeight) * 100;
    setScroll(ScrollPercent);
  };

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

  const handleClick = (e) => {
    if (e.nativeEvent.button === 0) {
      console.log("Left click");
    } else if (e.nativeEvent.button === 2) {
      console.log("Right click");
    }
  };

  const toggleButtomMenu = () => {
    const menu = document.getElementById("buttomMenu");
    if (menu?.getAttribute("aria-expanded") === "false") {
      menu.setAttribute("aria-expanded", "true");
      setButtomMenuState(true);
    } else {
      menu?.setAttribute("aria-expanded", "false");
      setButtomMenuState(false);
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
            style={{ width: "30vw", maxWidth: "30vw", minHeight: "100vh" }}
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
                    textOverflow: "ellipsis",
                  }}
                >
                  <details tabIndex={1} open>
                    <summary
                      style={{
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
                          !fs.existsSync(file.path) ? null :
                          !fs.readdirSync(file.path).length ? null :
                          
                          <details key={index} tabIndex={-1}>
                            <summary
                              style={{
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
                           {file.children
                              .map((child, index) =>
                               !fs.existsSync(child.path) ? null :
                                fs.statSync(child.path).isDirectory() ? (
                                  !fs.readdirSync(child.path).length 
                                  ? null : (
                                    <div
                                      style={{
                                        borderLeft: "1px solid #2d2d2d",
                                        marginLeft: "1.8em",
                                      }}
                                    >
                                      <details key={index} tabIndex={-1}>
                                        <summary
                                          style={{
                                            cursor: "pointer",
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
                                            <ol className="files">
                                              <button
                                                style={{
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  maxWidth: "100%",
                                                  textOverflow: "ellipsis",
                                                }}
                                                tabIndex={-1}
                                                className={
                                                  path === child.path
                                                    ? "selected"
                                                    : "greys"
                                                }
                                                onClick={(e) => {
                                                  try {
                                                    setParentDir(mainPath.dirname(child.path));
                                                    handleClick(e);
                                                    saveFile();
                                                    setValue(
                                                      fs.readFileSync(
                                                        child.path,
                                                        "utf8"
                                                      )
                                                    );
                                                    setName(child.name);
                                                    setPath(child.path);
                                                    setInsert(false);
                                                  } catch (err) {
                                                    console.log(err);
                                                  }
                                                }}
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
                                                  <svg
                                                    style={{
                                                      display: "inline",
                                                    }}
                                                    height="22"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      fill="#888888"
                                                      d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35l1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35l-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z"
                                                    />
                                                  </svg>{" "}
                                                  {child.name}
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
                                  <ol className="files">
                                    <button
                                      style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        maxWidth: "100%",
                                      }}
                                      tabIndex={-1}
                                      className={
                                        path === child.path
                                          ? "selected"
                                          : "greys"
                                      }
                                      onClick={(e) => {
                                        try {
                                          handleClick(e);
                                          saveFile();
                                          setValue(
                                            fs.readFileSync(child.path, "utf8")
                                          );
                                          setName(child.name);
                                          setPath(child.path);
                                          setInsert(false);
                                        } catch (err) {
                                          console.log(err);
                                        }
                                      }}
                                    >
                                      {child.name}
                                    </button>
                                  </ol>
                                ) 
                              )}
                          </details>
                        ) : (
                          <>
                            <ol className="files">
                              <button
                                tabIndex={-1}
                                className={
                                  path === file.path ? "selected" : "greys"
                                }
                                onContextMenu={(e) => {
                                  handleClick(e);
                                }}
                                onClick={(e) => {
                                  try{
                                  setParentDir(mainPath.dirname(file.path));
                                  handleClick(e);
                                  saveFile();
                                  setValue(fs.readFileSync(file.path, "utf8"));
                                  setName(file.name);
                                  setPath(file.path);
                                  setInsert(false)
                                  }catch(err){
                                    console.log(err)
                                  }
                                }}
                              >
                                <p
                                  style={{ display: "inline" }}
                                >{`${file.name} `}</p>
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
                           isCreatingFolder ? createNewDir(fileName) : createNewFile();
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
                          placeholder= {isCreatingFolder ? "Folder Name" : "File Name"}
                          onChange={(e) => setFileName(e.target.value)}
                        />
                      </form>
                    ) : null}
                  </details>
                </div>
                <div className="fixed bottom-1">
                  <div
                    tabIndex={-1}
                    id="buttomMenu"
                    role="button"
                    aria-expanded="false"
                    onClick={toggleButtomMenu}
                    style={{ cursor: "pointer" }}
                  >
                    <p
                      style={{ display: "inline" }}
                      className={buttomMenuState ? "Opened" : "Closed"}
                    ></p>
                    <p style={{ display: "inline" }}>UTILITIES</p>
                  </div>
                  <div
                    className={buttomMenuState ? "slideIn" : ""}
                    style={
                      buttomMenuState
                        ? { display: "block", opacity: "0", paddingLeft: "2vw" }
                        : { display: "none" }
                    }
                  >
                    <button tabIndex={-1} onClick={openWindow}>
                      Add File
                    </button>
                    <br />
                    <button
                      tabIndex={-1}
                      onClick={() => {
                        setFileNameBox(true);
                      }}
                    >
                      New File
                    </button>
                    <br />
                    <button tabIndex={-1} onClick={() => {
                      setFileNameBox(true);
                      setIsCreatingFolder(true);
                    }}>
                      New Folder
                    </button>
                    {pandocAvailable ? (
                      <>
                        <br />
                        <button tabIndex={-1} onClick={convertToPDF}>
                          Covert to PDF
                        </button>
                        <br />
                        <button tabIndex={-1} onClick={converToDocx}>
                          Covert to Docx
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingRight: "20px",
            maxWidth: "70vw",
            paddingTop: "10vh",
          }}
        >
          {insert ? (
            <div>
              <div style={{ overflow: "hidden" }}>
                <textarea
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
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ overflow: "hidden" }}>
                <div
                  id="previewArea"
                  style={{
                    marginTop: "2em",
                    marginBottom: "5em",
                    overflow: "scroll",
                  }}
                  className="third h-full w-full"
                  dangerouslySetInnerHTML={getMarkdown(value)}
                />
              </div>
            </>
          )}
          <div
            className="fixed inset-x-0 bottom-0 ButtomBar"
            style={{
              userSelect: "none",
              marginLeft: "30%",
              maxHeight: "10vh",
              marginTop: "20px",
            }}
          >
            {displayThesaurus && insert ? (
              <div
                style={{
                  paddingTop: "5px",
                  paddingRight: "40px",
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
                    paddingLeft: "40px",
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
                          } find(wordToFind) 
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
                    paddingLeft: "40px",
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
                  <span style={{ float: "left" }}>
                    <svg
                      style={{ display: "inline" }}
                      width="32"
                      height="22"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#888888"
                        d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35l1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35l-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z"
                      />
                    </svg>
                  </span>
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
