import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { format } from "date-fns";
export const BOLD = (view: EditorView) => {
  if (!view) return;
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: "**" },
        { from: range.to, insert: "**" },
      ],
      range: EditorSelection.range(range.from + 2, range.to + 2),
    }))
  );
};

export const ITALIC = (view: EditorView) => {
  if (!view) return;
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: "*" },
        { from: range.to, insert: "*" },
      ],
      range: EditorSelection.range(range.from + 1, range.to + 1),
    }))
  );
};

export const ADDYAML = (view: EditorView) => {
  if (!view) return;
  const yaml = `---
title: Your Title
author: 
 - John Doe
 - Jane Doe
date: ${format(new Date(), "EEE d MMM")}
tags:
 - programming
 - computers
 - conversations
material:
 - {github: 'https://github.com/ahmedsaheed/leaflet'} 
 - {leaflet: 'https://leaflet.saheed.codes/'}
 - {curius: 'https://curius.app/'}   
---


---

`;

  view.dispatch({
    changes: { from: 0, to: 0, insert: yaml },
    selection: { anchor: 0, head: 0 },
    scrollIntoView: true,
  });
};

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

export const LINK = (view: EditorView) => {
  if (!view) return;
  const main = view.state.selection.main;
  const txt = view.state.sliceDoc(
    view.state.selection.main.from,
    view.state.selection.main.to
  );
  if (txt.match("[(.*?)]((.*?))")) return;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: `[${txt}](url)`,
    },
    selection: EditorSelection.range(main.from + 3 + txt.length, main.to + 6),
  });
};

export const QUICKINSERT = (view: EditorView, txt: string) => {
  if (!view) return;
  const main = view.state.selection.main;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: txt,
    },
    selection: EditorSelection.range(
      main.from + txt.length,
      main.to + txt.length
    ),
  });
};

export const ADDCODE = (view: EditorView) => {
  if (!view) return;
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: "```\n" },
        { from: range.to, insert: "\n```" },
      ],
      range: EditorSelection.range(range.from + 4, range.to + 4),
    }))
  );
};

export const COMMENTOUT = (view: EditorView) => {
  if (!view) return;
  const main = view.state.selection.main;
  const txt = view.state.sliceDoc(
    view.state.selection.main.from,
    view.state.selection.main.to
  );
  if (txt.length === 0) return;
  if (txt.startsWith("<!--") && txt.endsWith("-->")) {
    const newText = txt.slice(4, -3);
    view.dispatch({
      changes: {
        from: main.from,
        to: main.to,
        insert: newText,
      },
      selection: EditorSelection.cursor(main.from + newText.length),
    });
  } else {
    const comment = `<!-- ${txt} -->`;
    view.dispatch({
      changes: {
        from: main.from,
        to: main.to,
        insert: comment,
      },
      selection: EditorSelection.cursor(main.from + comment.length),
    });
  }
};

export const TABLE = (view: EditorView) => {
    if (!view) return;
    const main = view.state.selection.main;
    const txt = view.state.sliceDoc(
        view.state.selection.main.from,
        view.state.selection.main.to
    );
    if (txt.length != 0) return;
    const table = `| Column 1 | Column 2 | Column 3 |
| :--------- | ---------: | :---------: |
| Row 1       | Row 1    | Row 1    |
| Row 2       | Row 2    | Row 2    |
| Row 3       | Row 3    | Row 3    |`;

    view.dispatch({
        changes: {
            from: main.from,
            to: main.to,
            insert: table,
        },
        selection: EditorSelection.cursor(main.from + table.length),
    });
};
 
export const STRIKETHROUGH = (view: EditorView) => {
    if (!view) return;
    // if selectionrange already has strikethrough, remove it
    const main = view.state.selection.main;
    const txt = view.state.sliceDoc(
        view.state.selection.main.from,
        view.state.selection.main.to
    );
    if (txt.startsWith("~~") && txt.endsWith("~~")) {
        const newText = txt.slice(2, -2);
        view.dispatch({
            changes: {
                from: main.from,
                to: main.to,
                insert: newText,
            },
            selection: EditorSelection.cursor(main.from + newText.length),
        });
    } else {
    view.dispatch(
        view.state.changeByRange((range) => ({
            changes: [
                { from: range.from, insert: "~~" },
                { from: range.to, insert: "~~" },
            ],
            range: EditorSelection.range(range.from + 2, range.to + 2),
        }))
    );
    }
}
