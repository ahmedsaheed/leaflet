import {
  NEWNOTEIcon,
  NEWFOLDERIcon,
  COLLAPSEIcon,
  EXPANDIcon,
  EDITINGIcon,
  PREVIEWIcon,OPTIONSIcon
} from "./icons";
import {ipcRenderer} from "electron";
export const QuickAction = ({
 modeSwitch,
  createNewFolder,
  addOpenToAllDetailTags,
  detailIsOpen,
  insert
}) => {
  return (
    <div
      className="flex"
      style={{
        width: "100%",
        maxWidth: "17.5em",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        className="quickAction"
        onClick={modeSwitch}
        style={{
          border: "1px solid transparent",
          marginRight: "0.5em",
          cursor: "default",
          borderRadius: "4px",
        }}
      >
        <div title="Current Mode" style={{padding: "0 5px"}}>
         {insert ? (<EDITINGIcon />) : (<PREVIEWIcon/>)} 
        </div>
      </button>

      <button
        className="quickAction"
        onClick={
            (e) => {
              e.preventDefault();
              ipcRenderer.send('show-context-menu');
            }
        }
        style={{
          border: "1px solid transparent",
          borderRadius: "4px",
          marginRight: "0.5em",
          outline: "none",
          cursor: "default",
        }}
      >
        <div style={{padding: "0 5px"}}  title={detailIsOpen ? "Collapse Files" : "Expand Files"}>
           <OPTIONSIcon/> 
        </div>
      </button>
    </div>
  );
};
export const QuickActions = ({
  createNewFile,
  createNewFolder,
  addOpenToAllDetailTags,
  detailIsOpen,
}) => {
  return (
    <div
      className="flex"
      style={{
        paddingTop: "2.6rem",
        marginBottom: "5vh",
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        maxWidth: "17.5em",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        className="quickAction"
        onClick={createNewFile}
        style={{
          border: "1px solid transparent",
          padding: "1px",
          marginRight: "1em",
          cursor: "default",
          borderRadius: "4px",
        }}
      >
        <div title="New Note">
          <NEWNOTEIcon />
        </div>
      </button>

      <button
        className="quickAction"
        onClick={createNewFolder}
        style={{
          border: "1px solid transparent",
          padding: "1px",

          borderRadius: "4px",
          marginRight: "1em",
          cursor: "default",
          outline: "none",
        }}
      >
        <div title="New Folder">
          <NEWFOLDERIcon />
        </div>
      </button>
      <button
        className="quickAction"
        onClick={addOpenToAllDetailTags}
        style={{
          border: "1px solid transparent",
          padding: "1px",
          borderRadius: "4px",
          marginRight: "1em",
          outline: "none",
          cursor: "default",
        }}
      >
        <div title={detailIsOpen ? "Collapse Files" : "Expand Files"}>
          {detailIsOpen ? <COLLAPSEIcon /> : <EXPANDIcon />}
        </div>
      </button>
    </div>
  );
};
