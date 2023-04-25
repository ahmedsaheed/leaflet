import {
  BOLD,
  ITALIC,
  LINK,
  ADDCODE,
  TABLE,
  STRIKETHROUGH,
  ADDYAML,
  getIncomingImages,
} from "../lib/util";
import { QUICKBUTTONS } from "./quickies";
import { EditorView } from "@codemirror/view";
import {
  BiBold,
  BiItalic,
  BiStrikethrough,
  BiCode,
  BiTable,
  BiListUl,
  BiListOl,
  BiCodeAlt,
  BiImageAdd
} from "react-icons/bi";
import { AiOutlineLink } from "react-icons/ai";
export const EditorUtils = (view: EditorView) => {
  return <HandleUtils view={view} />;
};

const HandleUtils = ({ view }) => {
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: "medium",
        display: "inline",
        paddingLeft: "1em",
      }}
    >
        {QUICKBUTTONS(view, "Bold", <BiBold />, () => BOLD(view))}
        {QUICKBUTTONS(view, "Italic", <BiItalic />, () => ITALIC({ view }))}
        {QUICKBUTTONS(view, "Strikethrough", <BiStrikethrough />, () =>
          STRIKETHROUGH(view), true
        )}
        {QUICKBUTTONS(view, "Link", <AiOutlineLink />, () => LINK(view), true)}

        {QUICKBUTTONS(view, "Bullet List", <BiListUl />, () => ADDCODE(view))}
        {QUICKBUTTONS(view, "Ordered List", <BiListOl />, () => ADDCODE(view), true)}
        {QUICKBUTTONS(view, "Code", <BiCodeAlt />, () => ADDCODE(view))}
        {QUICKBUTTONS(view, "Table", <BiTable />, () => TABLE(view))}
        {QUICKBUTTONS(view, "image", <BiImageAdd />, () => getIncomingImages(view))}
        {/*
        {QUICKBUTTONS(view, "Table", <BiTable />, () => TABLE(view))}
   */}
    </div>
  );
};
