import { COMMANDPALLETEOPENIcon, COMMANDPALLETESELECTIcon } from "./icons";

export const Cmdkfooter = () => {
  return (
    <div
      style={{
        fontSize: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        userSelect: "none",
      }}
    >
      <div
        style={{
          marginLeft: "2em",
          display: "flex",
          alignItems: "center",
          paddingTop: "5px",
          paddingBottom: "5px",
        }}
      >
        <span style={{ marginRight: "2em", color: "#888888" }}>
          <COMMANDPALLETESELECTIcon />
          &nbsp;Select
        </span>

        <span style={{ marginRight: "2em", color: "#888888" }}>
          <COMMANDPALLETEOPENIcon />
          &nbsp;Open
        </span>

        <span style={{ marginRight: "2em", color: "#888888" }}>
          <b
            style={{
              color: "#888888",
            }}
          >
            esc
          </b>
          &nbsp;Close
        </span>
      </div>
    </div>
  );
};
