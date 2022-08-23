import React from 'react';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import katex from 'remarkable-katex';
import {useEffect} from "react";
import "@fontsource/ia-writer-duospace"
import ButtomBar from "../components/buttomBar";

export default function  Next(){
  const md = new Remarkable('full',{
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

  }
});
    md.use(katex);

  const [value, setValue] = React.useState('Hello, **world**!');
  const [isVisble, setIsVisble] = React.useState(false);
  useEffect(() => {
        document.addEventListener("keydown", detectKeydown, true)
    }, [])

 const detectKeydown = (e) => {
        if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
            setIsVisble(!isVisble)
        }else if(e.key === "Escape"){
            setIsVisble(false)
            }
                }


  function handleChange(e) {
    setValue(e.target.value);
  }

  function getRawMarkup() {
    return { __html: md.render(value) };
  }

  return (
    <div className="MarkdownEditor" style={{marginLeft: "30%", paddingTop: "10vh", paddingRight: "20px"}}>
      {isVisble ? (
              <div>
        <div
            style={{marginTop: "2em", marginBottom: "5em"}}
          className="content list-decimal"
          dangerouslySetInnerHTML={ getRawMarkup()}
        />
        </div>


      ) : (
             <div> 
        <textarea   id="markdown-content" defaultValue={value} onChange={handleChange} 
          className=" h-full w-full"
          style={{ marginTop: "2em", minHeight: "100vh", backgroundColor: 'transparent', marginBottom: "2em"}} 
        />
        </div>
      )}
   
        <ButtomBar word={value.toString()} mode={isVisble ? "Preview" : "Insert"} />
          </div>

  );
}

