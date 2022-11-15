import {
  NEWNOTEIcon,
  CALENDARIcon,
  NEWFOLDERIcon,
  COLLAPSEIcon,
  EXPANDIcon,
} from "./icons";

export const QuickActions = ({
  createNewFile,
  viewingTodo,
  createNewFolder,
  addOpenToAllDetailTags,
  detailIsOpen,
}) => {
  return (
    <div
      className="flex"
      style={{
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
        <div>
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
        <div>
          <NEWFOLDERIcon />
        </div>
      </button>

      <button
        className="quickAction"
        onClick={viewingTodo}
        style={{
          border: "1px solid transparent",
          padding: "1px",
          outline: "none",
          borderRadius: "4px",
          marginRight: "1em",
          cursor: "default",
        }}
      >
        <div>
          <CALENDARIcon />
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
        <div>{detailIsOpen ? <COLLAPSEIcon /> : <EXPANDIcon />}</div>
      </button>
    </div>
  );
};
