import {
  BOLD,
  ITALIC,
  LINK,
  ADDCODE,
  TABLE,
  STRIKETHROUGH,
  ADDYAML,
} from "../lib/util";
import { QUICKBUTTONS } from "./quickies";
import { EditorView } from "@codemirror/view";
export const EditorUtils = (view: EditorView) => {
  return <HandleUtils view={view} />;
};

const HandleUtils = ({ view }) => {
  return (
    <div
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        display: "inline",
      }}
    >
      <div
        style={{
          display: "inline",
          borderRight: "1px solid grey",
          marginRight: "15px",
        }}
      ></div>
      {QUICKBUTTONS(view, "Add Bold", <strong>Bold</strong>, () => BOLD(view))}
      {QUICKBUTTONS(view, "Add Italic", <em>Italic</em>, () => ITALIC(view))}
      {QUICKBUTTONS(view, "Strike Through", <s>Strike</s>, () =>
        STRIKETHROUGH(view)
      )}

      <div
        style={{
          display: "inline",
          borderRight: "1px solid grey",
          marginRight: "15px",
        }}
      ></div>

      {QUICKBUTTONS(view, "Add Link", "Link", () => LINK(view))}
      {QUICKBUTTONS(view, "Add Code", "Code", () => ADDCODE(view))}
      {QUICKBUTTONS(view, "Add Table", "Table", () => TABLE(view))}

      {QUICKBUTTONS(view, "Add Footnote", "Footnote", () => ADDCODE(view))}
      {QUICKBUTTONS(view, "Add Add Metadata", "Metadata", () => ADDYAML(view))}
    </div>
  );
};
