import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export const BOLD = (view : EditorView ) => {
  if(!view) return;
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: '**' },
        { from: range.to, insert: '**' },
      ],
      range: EditorSelection.range(range.from + 2, range.to + 2),
    })),
  );
}


export const ADDYAML = (view : EditorView) => {
  if(!view) return;
  const yaml = `---
title: Your Title
author: 
 - John Doe
 - Jane Doe
date: ${new Date().toLocaleDateString()}
tags:
 - programming
 - computers
 - conversations
material:
 - {github: 'https://github.com/'} 
 - {mala: 'https://github.com/'}
 - {xala: 'https://github.com/'}   
---

`

  view.dispatch({
      changes: { from: 0, to: 0, insert: yaml },
      selection: { anchor: 0, head: 0 },
       scrollIntoView: true
      });

}

export const GETDATE = () => {
  const date = new Date();
  const strArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const s =
    "" +
    (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()) +
    "-" +
    strArray[date.getMonth()] +
    "-" +
    date.getFullYear() +
    " ";
  return s;
};


export const LINK = (view : EditorView) => {
  if(!view) return;
  const main = view.state.selection.main;
  const txt = view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to);
  if (txt.match("[(.*?)]((.*?))")) return;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: `[${txt}](url)`,
    },
    selection: EditorSelection.range(main.from + 3 + txt.length, main.to + 3),
  });
}


export const QUICKINSERT = (view : EditorView, txt : string) => {
  if (!view) return;
  const main = view.state.selection.main;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: txt,
    },
    selection: EditorSelection.range(main.from + txt.length, main.to + txt.length)
  });
}


