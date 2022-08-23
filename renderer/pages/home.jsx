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

    const markdown = `
## Left

<img src="https://raw.githubusercontent.com/hundredrabbits/100r.co/master/media/content/characters/left.hello.png" width="300"/>

<a href="http://wiki.xxiivv.com/Left" target="_blank"></a>Left is <b>distractionless plaintext editor</b> designed to quickly navigate between segments of an essay, or multiple documents. It features an auto-complete, synonyms suggestions, writing statistics, markup-based navigation and a speed-reader.
 
The <a href="http://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">application</a> was initially created to help Rek with the writing of the upcoming novel Wiktopher, and later made available as a free and <a href="https://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">open source</a> software.

Learn more by reading the <a href="https://100r.co/site/left.html" target="_blank" rel="noreferrer" class="external ">manual</a>, or have a look at a <a href="https://www.youtube.com/watch?v=QloUoqqhXGE" target="_blank" rel="noreferrer" class="external ">tutorial video</a>. If you need <b>help</b>, visit the <a href="https://hundredrabbits.itch.io/left/community" target="_blank" rel="noreferrer" class="external ">Community</a>.

## Install & Run

You can download [builds](https://hundredrabbits.itch.io/left) for **OSX, Windows and Linux**, or if you wish to build it yourself, follow these steps:

`;
  const [value, setValue] = React.useState(markdown);
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

