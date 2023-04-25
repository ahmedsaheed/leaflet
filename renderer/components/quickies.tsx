import { EditorView } from "@codemirror/view";
import { ReactNode } from "react";
export const QUICKBUTTONS = (
  view: EditorView,
  title: string,
  icon: string | ReactNode,
  onclick: () => void,
  border?: boolean
) => {
  var button = (
    <button
      disabled={!view}
      className="quickAction cursor-pointer"
      aria-label={title}
      title={title}
      onClick={onclick}
      style={{
        padding: "1px",
        marginRight: "1em",
        fontSize: "large",
      }}
    >
      {icon}
    </button>
  );
  const res = border ? 
    <span style={{ display: "inline !important"}}>{button}</span>
   :button
  ;
  return res;
};
