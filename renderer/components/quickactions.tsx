import {
  NEWNOTEIcon,
  NEWFOLDERIcon,
  COLLAPSEIcon,
  EXPANDIcon,
} from "./icons";

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
        <div
            title="New Note"
        >
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
        <div

            title="New Folder"
        >
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
        <div
            title={detailIsOpen ? "Collapse Files" : "Expand Files"}
        >{detailIsOpen ? <COLLAPSEIcon /> : <EXPANDIcon />}</div>
      </button>

    </div>
  );
};
