import React from 'react';
import {ipcRenderer} from 'electron';
import dragDrop from 'drag-drop';
import {useEffect} from 'react';
import {useState} from 'react';

export default function Fs() {
    const [ files, setFiles ] = useState([]);
    const [addFile, setAddFile] = useState(false)
    const [ isDropzoneActive, setIsDropzoneActive ] = useState(false);
    
    useEffect(() => {
      ipcRenderer.invoke('getTheFile').then((files = []) => {
        setFiles(files);
      });
    }, []);
    
    useEffect(() => {
    ipcRenderer.on('app:delete-file', (event, filename) => {
      const _files = files.filter((file) => file !== filename);
      setFiles(_files);
    });
    }, [files]);
  
    const onFilesAdded = (acceptedFiles) => {
      acceptedFiles.map(file => (
        {
          name: file.name,
          path: file.path,
        }
      ));
  
      ipcRenderer.invoke('app:on-file-add', acceptedFiles).then(() => {
        ipcRenderer.invoke('getTheFile').then((files = []) => {
          setFiles(files);
        });
      });
  
       setIsDropzoneActive(false);
    };

        const onDragEnter = () => {  setIsDropzoneActive(true); };
        const onDragLeave = () => {  setIsDropzoneActive(false); };
    
        return(
            <div className="fs fixed" style={{minWidth: "50vh", minHeight: "100vh",}}>
            <div style={{marginTop: "10vh", paddingTop: "2em", paddingLeft: "1em"}}>
            <h1>Welcome</h1>
                {/* Iterate and map contents in file */}

                {files.map((file, index) => (
                    <div key={index}>
                        <ol>{`${file.name} ${file.size}`}</ol>
                      
                    </div>
                ))}
                {/* <button style={{float: "bottom"}} onClick={setAddFile(true)}>Click to Add File</button> */}
            </div>    
        </div>
        )
}
