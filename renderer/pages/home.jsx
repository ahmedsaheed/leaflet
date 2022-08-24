import React from "react";
import { Remarkable } from "remarkable";
import hljs from "highlight.js";
import katex from "remarkable-katex";
import { useEffect } from "react";
import "@fontsource/ia-writer-duospace";
import ButtomBar from "../components/buttomBar";
import Fs from "../components/fs";
import {ipcRenderer} from 'electron';

export default function Next() {
  const md = new Remarkable("full", {
    html: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (err) {}
      }

      try {
        return hljs.highlightAuto(str).value;
      } catch (err) {}
    },
  });
  md.use(katex);
  const [value, setValue] = React.useState("");
  const [isVisble, setIsVisble] = React.useState(false);
  const [scroll, setScroll] = React.useState(0);
  const [files, setFiles] = React.useState([]);

  useEffect(() => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
    });
  }, []);
  //assign the file body at index 0 to markdown
  const markdown = files[0] ? `${files[0].body}` : "";



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
  const progress = ["|", "|", "|", "|", "|", "|", "|", "|", "|", "|"]
    .map((v, i) => {
      return i < (scroll / 100) * 10 ? "<b>|</b>" : v;
    })
    .join("");
  const scroller = `${progress} ${scroll.toFixed(1)}%`;
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
  function getRawMarkup() {
    return { __html: md.render(value) };
  }

  return (
    <>
      <div className="mainer" style={{ minHeight: "100vh" }}>
        <div>
          <Fs />
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
                dangerouslySetInnerHTML={getRawMarkup()}
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
            loader={scroller}
          />
        </div>
      </div>
    </>
  );
}
