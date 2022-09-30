import React, { useEffect, useRef } from "react";
import { ipcRenderer } from "electron";
var shell = require("electron").shell;
import { progress } from "../components/progress.ts";
import { getMarkdown } from "../lib/mdParser.ts";
import commandExists from "command-exists";
import { SYNONYMS } from "../lib/synonyms.js";
import fs from "fs-extra";
import dragDrop from "drag-drop";
import Head from "next/head";
import pandoc from "node-pandoc";
import mainPath from "path";
import open from "open";
import os from "os";

export default function Next() {
  const [value, setValue] = React.useState("");
  const [insert, setInsert] = React.useState(false);
  const [scroll, setScroll] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [name, setName] = React.useState("");
  const [path, setPath] = React.useState("");
  const [isEdited, setIsEdited] = React.useState(false);
  const [fileNameBox, setFileNameBox] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [pandocAvailable, setPandocAvailable] = React.useState(false);
  const [cursor, setCursor] = React.useState("1L:1C");
  const [thesaurus, setThesaurus] = React.useState([]);
  const [displayThesaurus, setDisplayThesaurus] = React.useState(false);
  const [clockState, setClockState] = React.useState();
  const [whichIsActive, setWhichIsActive] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [finder, toogleFinder] = React.useState(false);
  const [buttomMenuState, setButtomMenuState] = React.useState(false);
  const [saver, setSaver] = React.useState("");
  const [wordToFind, setWordToFind] =  React.useState("")
  const appDir = mainPath.resolve(os.homedir(), "leaflet");
  const Desktop = require("os").homedir() + "/Desktop";
  const ref = useRef(null);
  let synonyms = {};

  //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_ INIT, CHECK FOR PANDOC & CLOCK-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
  useEffect(() => {
    openExternalInDefaultBrowser();
    checkForPandoc();
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
      setName(files[0] ? `${files[0].name}` : "");
      setPath(files[0] ? `${files[0].path}` : "");
      //console.log(typeof files[0].tree.children)
    });
    setInterval(() => {
      const date = new Date();
      setClockState(date.toLocaleTimeString());
    }, 1000);
  }, []);

  const checkForPandoc = () => {
    commandExists("pandoc", (err, exists) => {
      if (exists) {
        setPandocAvailable(true);
      }
    });
  };

  //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_SYNONYMS GENERATOR-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

  const getSynonyms = () => {
    // const l = activeWordLocation();
    const answer = [];
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

    return;
  };

  const activeWord = () => {
    const area = ref.current;
    const l = activeWordLocation();
    return area.value.substr(l.from, l.to - l.from);
  };

  function uniq(a1) {
    const a2 = [];
    for (const id in a1) {
      if (a2.indexOf(a1[id]) === -1) {
        a2[a2.length] = a1[id];
      }
    }
    return a2;
  }

  const activeWordLocation = () => {
    const area = ref.current;
    let position = area.selectionEnd;
    let from = position - 1;

    // Find beginning of word
    while (from > -1) {
      const char = area.value[from];
      if (!char || !char.match(/[a-z]/i)) {
        break;
      }
      from -= 1;
    }

    // Find end of word
    let to = from + 1;
    while (to < from + 30) {
      const char = area.value[to];
      if (!char || !char.match(/[a-z]/i)) {
        break;
      }
      to += 1;
    }

    from += 1;
    return { from: from, to: to, word: area.value.substring(from, to) };
  };

  const replaceActiveWord = (word) => {
    try {
      if (!word) {
        return;
      }

      const area = ref.current;

      const l = activeWordLocation();
      const w = area.value.substr(l.from, l.to - l.from);

      if (w.substr(0, 1) === w.substr(0, 1).toUpperCase()) {
        word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length);
      }
      area.setSelectionRange(l.from, l.to);
      document.execCommand("insertText", false, word);
      area.focus();
    } catch (e) {
      console.log(e);
    }
  };

  const nextSynonym = () => {
    setWhichIsActive(0);
    const element = document.getElementById("thesaurusWords");
    let previousWord = element.children[whichIsActive];
    setWhichIsActive((whichIsActive + 1) % thesaurus.length);
    setCount(count + 1);
    const currentWord = element.children[whichIsActive];
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
  //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-UTILITIES & ELECTRON RELATED_-_-_-_-_-_-_-_-_-_-_-_-_-

  function find(word) {
    const area = ref.current
    const words = area.value.split(" ");
      const startPos = area.value.toLowerCase().indexOf(word),
      endPos = startPos + word.length
  
    if (typeof(area.selectionStart) != "undefined") {
       area.focus();
       scrollTo(area, endPos)
        area.setSelectionRange(startPos, endPos);
        toogleFinder(false)
      return true;
    }
    return false;
  }
  function scrollTo(textarea, selectionEnd) {
    const txt = textarea.value;
    if (selectionEnd >= txt.length || selectionEnd < 0)
      return;
    textarea.scrollTop = 0;
    textarea.value = txt.substring(0, selectionEnd);
    const height = textarea.scrollHeight;
    textarea.value = txt;
    textarea.scrollTop = height;
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
      if (event.target.href && event.target.href.match(/^https?:\/\//)) {
        shell.openExternal(event.target.href);
        event.preventDefault();
        return
      }
    });
  };

  const Update = () => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
    });
  };
  const convertToPDF = () => {
    const path = `${Desktop}/${name}.pdf`;
    pandoc(value, `-f markdown -t pdf -o ${path}`, function (err, result) {
      if (err) console.log(err);
      if (fs.existsSync(path)) {
        open(path);
      }
    });
  };

  const converToDocx = () => {
    const path = `${Desktop}/${name}.docx`;
    pandoc(value, `-f markdown -t docx -o ${path}`, function (err, result) {
      if (err) console.log(err);
      if (fs.existsSync(path)) {
        open(path);
      }
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
      openWindow();
    });
  }, []);

  useEffect(() => {
    ipcRenderer.on("new", function () {
      setFileNameBox(true);
    });
  }, [fileNameBox]);

  const docxToMd = (filePath) => {
    const destination = `${appDir}/${filePath.name.split(".")[0]}.md`;
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

  if (typeof window !== "undefined") {
    dragDrop("body", (files) => {
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
          Update();
        });
      });
    });
  }

  const commentOut = () =>{
    const area = ref.current;
    if (area.selectionEnd === area.selectionStart) {
      return;
    }
    let first = area.selectionStart;
    let second = area.selectionEnd;
    let length = second - first;
    let selectedText = area.value.substr(first, length);
    if (selectedText.startsWith("<!--") && selectedText.endsWith("-->")) {
      area.value = area.value.substr(0, first) + area.value.substr(second);
      ref.current.setSelectionRange(first, first);
      document.execCommand(
        "insertText",
        false,
        `${selectedText.replace(/[<>!-]/g, "")}`
      );
    } else {
      area.value = area.value.substr(0, first) + area.value.substr(second);
      ref.current.setSelectionRange(first, first);
      document.execCommand("insertText", false, `<!-- ${selectedText} -->`);
    }
  }

  const createNewFile = () => {
    fileName != ""
      ? ipcRenderer.invoke("createNewFile", fileName).then(() => {
          setFiles(files);
          Update();
        })
      : null;
  };

  const saveFile = () => {
    try {
      setSaver("SAVING...")
      ipcRenderer.invoke("saveFile", path, value).then(() => {
        Update();
        setSaver("SAVED")
        setTimeout(() => {
          setIsEdited(false);
          setSaver("EDITED")

        }, 3000);
      });
    } catch (e) {
      console.log(e);
    }
  };

  //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_KEYS & EVENTS-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

  useEffect(() => {
    document.onkeydown = function ListenToKeys(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        saveFile();
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
        if(!insert){return}
        toogleFinder(true);
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

      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        setFileNameBox(true);
        e.preventDefault();
        return;
      }

      if (e.keyCode === 187 && (e.ctrlKey || e.metaKey)) {
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
        commentOut()
        e.preventDefault();
        return;
      }

      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        (e.ctrlKey || e.metaKey)
      ) {
        try {
          fs.removeSync(path);
          Update();
          const index = Math.floor(Math.random()*files.length)
          setValue(files[index].body);
          setName(files[index].name);
          setPath(files[index].path);
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
    const pos = ref.current.selectionStart;
    ref.current.setSelectionRange(pos, pos);
    document.execCommand("insertText", false, s);
  };

  const onScroll = () => {
    const Scrolled = document.documentElement.scrollTop;
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const ScrollPercent = (Scrolled / MaxHeight) * 100;
    setScroll(ScrollPercent);
  };
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", onScroll);
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

  const cursorUpdate = (e) => {
    if (e.target.selectionStart !== e.target.selectionEnd) {
      setCursor(`[${e.target.selectionStart}, ${e.target.selectionEnd}]`);

    } else {
      var textLines = e.target.value
        .substr(0, e.target.selectionEnd)
        .split("\n");
      var lineNo = textLines.length - 1;
      setCursor(`${lineNo}L ${e.target.selectionStart}C`);
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
    if (menu.getAttribute("aria-expanded") === "false") {
      menu.setAttribute("aria-expanded", "true");
      setButtomMenuState(true);
    }else{
      menu.setAttribute("aria-expanded", "false");
      setButtomMenuState(false);
    }
  }

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
            style={{ width: "27vw", maxWidth: "30vw", minHeight: "100vh" }}
          >
            <div>
              <div
                style={{
                  height: "100vh",
                  marginTop: "10vh",
                  paddingTop: "2em",
                  paddingLeft: "10px",
                }}
              >
                <div
                  className="fileBody"
                  style={{
                    marginTop: "2vh",
                    marginBottom: "2vh",
                    maxHeight: "40vh",
                    overflow: "scroll",
                  }}
                >
                  <details tabIndex="-1" open>
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
                    {files.map((file, index) => (
                      <>
                        <ol className="files">
                          <button
                            tabIndex="-1"
                            className={
                              path === file.path ? "selected" : "greys"
                            }
                            onContextMenu={(e) => {
                              handleClick(e);
                            }}
                            onClick={(e) => {
                              handleClick(e);
                              saveFile();
                              setValue(file.body);
                              setName(file.name);
                              setPath(file.path);
                            }}
                          >{`${file.name.toString()} `}</button>
                        </ol>
                      </>
                    )).sort()}

                    {fileNameBox ? (
                      <form
                        onSubmit={() => {
                          if (fileName.length < 1) {
                            setFileNameBox(false);
                            return;
                          }
                          createNewFile(fileName);
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
                          placeholder="Enter file name"
                          onChange={(e) => setFileName(e.target.value)}
                        />
                      </form>
                    ) : null}
                  </details>
                </div>

                <div
                className="fixed bottom-10"
                >
                  <h3
                   tabIndex="0"
                   id = "buttomMenu"
                   role="button"  aria-expanded="false"
                   onClick={toggleButtomMenu }
                    style={{cursor: "pointer"}}
                    >
                      <p style={{display:"inline"}} className={buttomMenuState ? "Opened" : "Closed" }></p>
                      <p style={{display:"inline"}}>UTILITIES</p>
                      </h3>
                  <div className={buttomMenuState ? "slideIn" : ""} style={buttomMenuState ? {display: "block", opacity: "0", paddingLeft: "2vw"} : {display: "none"}}>
                  

                  <button
                    tabIndex="-1"
                    onClick={() => {
                      setFileNameBox(true);
                    }}
                  >
                    New File
                  </button>
                  <br />
                  <button tabIndex="-1" onClick={openWindow}>
                    Add File
                  </button>
                  {pandocAvailable ? (
                    <>
                      <br />
                      <button tabIndex="-1" onClick={convertToPDF}>
                        Covert to PDF
                      </button>
                      <br />
                      <button tabIndex="-1" onClick={converToDocx}>
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
            maxWidth: "100vh",
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
                  onScroll={(e) => {
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
                    setDisplayThesaurus(false);
                    setWhichIsActive(0);
                  }}
                  spellcheck="false"
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
            style={{ marginLeft: "27%", maxHeight: "10vh", marginTop: "20px" }}
          >
            {displayThesaurus && insert ? (
              <container
                style={{
                  paddingTop: "5px",
                  paddingRight: "40px",
                  paddingBottom: "5px",
                  float: "center",
                  overflow: "hidden",
                }}
              >
                <li
                  id="thesaurusWords"
                  style={{
                    marginButtom: "5px ",
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
              </container>
            ) : (
              finder ? (
                <>
              

                <container
                  className="Left"
                  style={{
                    float: "left",
                    paddingLeft: "40px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  <span>Find: 
                  <form
                  style={{display: "inline"}}
                        onSubmit={() => {
                          if (wordToFind.length < 1) {
                            toogleFinder(false);
                            return;
                          
                          }
                          find(wordToFind);
                        }}
                      >
                        <input
                          autoFocus
                          className="createFile"
                          type="text"
                          placeholder="Search a word"
                          onChange={(e) => setWordToFind((e.target.value).toLowerCase())}
                        />
                      </form>
                  </span>
                </container>
            
              </>

              ) : (
                <>
              

                <container
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
                    <div style={{ display: "inline", marginRight: "30px" }}></div>
                    <button
                    style={{
                      display: "inline",
                      color: "grey",
                      overflow: "hidden",
                    }}
                      id="save"
                      tabIndex="-1"
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
                </container>
                <container
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
                </container>
              </>

              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
