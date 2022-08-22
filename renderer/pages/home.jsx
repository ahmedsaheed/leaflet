import React from 'react';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import katex from 'remarkable-katex';
import {useEffect} from "react";

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
    <div className="MarkdownEditor">
      {isVisble ? (
              <div>
        <h3>Output</h3>
        <div
            style={{marginTop: "2em"}}
          className="content list-decimal"
          dangerouslySetInnerHTML={ getRawMarkup()}
        />
        </div>


      ) : (
             <div> 
        <textarea autoFocus id="markdown-content" defaultValue={value} onChange={handleChange} 
          className=" h-full w-full"
          style={{ marginTop: "2em", minHeight: "60vh", backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px'}} 
        />
        </div>
      )}
   

          </div>

  );
}

