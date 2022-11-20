import { EditorView } from "@codemirror/view"
import { EditorUtils } from "./editorutils"
import { progress } from "./progress"

export const ButtomBar = (insert: boolean,
    vimToggler: () => void,
    isVim: boolean,
    value: string,
    cursor : string,
    scroll: number,
    editorview: EditorView,
    ) => {

    return (

        <div
        className="fixed inset-x-0 bottom-0 ButtomBar"
        style={{
          display: "inline",
          userSelect: "none",
          marginLeft: "17.55em",
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
                paddingBottom: "5px",
              }}
            >
              <span>
                {insert ? (
                  <>
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
                  </>
                ) : (
                  "PREVIEW"
                )}
              </span>
              {!insert ? (
                <>
                  <div
                    style={{ display: "inline", marginRight: "30px" }}
                  ></div>
                  <span>{`${value.toString().split(" ").length}W ${
                    value.toString().length
                  }C `}</span>
                  <div
                    style={{ display: "inline", marginRight: "30px" }}
                  ></div>
                </>
              ) : null}
              <div
                style={{
                  display: insert ? "none" : "inline",
                  color: "grey",
                  overflow: "hidden",
                }}
                dangerouslySetInnerHTML={{
                  __html: insert ? cursor : progress(scroll),
                }}
              />
            </div>
            {insert ? (
              <div
                className="Right"
                style={{
                  paddingRight: "30px",
                  paddingBottom: "2px",
                  paddingTop: "5px",
                }}
              >
                <div style={{ display: "inline" }}>
                  <div>
                    <select
                      style={{
                        float: "right",
                        backgroundColor: "transparent",
                        paddingBottom: "2px",
                        paddingTop: "3px",
                        border: "none",
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                        fontSize: "12px",
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
                  {EditorUtils(editorview)}
                </div>
              </div>
            ) : null}
          </>
      </div>
    )
}