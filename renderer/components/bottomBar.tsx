import { EditorView } from "@codemirror/view";
import { EditorUtils } from "./editorutils";
import readingTime from "reading-time";
export const ButtomBar = (
  insert: boolean,
  vimToggler: () => void,
  isVim: boolean,
  value: string,
  cursor: string,
  scroll: number,
  editorview: EditorView,
  fileTreeIsOpen: boolean
) => {
  return (
    <div
      className="fixed inset-x-0 bottom-0 ButtomBar"
      style={{
        display: "inline",
        userSelect: "none",
        maxHeight: "10vh",
        marginTop: "20px",
      }}
    >
      <>
        <div
          className="Left"
          style={{
            float: "left",
            paddingLeft: "10px",
            paddingTop: "5px",
            fontSize: "12px !important",
          }}
        >
          <div
          >
            {insert ? (
              <div style={{ display: "inline" }}>
                <button
                  className="quickAction"
                  onClick={vimToggler}
                  style={{
                    border: "1px solid transparent",
                    padding: "1px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    marginRight: "1em",
                    cursor: "default",
                    outline: "none",
                  }}
                >
                  <div>{isVim ? "Vim Mode" : "Normal"}</div>
                </button>
                <select
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    marginRight: "0.5em",
                    fontSize: "12px",
                    appearance: "none",
                  }}
                  onChange={(e) => {}}
                >
                  <option className="bgbgb" value="1">
                    Heading 1{" "}
                  </option>
                  <option className="bgbgb" value="2">
                    Heading 2
                  </option>
                  <option className="bgbgb" value="3">
                    Heading 3
                  </option>
                </select>

                {EditorUtils(editorview)}

                <div
                  style={{
                    float: "right",
                    display: "inline",
                  }}
                >
                  <select
                    style={{
                      float: "right",
                      backgroundColor: "transparent",
                      border: "none",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: "12px !important",
                    }}
                  >
                    <option value="black">{cursor}</option>
                    <option value="">
                      {value.toString().split(" ").length} Words
                    </option>
                    <option value="dark">
                      {value.toString().length} Character
                    </option>
                  </select>
                </div>
              </div>
            ) : (
              <span style={{ display: "inline" }}>
                <div>
                  <div style={{ display: "inline", marginRight: "20px" }}></div>
                  <span>{`${value.toString().split(" ").length} words  ${
                    value.toString().length
                  } characters `}</span>
                  <div style={{ display: "inline", marginRight: "30px" }}></div>
                  <span>{`${readingTime(value).text}`}</span>
                </div>
              </span>
            )}
          </div>
        </div>
      </>
    </div>
  );
};
