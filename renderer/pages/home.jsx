import React from "react";
import { useEffect } from "react";
import "@fontsource/ia-writer-duospace";
import ButtomBar from "../components/buttomBar";
import Fs from "../components/fs";
import { ipcRenderer } from "electron";
import fs from "fs";
import {progress} from "../components/progress.ts";
import {getMarkdown} from "../lib/mdParser";

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


  return (
    <>
      <div className="mainer" style={{ minHeight: "100vh" }}>
        <div>
          <Fs notes={files} />
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
