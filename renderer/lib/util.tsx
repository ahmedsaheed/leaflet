import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { codeFolding, foldGutter, indentOnInput } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { EditorSelection, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";


/**
 * Bold a text in editor view
 * @param view EditorView
 */
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


/**
 * Adds an italic in editor view
 * @param view EditorView
 */

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

/**
 * Adds a yaml metadata at top of editor view
 * @param view EditorView
 */

export const ADDYAML = (view: EditorView) => {
  if (!view) return;
  const yaml = `---
title: Your Title
author: 
 - John Doe
 - Jane Doe
date: ${GETDATE()}
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

/**
 * Generates todays date in format: EEE d MMM YYYY
 */
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

const weekday = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];
  const s = weekday[date.getDay()] +
    " " +
    (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()) +
    " " +
    strArray[date.getMonth()] +
    " " +
    date.getFullYear() +
    " ";
  return s;
};

/**
 * Insert a link in editor view
 * @param view EditorView
 */
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


/**
 * Insert given text at cursor position in editor view
 * @param view EditorView
 * @param txt Text to be added at cursor
 */
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

/**
 * Inserts a code block in editor view
 * @param view EditorView
 */
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

/**
 * Comment out selected text in editor view
 * @param view EditorView
 */
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

/**
 * Adds a table in editor view
 * @param view EditorView
 */
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
 
/**
 * Adds a strike-through in editor view
 * @param view EditorView
 */
export const STRIKETHROUGH = (view: EditorView) => {
    if (!view) return;
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


export const EXTENSIONS: Extension[] = [
  indentOnInput(),
 codeFolding(),
 foldGutter(),
 markdown({
 base: markdownLanguage,
 codeLanguages: languages,
  addKeymap: true,
  }),
  [EditorView.lineWrapping],
]
