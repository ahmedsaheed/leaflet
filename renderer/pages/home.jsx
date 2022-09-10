import React, { useEffect, useRef } from "react";
import { ipcRenderer } from "electron";
import { progress } from "../components/progress.ts";
import { getMarkdown } from "../lib/mdParser.ts";
import ButtomBar from "../components/buttomBar";
import commandExists from "command-exists-promise";
import {SYNONYMS} from "../lib/synonyms.js";
import fs from "fs-extra";
import dragDrop from "drag-drop";
import Head from "next/head";
import Script from "next/Script";
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
  const [marker, setMarker] = React.useState(false);
  const [fileNameBox, setFileNameBox] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [pandocAvailable, setPandocAvailable] = React.useState(false);
  const appDir = mainPath.resolve(os.homedir(), "leaflet");
  const Desktop = require("os").homedir() + "/Desktop";
  const [cursor, setCursor] = React.useState("1L:1C");
  const [thesaurus, setThesaurus] = React.useState([]);
  const [displayThesaurus, setDisplayThesaurus] = React.useState(false);
  const today = new Date();
  const ref = useRef(null);
  let synonyms = {};

  useEffect(() => {
    commandExists("pandoc")
      .then((exists) => {
        if (exists) {
          setPandocAvailable(true);
        } else {
          setPandocAvailable(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
      setName(files[0] ? `${files[0].name}` : "");
      setPath(files[0] ? `${files[0].path}` : "");
    });
  }, []);



//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_SYNONYMS-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

const getSynonyms = () => {
  const l = activeWordLocation()
    let response = find_synonym(l.word);
    // DO SOMETHING WITH THE RESPONSE
    if (!response) {
      setDisplayThesaurus(false);
      setThesaurus([]);
      return;
    }
    for (let i = 0; i < response.length; i++) {
      thesaurus.push(response[i]);
    }
    setThesaurus(thesaurus);
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

  // const replaceActiveWord = (word) => {
  //    const area = ref.current;

  //   const l = activeWordLocation();
  //   const w = area.value.substr(l.from, l.to - l.from);

  //   if (w.substr(0, 1) === w.substr(0, 1).toUpperCase()) {
  //     word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length);
  //   }

  //   //area.value = area.value.substr(0, l.from) + word + area.value.substr(l.to)
  //   area.setSelectionRange(l.from, l.to);
  //   document.execCommand("insertText", false, characters);
  //   area.focus();
  // };



  
  //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

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
      ipcRenderer.invoke("saveFile", path, value).then(() => {
        Update();
        setMarker(true);
        setTimeout(() => {
          setMarker(false);
          setIsEdited(false);
        }, 3000);
      });
    } catch (e) {
      console.log(e);
    }
  };

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_KEYS-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

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
    };
  });
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

  const FullDate = (whatValue) => {
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();

    const resultingValue = whatValue.replace("DATE.TODAY", `${date}`);
    return resultingValue;
  };

  const Month = (whatValue) => {
    var month =
      today.toLocaleString("default", { month: "long" }) +
      " " +
      today.getFullYear();
    const resultingValue = whatValue.replace("DATE.MONTH", `${month}`);
    return resultingValue;
  };

  const Now = (whatValue) => {
    var currTime =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const resultingValue = whatValue.replace("CURRENT.TIME", `${currTime}`);
    return resultingValue;
  };

  function handleChange(e) {
    setValue(FullDate(Month(Now(e.target.value))));
    setIsEdited(true);
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
      setCursor(`${lineNo}L ${e.target.selectionStart}P`);
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

        <Script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"
          integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4"
          crossOrigin="anonymous"
        ></Script>
        <Script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js"
          integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa"
          crossOrigin="anonymous"
        ></Script>
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
                  paddingLeft: "1em",
                }}
              >
                <p>EXPLORER</p>
                <div
                  className="fileBody"
                  style={{
                    marginTop: "2vh",
                    marginBottom: "2vh",
                    maxHeight: "40vh",
                    overflow: "scroll",
                  }}
                >
                  {files.map((file, index) => (
                    <>
                      <ol className="files">
                        <button
                          className={name === file.name ? "selected" : "greys"}
                          onClick={() => {
                            saveFile();
                            setValue(file.body);
                            setName(file.name);
                            setPath(file.path);
                          }}
                        >{`${file.name.toString()}`}</button>
                      </ol>
                    </>
                  ))}
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
                </div>

                <div className="fixed bottom-28">
                  {isEdited ? (
                    <button
                      className={`${marker ? "tick " : ""}`}
                      onClick={() => {
                        try {
                          saveFile();
                          setMarker(true);
                          setTimeout(() => {
                            setMarker(false);
                            setIsEdited(false);
                          }, 3000);
                        } catch {
                          console.log("error");
                        }
                      }}
                    >
                      Save File
                    </button>
                  ) : null}
                  <br />
                  <button
                    onClick={() => {
                      setFileNameBox(true);
                    }}
                  >
                    Create New File
                  </button>
                  <br />
                  <button onClick={openWindow}>Click to Add File</button>
                  {pandocAvailable ? (
                    <>
                      <br />
                      <button onClick={convertToPDF}>Covert to PDF</button>
                      <br />
                      <button onClick={converToDocx}>Covert to Docx</button>
                    </>
                  ) : null}
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
                  id="markdown-content"
                  value={value}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    cursorUpdate(e);
                    // getSynonyms()
                  }}
                  onMouseDown={(e) => {
                    cursorUpdate(e);
                    getSynonyms();
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

          <ButtomBar
            word={value.toString()}
            mode={insert ? "Insert" : "Preview"}
            loader={insert ? cursor : progress(scroll)}
            thesaurus = {thesaurus}
            displayThesaurus = {displayThesaurus}
          />
        </div>
      </div>
    </>
  );
}
