import React, { useEffect } from "react";
import { ipcRenderer } from "electron";
import { progress } from "../components/progress.ts";
import { getMarkdown } from "../lib/mdParser.ts";
import ButtomBar from "../components/buttomBar";
const fs = require( 'fs-extra' );
import dragDrop from "drag-drop";


export default function Next() {
  const [value, setValue] = React.useState("");
  const [insert, setInsert] = React.useState(false);
  const [scroll, setScroll] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [name, setName] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [path, setPath] = React.useState("");
  const [isEdited, setIsEdited] = React.useState(false);
  const [marker, setMarker] = React.useState(false);

  useEffect(() => {
    ipcRenderer.invoke("getTheFile").then((files = []) => {
      setFiles(files);
      setValue(files[0] ? `${files[0].body}` : "");
      setName(files[0] ? `${files[0].name}` : "");
      setPath(files[0] ? `${files[0].path}` : "");
    });
  }, []);

  if (typeof window !== "undefined") {
  dragDrop( '.fs', ( files ) => {
    const _files = files.map( file => {
        return {
            name: file.name,
            path: file.path,

        };
    } );

    // send file(s) add event to the `main` process
    ipcRenderer.invoke( 'app:on-file-add', _files ).then( () => {
        ipcRenderer.invoke( 'getTheFile' ).then( ( files = [] ) => {
           setFiles( files );
        } );
    } );
} );
  }


  const saveFile = () => {
    fs.writeFile(path, value, (err) => {
      console.log("The file has been saved!");
      // setFiles(files);
    })
  }

  //function to save the file when cms + s is pressed 
  // const saveFileOnKeyPress = (e) => {
  //   if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
  //     saveFile();
  //   }
  // }
  // useEffect(() => {
  //   document.addEventListener("keydown", saveFileOnKeyPress);
  //   return () => {
  //     document.removeEventListener("keydown", saveFileOnKeyPress);
  //   }
  // } , [])



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
    if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
      setInsert(true);
    } else if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
      setInsert(false);
    }
  };

  function handleChange(e) {
    setValue(e.target.value);
    setIsEdited(true);
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
          <div
            className="fs fixed"
            style={{ width: "30vw", maxWidth: "30vw", minHeight: "100vh"}}
          >
            <div style={{overflow: "hidden"}}>
            <div
              style={{
                height: "100vh",
                marginTop: "10vh",
                paddingTop: "2em",
                paddingLeft: "1em",
                overflow: "scroll",
                whiteSpace: "pre-wrap",
              }}
            >
              <h1>EXPLORER</h1>
              <div style={{ marginTop: "2vh", marginBottom: "2vh" }}>
                {files.map((file, index) => (
                  <>
                    <ol className="files">
                      <button
                        className={name === file.name ? "selected" : "greys"}
                        onClick={() => {
                          setValue(file.body);
                          setName(file.name);
                          setIndex(file.index - 1);
                          setPath(file.path);
                        }}
                      >{`${file.name.toString()}`}</button>
                    </ol>

                  </>
                ))}
              </div>
          
          <div className = "fixed bottom-20">
               <button className={`${marker ? "tick " : ""}`}
                onClick={() =>{
                try{
                  saveFile();
                  setMarker(true);
                  setTimeout(() => {
                    setMarker(false);
                    setIsEdited(false);
                  }
                  , 3000);
                  
                }catch{
                  console.log("error");
                }
              }}
               >
               Save File
             </button><br/>
             
             
              <button onClick={openWindow}>
                Click to Add File
              </button>
              </div>
            </div>
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
          {insert ? (
            <div>
            <div >
            <textarea
              autoFocus={value === "" ? "true" : "false" }
              id="markdown-content"
              value={value}
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
          </div>
           
          ) : (
            <>
            <div style={{overflow: "hidden"}}>
              <div
                style={{ marginTop: "2em", marginBottom: "5em", overflow: "scroll" }}
                className="third"
                dangerouslySetInnerHTML={ getMarkdown(value)}
              />
              </div>
            </>
          )}

          <ButtomBar
            word={value.toString()}
            mode={insert ? "Insert" : "Preview"}
            loader={insert ? "" : progress(scroll)}
          />
        </div>
      </div>
    </>
  );
}
