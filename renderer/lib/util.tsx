import { Dispatch, SetStateAction } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import fs from "fs-extra";
import pandoc from "./pandocConverter";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { codeFolding, indentOnInput } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { EditorSelection, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import open from "open";
import { spawn } from "child_process";
import os from "os";
const route = os.homedir() + "/columns.lua";
type Dispatcher<S> = Dispatch<SetStateAction<S>>;
import { ipcRenderer } from "electron";
import { getMarkdownWithMermaid } from "./mdParser";
import { shell } from "electron";
import {toast} from 'react-hot-toast'
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import * as prettier from 'prettier/standalone';
import * as markdowns from 'prettier/parser-markdown';

export const format =(value)=>prettier.format(value, { parser: 'markdown', tabWidth: 2, plugins: [markdowns] });


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

export const imageUrl = (view: EditorView, url: string) => {
  if (!view) return;
  const main = view.state.selection.main;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: `![alt-text](${url})`,
    },
    // selection: EditorSelection.range(main.from + 3 + url.length, main.to + 6),
  });
};

export const revealInFinder = (path: string) => {
  try {
    shell.showItemInFolder(path);
  } catch (e) {
    console.log(e);
  }
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
geometry: "left=2cm, right=2cm, top=3cm, bottom=2cm"
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

  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  const s =
    weekday[date.getDay()] +
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
};

/**
 * @description Function toggles and updates between vim and normal mode
 * @returns {void} void
 * @param {SetStateAction} setIsVim
 */
export const toggleBetweenVimAndNormalMode = (
  setIsVim: Dispatcher<boolean>
) => {
  const whatMode = localStorage.getItem("writingMode");
  if (whatMode == undefined) {
    localStorage.setItem("writingMode", "normal");
    setIsVim(false);
  } else {
    if (whatMode === "normal") {
      localStorage.setItem("writingMode", "vim");
      setIsVim(true);
    } else {
      localStorage.setItem("writingMode", "normal");
      setIsVim(false);
    }
  }
};

/**
 * @description Function opens external links in default browser
 * @returns {void}
 */
export const openExternalInDefaultBrowser = () => {
  document.addEventListener("click", (event) => {
    const element = event.target as HTMLAnchorElement | null;
    if (
      element?.tagName === "A" &&
      element?.href.indexOf(window.location.href) > -1 === false
    ) {
      event.preventDefault();
      open(element?.href);
    }
  });
};

export const EXTENSIONS: Extension[] = [
  indentOnInput(),
  codeFolding(),
  indentationMarkers(),
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    addKeymap: true,
  }),
  [EditorView.lineWrapping,],
];

export const checkForPandoc = (setPandocAvailable: Dispatcher<boolean>) => {
  try {
    const pandoc = spawn("pandoc", ["--version"]);
    pandoc.on("error", (error) => {
      setPandocAvailable(false);
      console.error(`Error: ${error}`);
    });
    setPandocAvailable(true);
  } catch (error) {
    setPandocAvailable(false);
    console.error(`Error: ${error}`);
  }
};

const writeLuaScript = () => {
  try {
    fs.writeFileSync(route, __luaScript__());
  } catch (e) {
    console.log(e);
  }
};

const deleteLuaScript = () => {
  const exists = fs.existsSync(route);
  if (exists) {
    try {
      fs.unlink(route);
    } catch (e) {
      console.log(e);
    }
  }
};

export const cleanFileNameForExport = (name: string) => {
  let value = name;
  if (name.endsWith(".md")) {
    value = name.substring(0, name.length - 3);
  }
  value = value.replace(/\s/g, "_");
  return value;
};


export function cleaner(name: string){
  let value = name;
  if (name.endsWith(".md")) {
    value = name.substring(0, name.length - 3);
  }
  value =  value.charAt(0).toUpperCase() + value.slice(1);
  return value;
}

/**
 * @description Function Convert specified file to pdf
 * @param {string} body - content to be converted
 * @param {string} name - name of the file
 * @param {Dispatcher} setSnackbar - displays a snackbar
 * @param {Dispatcher} setSnackBarMessage - Hold the snackbar message and message type i.e success, error, info
 * @returns {void}
 */

export const toPDF = (body: string, name: string) => {
  toast.promise(preparePDF(body, name), {
    loading: "Preparing PDF",
    error: "Could not convert to PDF",
    success: `Opened file as PDF`,
  });
};

export const toDOCX = (body: string, name: string) => {
  toast.promise(prepareDOCX(body, name), {
    loading: "Preparing DOCX",
    error: "Could not convert to DOCX",
    success: `Opened file as DOCX`,
  });
};
const preparePDF = (body: string, name: string) => {
  return new Promise((resolve, reject) => {
    let document = getMarkdownWithMermaid(body);
    ipcRenderer
      .invoke("creatingPdf", cleanFileNameForExport(name), document)
      .then(() => {
        ipcRenderer.on("pdfPath", function (event, response, documents) {
          if (response == null && documents == null) {
            setTimeout(reject, 1000);
            reject();
          }
          try {
            writeLuaScript();
            let outputpath = response;
            pandoc(
              documents,
              // `-f markdown -t pdf --lua-filter=${route} -o ${outputpath}`,
              fs.existsSync(route)
                ? `-f markdown -t pdf --lua-filter=${route} -o ${outputpath}`
                : `-f markdown -t pdf -o ${outputpath}`,
              function (err, result) {
                if (err) {
                  console.log(err);
                  setTimeout(reject, 1000);
                }
                if (fs.existsSync(outputpath)) {
                  open(outputpath);
                  setTimeout(resolve, 3000);
                } else {
                  setTimeout(reject, 1000);
                }
              }
            );
          } catch (e) {
            console.log(e);
            setTimeout(reject, 1000);
          }
        });
      });
  });
};

/**
 * @description Function Convert specified file to docx
 * @param {string} body - content to be converted
 * @param {string} name - name of the file
 * @returns {void}
 */
const prepareDOCX = (body: string, name: string) => {
  return new Promise((resolve, reject) => {
    ipcRenderer
      .invoke("creatingDocx", cleanFileNameForExport(name), body)
      .then(() => {
        ipcRenderer.on("docxPath", function (event, response, document) {
          if (response == null && document == null) {
            setTimeout(reject, 1000);
            reject();
          }
          try {
            const outputPath = response;
            pandoc(
              document,
              `-f markdown -t docx -o ${outputPath}`,
              function (err) {
                if (err) {
                  console.log(err);
                  setTimeout(reject, 1000);
                }
                if (fs.existsSync(outputPath)) {
                  setTimeout(resolve, 3000);
                  open(outputPath);
                } else {
                  setTimeout(reject, 1000);
                }
              }
            );
          } catch (e) {
            console.log(e);
            setTimeout(reject, 1000);
          }
        });
      });
  });
};

/**
 * @description Function Convert docx file to markdown
 * @param {string} filePath - path of the file to be converted
 * @returns {void}
 */
export const docxToMd = (filePath, Update) => {
  let destination = `${filePath.name.split(".")[0]}.md`;
  destination = destination.replace(/\s/g, "");
  try {
    pandoc(
      filePath.path,
      `-f docx -t markdown -o ${destination}`,
      function (err, result) {
        if (err) console.log(err);
        if (fs.existsSync(destination)) {
          Update();
        }
      }
    );
  } catch (e) {
    console.log(e);
  }

  return destination;
};

const pos2offset = (text, pos) => {
  const list = text.split("\n");

  let offset = pos.ch;
  for (let i = 0; i < pos.line; i++) {
    offset += list[i].length + 1;
  }

  return offset;
};

const offset2pos = (text, offset) => {
  const list = text.split("\n");

  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum += list[i].length + 1;
    if (sum > offset) {
      return { line: i, ch: list[i].length + 1 - (sum - offset) };
    }
  }

  return { line: list.length, ch: list[list.length - 1].length };
};


export function formatPlugin(ref){
  const plugin = function(CodeMirror){

  }
}
export const formats = (ref) => {
  if (!ref.current?.view) {
    return;
  }
  const indentUnit = 4;
  const cm = ref.current?.editor;
  const view = ref.current?.view;
  console.log(cm);
  const previousPos = view.state.selection.main.head;
  // cm.getCursor();
  const previousValue = view.state.doc.toString();
  // const beforeCoords = cm.cursorCoords();
  const beforeOffset = pos2offset(previousValue, previousPos);
  // const { formatted, cursorOffset } = prettier.formatWithCursor(previousValue, {
  //   cursorOffset: beforeOffset,
  //   parser: remarkParse,
  //   tabWidth: indentUnit,
  // });

  const formatted = prettier.format(previousValue, {
    semi: false,
    parser: unified().use(remarkParse),
  });

  const pos = offset2pos(formatted, 22);

  cm.dispatch({
    changes: { from: 0, to: cm.state.doc.length, insert: formatted },
  });
  cm.dispatch({ selection: { anchor: pos } });
  // cm.setValue(formatted);
  // cm.setCursor(pos);

  // const afterCoords = cm.cursorCoords();
  // const afterScrollInfo = cm.getScrollInfo();
  // const scroll = afterScrollInfo.top + afterCoords.top - beforeCoords.top;

  // cm.scrollTo(0, scroll);
};

/**
 * @description A lua script that allows manipulation of pandoc pdf
 * WARNING: DO NOT EDIT.
 * see: https://github.com/dialoa/columns/blob/master/columns.lua
 */
const __luaScript__ = () => {
  return "--[[-- # Columns - multiple column support in Pandoc's markdown.\n\nThis Lua filter provides support for multiple columns in\nlatex and html outputs. For details, see README.md.\n\n@author Julien Dutant <julien.dutant@kcl.ac.uk>\n@copyright 2021 Julien Dutant\n@license MIT - see LICENSE file for details.\n@release 1.1.2\n]]\n\n-- # Version control\nlocal required_version = '2.9.0'\nlocal version_err_msg = \"ERROR: pandoc >= \"..required_version\n                ..\" required for columns filter\"\n-- pandoc 2.9 required for pandoc.List insert method\nif PANDOC_VERSION == nil then -- if pandoc_version < 2.1\n  error(version_err_msg)\nelseif PANDOC_VERSION[2] < 9 then\n  error(version_err_msg)\nelse  \n  PANDOC_VERSION:must_be_at_least(required_version, version_err_msg)\nend\nlocal utils = require('pandoc.utils') -- this is superfluous in Pandoc >= 2.7 I think\n\n-- # Internal settings\n\n-- target_formats  filter is triggered when those formats are targeted\nlocal target_formats = {\n  \"html.*\",\n  \"latex\",\n}\nlocal options = {\n  raggedcolumns = false; -- global ragged columns option\n}\n\n-- # Helper functions\n\n--- type: pandoc-friendly type function\n-- panbdoc.utils.type is only defined in Pandoc >= 2.17\n-- if it isn't, we extend Lua's type function to give the same values\n-- as pandoc.utils.type on Meta objects: Inlines, Inline, Blocks, Block,\n-- string and booleans\n-- Caution: not to be used on non-Meta Pandoc elements, the\n-- results will differ (only 'Block', 'Blocks', 'Inline', 'Inlines' in\n-- >=2.17, the .t string in <2.17).\nlocal type = utils.type or function (obj)\n        local tag = type(obj) == 'table' and obj.t and obj.t:gsub('^Meta', '')\n        return tag and tag ~= 'Map' and tag or type(obj)\n    end\n\n--- Test whether the target format is in a given list.\n-- @param formats list of formats to be matched\n-- @return true if match, false otherwise\nlocal function format_matches(formats)\n  for _,format in pairs(formats) do\n    if FORMAT:match(format) then\n      return true\n    end\n  end\n  return false\nend\n\n\n--- Add a block to the document's header-includes meta-data field.\n-- @param meta the document's metadata block\n-- @param block Pandoc block element (e.g. RawBlock or Para) to be added to header-includes\n-- @return meta the modified metadata block\nlocal function add_header_includes(meta, block)\n\n    local header_includes = pandoc.List:new()\n\n    -- use meta['header-includes']\n\n    if meta['header-includes'] then\n      if type(meta['header-includes']) ==  'List' then\n        header_includes:extend(meta['header-includes'])\n      else\n        header_includes:insert(meta['header-includes'])\n      end\n    end\n\n    -- insert `block` in header-includes\n\n    header_includes:insert(pandoc.MetaBlocks({block}))\n\n    -- save header-includes in the document's meta\n\n    meta['header-includes'] = header_includes\n\n    return meta\nend\n\n--- Add a class to an element.\n-- @param element Pandoc AST element\n-- @param class name of the class to be added (string)\n-- @return the modified element, or the unmodified element if the element has no classes\nlocal function add_class(element, class)\n\n  -- act only if the element has classes\n  if element.attr and element.attr.classes then\n\n    -- if the class is absent, add it\n    if not element.attr.classes:includes(class) then\n      element.attr.classes:insert(class)\n    end\n\n  end\n\n  return element\nend\n\n--- Removes a class from an element.\n-- @param element Pandoc AST element\n-- @param class name of the class to be removed (string)\n-- @return the modified element, or the unmodified element if the element has no classes\nlocal function remove_class(element, class)\n\n  -- act only if the element has classes\n  if element.attr and element.attr.classes then\n\n    -- if the class is present, remove it\n    if element.attr.classes:includes(class) then\n      element.attr.classes = element.attr.classes:filter(\n        function(x)\n          return not (x == class)\n        end\n        )\n    end\n\n  end\n\n  return element\nend\n\n--- Set the value of an element's attribute.\n-- @param element Pandoc AST element to be modified\n-- @param key name of the attribute to be set (string)\n-- @param value value to be set. If nil, the attribute is removed.\n-- @return the modified element, or the element if it's not an element with attributes.\nlocal function set_attribute(element,key,value)\n\n  -- act only if the element has attributes\n  if element.attr and element.attr.attributes then\n\n    -- if `value` is `nil`, remove the attribute\n    if value == nil then\n      if element.attr.attributes[key] then\n       element.attr.attributes[key] = nil\n     end\n\n    -- otherwise set its value\n    else\n      element.attr.attributes[key] = value\n    end\n\n  end\n\n  return element\nend\n\n--- Add html style markup to an element's attributes.\n-- @param element the Pandoc AST element to be modified\n-- @param style the style markup to add (string in CSS)\n-- @return the modified element, or the unmodified element if it's an element without attributes\nlocal function add_to_html_style(element, style)\n\n  -- act only if the element has attributes\n  if element.attr and element.attr.attributes then\n\n    -- if the element has style markup, append\n    if element.attr.attributes['style'] then\n\n      element.attr.attributes['style'] =\n        element.attr.attributes['style'] .. '; ' .. style .. ' ;'\n\n    -- otherwise create\n    else\n\n      element.attr.attributes['style'] = style .. ' ;'\n\n    end\n\n  end\n\n  return element\n\nend\n\n--- Translate an English number name into a number.\n-- Converts cardinals (\"one\") and numerals (\"first\").\n-- Returns nil if the name isn't understood.\n-- @param name an English number name (string)\n-- @return number or nil\nlocal function number_by_name(name)\n\n  local names = {\n    one = 1,\n    two = 2,\n    three = 3,\n    four = 4,\n    five = 5,\n    six = 6,\n    seven = 7,\n    eight = 8,\n    nine = 9,\n    ten = 10,\n    first = 1,\n    second = 2,\n    third = 3,\n    fourth = 4,\n    fifth = 5,\n    sixth = 6,\n    seventh = 7,\n    eighth = 8,\n    ninth = 9,\n    tenth = 10,\n  }\n\n  result = nil\n\n  if name and names[name] then\n      return names[name]\n  end\n\nend\n\n--- Convert some CSS values (lengths, colous) to LaTeX equivalents.\n-- Example usage: `css_values_to_latex(\"1px solid black\")` returns\n-- `{ length = \"1pt\", color = \"black\", colour = \"black\"}`.\n-- @param css_str a CSS string specifying a value\n-- @return table with keys `length`, `color` (alias `colour`) if found\nlocal function css_values_to_latex(css_str)\n\n  -- color conversion table\n  --  keys are CSS values, values are LaTeX equivalents\n\n  latex_colors = {\n    -- xcolor always available\n    black = 'black',\n    blue = 'blue',\n    brown = 'brown',\n    cyan = 'cyan',\n    darkgray = 'darkgray',\n    gray = 'gray',\n    green = 'green',\n    lightgray = 'lightgray',\n    lime = 'lime',\n    magenta = 'magenta',\n    olive = 'olive',\n    orange = 'orange',\n    pink = 'pink',\n    purple = 'purple',\n    red = 'red',\n    teal = 'teal',\n    violet = 'violet',\n    white = 'white',\n    yellow = 'yellow',\n    -- css1 colors\n    silver = 'lightgray',\n    fuschia = 'magenta',\n    aqua = 'cyan',\n  }\n\n  local result = {}\n\n  -- look for color values\n  --  by color name\n  --  rgb, etc.: to be added\n\n  local color = ''\n\n  -- space in front simplifies pattern matching\n  css_str = ' ' .. css_str\n\n  -- look for colour names\n  for text in string.gmatch(css_str, '[%s](%a+)') do\n\n    -- if we have LaTeX equivalent of `text`, store it\n    if latex_colors[text] then\n      result['color'] = latex_colors[text]\n    end\n\n  end\n\n  -- provide British spelling\n\n  if result['color'] then\n    result['colour'] = result['color']\n  end\n\n  -- look for lengths\n\n  --  0 : converted to 0em\n  if string.find(css_str, '%s0%s') then\n   result['length'] = '0em'\n  end\n\n  --  px : converted to pt\n  for text in string.gmatch(css_str, '(%s%d+)px') do\n   result['length'] = text .. 'pt'\n  end\n\n  -- lengths units to be kept as is\n  --  nb, % must be escaped\n  --  nb, if several found, the latest type is preserved\n  keep_units = { '%%', 'pt', 'mm', 'cm', 'in', 'ex', 'em' }\n\n  for _,unit in pairs(keep_units) do\n\n    -- .11em format\n    for text in string.gmatch(css_str, '%s%.%d+'.. unit) do\n      result['length'] = text\n    end\n\n    -- 2em and 1.2em format\n    for text in string.gmatch(css_str, '%s%d+%.?%d*'.. unit) do\n      result['length'] = text\n    end\n\n  end\n\n  return result\n\nend\n\n--- Ensures that a string specifies a LaTeX length\n-- @param text text to be checked\n-- @return text if it is a LaTeX length, `nil` otherwise\nlocal function ensures_latex_length(text)\n\n  -- LaTeX lengths units\n  --  nb, % must be escaped in lua patterns\n  units = { '%%', 'pt', 'mm', 'cm', 'in', 'ex', 'em' }\n\n  local result = nil\n\n  -- ignore spaces, controls and punctuation other than\n  -- dot, plus, minus\n  text = string.gsub(text, \"[%s%c,;%(%)%[%]%*%?%%%^%$]+\", \"\")\n\n  for _,unit in pairs(units) do\n\n    -- match .11em format and 1.2em format\n    if string.match(text, '^%.%d+'.. unit .. '$') or\n      string.match(text, '^%d+%.?%d*'.. unit .. '$') then\n\n      result = text\n\n    end\n\n  end\n\n  return result\nend\n\n\n-- # Filter-specific functions\n\n--- Process the metadata block.\n-- Adds any needed material to the document's metadata block.\n-- @param meta the document's metadata element\nlocal function process_meta(meta)\n\n  -- in LaTeX, require the `multicols` package\n  if FORMAT:match('latex') then\n\n    return add_header_includes(meta,\n      pandoc.RawBlock('latex', '\\\\usepackage{multicol}\\n'))\n\n  end\n\n  -- in html, ensure that the first element of `columns` div\n  -- has a top margin of zero (otherwise we get white space\n  -- on the top of the first column)\n  -- idem for the first element after a `column-span` element\n  if FORMAT:match('html.*') then\n\n    html_header = [[\n<style>\n/* Styles added by the columns.lua pandoc filter */\n  .columns :first-child {margin-top: 0;}\n  .column-span + * {margin-top: 0;}\n</style>\n]]\n\n    return add_header_includes(meta, pandoc.RawBlock('html', html_header))\n\n  end\n\n  return meta\n\nend\n\n--- Convert explicit columnbreaks.\n-- This function converts any explict columnbreak markup in an element\n-- into a single syntax: a Div with class `columnbreak`.\n-- Note: if there are `column` Divs in the element we keep them\n-- in case they harbour further formatting (e.g. html classes). However\n-- we remove their `column` class to avoid double-processing when\n-- column fields are nested.\n-- @param elem Pandoc native Div element\n-- @return elem modified as needed\nlocal function convert_explicit_columbreaks(elem)\n\n  -- if `elem` ends with a `column` Div, this last Div should\n  -- not generate a columnbreak. We tag it to make sure we don't convert it.\n\n  if elem.content[#elem.content] and elem.content[#elem.content].classes\n    and elem.content[#elem.content].classes:includes('column') then\n\n    elem.content[#elem.content] =\n      add_class(elem.content[#elem.content], 'column-div-in-last-position')\n\n  end\n\n  -- processes `column` Divs and `\\columnbreak` LaTeX RawBlocks\n  filter = {\n\n    Div = function (el)\n\n      -- syntactic sugar: `column-break` converted to `columnbreak`\n      if el.classes:includes(\"column-break\") then\n\n        el = add_class(el,\"columnbreak\")\n        el = remove_class(el,\"column-break\")\n\n      end\n\n      if el.classes:includes(\"column\") then\n\n        -- with `column` Div, add a break if it's not in last position\n        if not el.classes:includes('column-div-in-last-position') then\n\n          local breaking_div = pandoc.Div({})\n          breaking_div = add_class(breaking_div, \"columnbreak\")\n\n          el.content:insert(breaking_div)\n\n        -- if it's in the last position, remove the custom tag\n        else\n\n          el = remove_class(el, 'column-div-in-last-position')\n\n        end\n\n        -- remove `column` classes, but leave the div and other\n        -- attributes the user might have added\n        el = remove_class(el, 'column')\n\n      end\n\n      return el\n    end,\n\n    RawBlock = function (el)\n      if el.format == \"tex\" and el.text == '\\\\columnbreak' then\n\n        local breaking_div = pandoc.Div({})\n        breaking_div = add_class(breaking_div, \"columnbreak\")\n\n        return breaking_div\n\n      else\n\n        return el\n\n      end\n\n    end\n\n  }\n\n  return pandoc.walk_block(elem, filter)\n\nend\n\n--- Tag an element with the number of explicit columnbreaks it contains.\n-- Counts the number of epxlicit columnbreaks contained in an element and\n-- tags the element with a `number_explicit_columnbreaks` attribute.\n-- In the process columnbreaks are tagged with the class `columnbreak_already_counted`\n-- in order to avoid double-counting when multi-columns are nested.\n-- @param elem Pandoc element (native Div element of class `columns`)\n-- @return elem with the attribute `number_explicit_columnbreaks` set.\nlocal function tag_with_number_of_explicit_columnbreaks(elem)\n\n  local number_columnbreaks = 0\n\n  local filter = {\n\n    Div = function(el)\n\n      if el.classes:includes('columnbreak') and\n        not el.classes:includes('columnbreak_already_counted')  then\n\n          number_columnbreaks = number_columnbreaks + 1\n          el = add_class(el, 'columnbreak_already_counted')\n\n      end\n\n      return el\n\n    end\n  }\n\n  elem = pandoc.walk_block(elem, filter)\n\n  elem = set_attribute(elem, 'number_explicit_columnbreaks',\n      number_columnbreaks)\n\n  return elem\n\nend\n\n--- Consolidate aliases for column attributes.\n-- Provides syntacic sugar: unifies various ways of\n-- specifying attributes of a multi-column environment.\n-- When several specifications conflit, favours `column-gap` and\n-- `column-rule` specifications.\n-- @param elem Pandoc element (Div of class `columns`) with column attributes.\n-- @return elem modified as needed.\nlocal function consolidate_colattrib_aliases(elem)\n\n  if elem.attr and elem.attr.attributes then\n\n    -- `column-gap` if the preferred syntax is set, erase others\n    if elem.attr.attributes[\"column-gap\"] then\n\n      elem = set_attribute(elem, \"columngap\", nil)\n      elem = set_attribute(elem, \"column-sep\", nil)\n      elem = set_attribute(elem, \"columnsep\", nil)\n\n    -- otherwise fetch and unset any alias\n    else\n\n      if elem.attr.attributes[\"columnsep\"] then\n\n        elem = set_attribute(elem, \"column-gap\",\n            elem.attr.attributes[\"columnsep\"])\n        elem = set_attribute(elem, \"columnsep\", nil)\n\n      end\n\n      if elem.attr.attributes[\"column-sep\"] then\n\n        elem = set_attribute(elem, \"column-gap\",\n            elem.attr.attributes[\"column-sep\"])\n        elem = set_attribute(elem, \"column-sep\", nil)\n\n      end\n\n      if elem.attr.attributes[\"columngap\"] then\n\n        elem = set_attribute(elem, \"column-gap\",\n            elem.attr.attributes[\"columngap\"])\n        elem = set_attribute(elem, \"columngap\", nil)\n\n      end\n\n    end\n\n    -- `column-rule` if the preferred syntax is set, erase others\n    if elem.attr.attributes[\"column-rule\"] then\n\n      elem = set_attribute(elem, \"columnrule\", nil)\n\n    -- otherwise fetch and unset any alias\n    else\n\n      if elem.attr.attributes[\"columnrule\"] then\n\n        elem = set_attribute(elem, \"column-rule\",\n            elem.attr.attributes[\"columnrule\"])\n        elem = set_attribute(elem, \"columnrule\", nil)\n\n      end\n\n    end\n\n  end\n\n  return elem\n\nend\n\n--- Pre-process a Div of class `columns`.\n-- Converts explicit column breaks into a unified syntax\n-- and count the Div's number of columns.\n-- When several columns are nested Pandoc will apply\n-- this filter to the innermost `columns` Div first;\n-- we use that feature to prevent double-counting.\n-- @param elem Pandoc element to be processes (Div of class `columns`)\n-- @return elem modified as needed\nlocal function preprocess_columns(elem)\n\n  -- convert any explicit column syntax in a single format:\n  -- native Divs with class `columnbreak`\n\n  elem = convert_explicit_columbreaks(elem)\n\n  -- count explicit columnbreaks\n\n  elem = tag_with_number_of_explicit_columnbreaks(elem)\n\n  return elem\nend\n\n--- Determine the number of column in a `columns` Div.\n-- Looks up two attributes in the Div: the user-specified\n-- `columns-count` and the filter-generated `number_explicit_columnbreaks`\n-- which is based on the number of explicit breaks specified.\n-- The final number of columns will be 2 or whichever of `column-count` and\n-- `number_explicit_columnbreaks` is the highest. This ensures there are\n-- enough columns for all explicit columnbreaks.\n-- This provides a single-column when the user specifies `column-count = 1` and\n-- there are no explicit columnbreaks.\n-- @param elem Pandoc element (Div of class `columns`) whose number of columns is to be determined.\n-- @return number of columns (number, default 2).\nlocal function determine_column_count(elem)\n\n    -- is there a specified column count?\n  local specified_column_count = 0\n  if elem.attr.attributes and elem.attr.attributes['column-count'] then\n      specified_column_count = tonumber(\n        elem.attr.attributes[\"column-count\"])\n  end\n\n  -- is there an count of explicit columnbreaks?\n  local number_explicit_columnbreaks = 0\n  if elem.attr.attributes and elem.attr.attributes['number_explicit_columnbreaks'] then\n\n      number_explicit_columnbreaks = tonumber(\n        elem.attr.attributes['number_explicit_columnbreaks']\n        )\n\n      set_attribute(elem, 'number_explicit_columnbreaks', nil)\n\n  end\n\n  -- determines the number of columns\n  -- default 2\n  -- recall that number of columns = nb columnbreaks + 1\n\n  local number_columns = 2\n\n  if specified_column_count > 0 or number_explicit_columnbreaks > 0 then\n\n      if (number_explicit_columnbreaks + 1) > specified_column_count then\n        number_columns = number_explicit_columnbreaks + 1\n      else\n        number_columns = specified_column_count\n      end\n\n  end\n\n  return number_columns\n\nend\n\n--- Convert a pandoc Header to a list of inlines for latex output.\n-- @param header Pandoc Header element\n-- @return list of Inline elements\nlocal function header_to_latex_and_inlines(header)\n\n-- @todo check if level interpretation has been shifted, e.g. section is level 2\n-- @todo we could check the Pandoc state to check whether hypertargets are required?\n\n  local latex_header = {\n    'section',\n    'subsection',\n    'subsubsection',\n    'paragraph',\n    'subparagraph',\n  }\n\n  -- create a list if the header's inlines\n  local inlines = pandoc.List:new(header.content)\n\n  -- wrap in a latex_header if available\n\n  if header.level and latex_header[header.level] then\n\n    inlines:insert(1, pandoc.RawInline('latex',\n        '\\\\' .. latex_header[header.level] .. '{'))\n    inlines:insert(pandoc.RawInline('latex', '}'))\n\n  end\n\n  -- wrap in a link if available\n  if header.identifier then\n\n    inlines:insert(1, pandoc.RawInline('latex',\n        '\\\\hypertarget{' .. header.identifier .. '}{%\\n'))\n    inlines:insert(pandoc.RawInline('latex',\n        '\\\\label{' .. header.identifier .. '}}'))\n\n  end\n\n  return inlines\n\nend\n\n--- Format column span in LaTeX.\n-- Formats a bit of text spanning across all columns for LaTeX output.\n-- If the colspan is only one block, it is turned into an option\n-- of a new `multicol` environment. Otherwise insert it is\n-- inserted between the two `multicol` environments.\n-- @param elem Pandoc element that is supposed to span across all\n--    columns.\n-- @param number_columns number of columns in the present environment.\n-- @return a pandoc RawBlock element in LaTeX format\nlocal function format_colspan_latex(elem, number_columns)\n\n    local result = pandoc.List:new()\n\n    -- does the content consists of a single header?\n\n    if #elem.content == 1 and elem.content[1].t == 'Header' then\n\n      -- create a list of inlines\n      inlines = pandoc.List:new()\n      inlines:insert(pandoc.RawInline('latex',\n        \"\\\\end{multicols}\\n\"))\n      inlines:insert(pandoc.RawInline('latex',\n        \"\\\\begin{multicols}{\".. number_columns ..\"}[\"))\n      inlines:extend(header_to_latex_and_inlines(elem.content[1]))\n      inlines:insert(pandoc.RawInline('latex',\"]\\n\"))\n\n      -- insert as a Plain block\n      result:insert(pandoc.Plain(inlines))\n\n      return result\n\n    else\n\n      result:insert(pandoc.RawBlock('latex',\n        \"\\\\end{multicols}\\n\"))\n      result:extend(elem.content)\n      result:insert(pandoc.RawBlock('latex',\n        \"\\\\begin{multicols}{\".. number_columns ..\"}\"))\n      return result\n\n    end\n\nend\n\n--- Format columns for LaTeX output\n-- @param elem Pandoc element (Div of \"columns\" class) containing the\n--    columns to be formatted.\n-- @return elem with suitable RawBlocks in LaTeX added\nlocal function format_columns_latex(elem)\n\n  -- make content into a List object\n  pandoc.List:new(elem.content)\n\n  -- how many columns?\n  number_columns = determine_column_count(elem)\n\n  -- set properties and insert LaTeX environment\n  --  we wrap the entire environment in `{...}` to\n  --  ensure properties (gap, rule) don't carry\n  --  over to following columns\n\n  local latex_begin = '{'\n  local latex_end = '}'\n  local ragged = options.raggedcolumns\n\n  -- override global ragged setting?\n  if elem.classes:includes('ragged')\n      or elem.classes:includes('raggedcolumns')\n      or elem.classes:includes('ragged-columns') then\n        ragged = true\n  elseif elem.classes:includes('justified')\n      or elem.classes:includes('justifiedcolumns')\n      or elem.classes:includes('justified-columns') then\n        ragged = false\n  end\n  if ragged then\n    latex_begin = latex_begin..'\\\\raggedcolumns'\n  end\n\n  if elem.attr.attributes then\n\n    if elem.attr.attributes[\"column-gap\"] then\n\n      local latex_value = ensures_latex_length(\n        elem.attr.attributes[\"column-gap\"])\n\n      if latex_value then\n\n        latex_begin = latex_begin ..\n          \"\\\\setlength{\\\\columnsep}{\" .. latex_value .. \"}\\n\"\n\n      end\n\n      -- remove the `column-gap` attribute\n      elem = set_attribute(elem, \"column-gap\", nil)\n\n    end\n\n    if elem.attr.attributes[\"column-rule\"] then\n\n      -- converts CSS value string to LaTeX values\n      local latex_values = css_values_to_latex(\n        elem.attr.attributes[\"column-rule\"])\n\n      if latex_values[\"length\"] then\n\n        latex_begin = latex_begin ..\n          \"\\\\setlength{\\\\columnseprule}{\" ..\n          latex_values[\"length\"] .. \"}\\n\"\n\n      end\n\n      if latex_values[\"color\"] then\n\n        latex_begin = latex_begin ..\n          \"\\\\renewcommand{\\\\columnseprulecolor}{\\\\color{\" ..\n          latex_values[\"color\"] .. \"}}\\n\"\n\n      end\n\n\n      -- remove the `column-rule` attribute\n      elem = set_attribute(elem, \"column-rule\", nil)\n\n    end\n\n  end\n\n  latex_begin = latex_begin ..\n    \"\\\\begin{multicols}{\" .. number_columns .. \"}\\n\"\n  latex_end = \"\\\\end{multicols}\\n\" .. latex_end\n\n  elem.content:insert(1, pandoc.RawBlock('latex', latex_begin))\n  elem.content:insert(pandoc.RawBlock('latex', latex_end))\n\n  -- process blocks contained in `elem`\n  --  turn any explicit columnbreaks into LaTeX markup\n  --  turn `column-span` Divs into LaTeX markup\n\n  filter = {\n\n    Div = function(el)\n\n      if el.classes:includes(\"columnbreak\") then\n        return pandoc.RawBlock('latex', \"\\\\columnbreak\\n\")\n      end\n\n      if el.classes:includes(\"column-span-to-be-processed\") then\n        return format_colspan_latex(el, number_columns)\n      end\n\n    end\n\n  }\n\n  elem = pandoc.walk_block(elem, filter)\n\n  return elem\n\nend\n\n\n--- Formats columns for html output.\n-- Uses CSS3 style added to the elements themselves.\n-- @param elem Pandoc element (Div of `columns` style)\n-- @return elem with suitable html attributes\nlocal function format_columns_html(elem)\n\n  -- how many columns?\n  number_columns = determine_column_count(elem)\n\n  -- add properties to the `columns` Div\n\n  elem = add_to_html_style(elem, 'column-count: ' .. number_columns)\n  elem = set_attribute(elem, 'column-count', nil)\n\n  if elem.attr.attributes then\n\n    if elem.attr.attributes[\"column-gap\"] then\n\n      elem = add_to_html_style(elem, 'column-gap: ' ..\n        elem.attr.attributes[\"column-gap\"])\n\n      -- remove the `column-gap` attribute\n      elem = set_attribute(elem, \"column-gap\")\n\n    end\n\n    if elem.attr.attributes[\"column-rule\"] then\n\n      elem = add_to_html_style(elem, 'column-rule: ' ..\n        elem.attr.attributes[\"column-rule\"])\n\n      -- remove the `column-rule` attribute\n      elem = set_attribute(elem, \"column-rule\", nil)\n\n    end\n\n  end\n\n  -- convert any explicit columnbreaks in CSS markup\n\n  filter = {\n\n    Div = function(el)\n\n      -- format column-breaks\n      if el.classes:includes(\"columnbreak\") then\n\n        el = add_to_html_style(el, 'break-after: column')\n\n        -- remove columbreaks class to avoid double processing\n        -- when nested\n        -- clean up already-counted tag\n        el = remove_class(el, \"columnbreak\")\n        el = remove_class(el, \"columnbreak_already_counted\")\n\n      -- format column-spans\n      elseif el.classes:includes(\"column-span-to-be-processed\") then\n\n        el = add_to_html_style(el, 'column-span: all')\n\n        -- remove column-span-to-be-processed class to avoid double processing\n        -- add column-span class to allow for styling\n        el = add_class(el, \"column-span\")\n        el = remove_class(el, \"column-span-to-be-processed\")\n\n      end\n\n      return el\n\n    end\n\n  }\n\n  elem = pandoc.walk_block(elem, filter)\n\n  return elem\n\nend\n\n\n-- # Main filters\n\n--- Formating filter.\n-- Applied last, converts prepared columns in target output formats\n-- @field Div looks for `columns` class\nformat_filter = {\n\n  Div = function (element)\n\n    -- pick up `columns` Divs for formatting\n    if element.classes:includes (\"columns\") then\n\n      if FORMAT:match('latex') then\n        element = format_columns_latex(element)\n      elseif FORMAT:match('html.*') then\n        element = format_columns_html(element)\n      end\n\n      return element\n\n    end\n\n  end\n}\n\n--- Preprocessing filter.\n-- Processes meta-data fields and walks the document to pre-process\n-- columns blocks. Determine how many columns they contain, tags the\n-- last column Div, etc. Avoids double-counting when columns environments\n-- are nested.\n-- @field Div looks for `columns` class\n-- @field Meta processes the metadata block\npreprocess_filter = {\n\n  Div = function (element)\n\n      -- send `columns` Divs to pre-processing\n      if element.classes:includes(\"columns\") then\n        return preprocess_columns(element)\n      end\n\n    end,\n\n  Meta = function (meta)\n\n    return process_meta(meta)\n\n  end\n}\n\n--- Syntactic sugar filter.\n-- Provides alternative ways of specifying columns properties.\n-- Kept separate from the pre-processing filter for clarity.\n-- @field Div looks for Div of classes `columns` (and related) and `column-span`\nsyntactic_sugar_filter = {\n\n  Div = function(element)\n\n      -- convert \"two-columns\" into `columns` Divs\n      for _,class in pairs(element.classes) do\n\n        -- match xxxcolumns, xxx_columns, xxx-columns\n        -- if xxx is the name of a number, make\n        -- a `columns` div and set its `column-count` attribute\n        local number = number_by_name(\n          string.match(class,'(%a+)[_%-]?columns$')\n          )\n\n        if number then\n\n          element = set_attribute(element,\n              \"column-count\", tostring(number))\n          element = remove_class(element, class)\n          element = add_class(element, \"columns\")\n\n        end\n\n      end\n\n      -- allows different ways of specifying `columns` attributes\n      if element.classes:includes('columns') then\n\n        element = consolidate_colattrib_aliases(element)\n\n      end\n\n      -- `column-span` syntax\n      -- mark up as \"to-be-processed\" to avoid\n      --  double processing when nested\n      if element.classes:includes('column-span') or\n        element.classes:includes('columnspan') then\n\n        element = add_class(element, 'column-span-to-be-processed')\n        element = remove_class(element, 'column-span')\n        element = remove_class(element, 'columnspan')\n\n      end\n\n    return element\n\n  end\n\n}\n\n--- Read options filter\nread_options_filter = {\n  Meta = function (meta)\n\n    if not meta then return end\n\n    -- global vertical ragged / justified settings\n    if meta.raggedcolumns or meta['ragged-columns'] then\n      options.raggedcolumns = true\n    elseif meta.justifiedcolumns or meta['justified-columns'] then\n      options.raggedcolumns = false\n    end\n\n  end\n}\n\n-- Main statement returns filters only if the\n-- target format matches our list. The filters\n-- returned are applied in the following order:\n-- 1. `syntatic_sugar_filter` deals with multiple syntax\n-- 2. `preprocessing_filter` converts all explicit\n--    columnbreaks into a common syntax and tags\n--    those that are already counted. We must do\n--    that for all `columns` environments before\n--    turning any break back into LaTeX `\\columnbreak` blocks\n--    otherwise we mess up the count in nested `columns` Divs.\n-- 3. `format_filter` formats the columns after the counting\n--    has been done\nif format_matches(target_formats) then\n  return {\n    read_options_filter,\n    syntactic_sugar_filter,\n    preprocess_filter,\n    format_filter\n  }\nelse\n  return\nend\n";
};
