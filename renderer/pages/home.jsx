import React, { useEffect } from "react";
import { ipcRenderer } from "electron";
import {progress} from "../components/progress.ts";
import {getMarkdown} from "../lib/mdParser";
import ButtomBar from "../components/buttomBar";
import Fs from "../components/fs";
import fs from "fs";


export default function Next() {
  const [value, setValue] = React.useState("");
  const [isVisble, setIsVisble] = React.useState(false);
  const [scroll, setScroll] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [save, setSave] = React.useState(false);

  //TODO: IMPLEMENT SAVE FUNCTION
  // useEffect(() => {
  //   document.addEventListener(
  //     "keydown",
  //     (e) => {
  //       if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
  //         saver();
  //         setSave(true);
  //       }
  //     },
  //     false
  //   );
  // }, [value, files]);

  // const saver = () => {
  //     //write a function to update the file
  //     fs.writeFile(files[0].path, value, (err) => {
  //       if (err) throw err;
  //       console.log("The file has been saved!");
  //     }
  //     );
  // };

  useEffect(() => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
    });
  }, []);

  //SCROLL
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
  useEffect(() => {
    document.addEventListener("keydown", detectKeydown, true);
  }, []);
  //get the index and set the value

  const onFileClick = (index) => {
    //TODO remember that index starts from one, so when called always -1
    console.log(files)
    setValue(files[2].body);
  }

  const detectKeydown = (e) => {
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      setIsVisble(!isVisble);
    } else if (e.key === "Escape") {
      setIsVisble(false);
    }
  };

  function handleChange(e) {
    setValue(e.target.value);
  }
  const openWindow = () => {
    ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
      ipcRenderer.invoke("getTheFile").then((files = []) => {
        setFiles(files);
      });
    });
  };


  return (
    <>
      <div className="mainer" style={{ minHeight: "100vh" }}>
        <div>
          {/* <Fs notes={files} /> */}
          <div className="fs fixed" style={{ minWidth: "50vh", minHeight: "100vh" }}>
      <div style={{ marginTop: "10vh", paddingTop: "2em", paddingLeft: "1em" }}>
        <h1>Welcome</h1>
        {/* Iterate and map contents in file */}

        <div style={{ marginTop: "2vh", marginBottom: "2vh" }}>
          {files.map((file, index) => (
            <>
            <button onClick={() => onFileClick(file.index)}><ol className="files">{`${file.name.toString().toUpperCase()}`}</ol></button>
             
              <ol className="files">{`${file.index}`}</ol>
            </>
          ))}
        </div>
        <button style={{ float: "bottom" }} onClick={openWindow}>
          Click to Add File
        </button>
      </div>
    </div>
        </div>
        <div
          style={{
            paddingRight: "20px",
            minWidth: "100vh",
            paddingTop: "10vh",
          }}
        >
          {isVisble ? (
            <>
              <div
                style={{ marginTop: "2em", marginBottom: "5em" }}
                className="third"
                dangerouslySetInnerHTML={getMarkdown(value)}
              />
            </>
          ) : (
            <div>
              <textarea
                id="markdown-content"
                defaultValue={value}
                onChange={handleChange}
                className=" h-full w-full"
                style={{
                  marginTop: "2em",
                  minHeight: "100vh",
                  backgroundColor: "transparent",
                  marginBottom: "2em",
                }}
              />
            </div>
          )}

          <ButtomBar
            word={value.toString()}
            mode={isVisble ? "Preview" : "Insert"}
            loader={progress(scroll)}
          />
        </div>
      </div>
    </>
  );
}
