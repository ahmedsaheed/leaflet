import hljs from "highlight.js";
import todo from "markdown-it-task-lists";
import yaml from "yaml";
import metadata_block from "markdown-it-metadata-block";
import mermaid from "mermaid";

let counter = 0;

const getUniqueId = () => {
  counter += 1;
  return `mermaid-diagram-${counter}`;
};

const mermaidCodeRegex = /```mermaid([\s\S]*?)```/;

//TODO: The below function isn't fault tolerant. It will break if the mermaid code is not valid.
export const getMarkdownWithMermaid = (markdown: string) => {
  // Extract mermaid code blocks from the markdown string
  let html = markdown;
  const diagram = [];
  let match;
  while ((match = html.match(mermaidCodeRegex))) {
    const mermaidCode = match[1];
    const mermaidId = getUniqueId();
    try {
      mermaid.render(mermaidId, mermaidCode, (svgCode: string) => {
        // Insert the rendered SVG code into the DOM
        const element = document.createElement("div");
        element.innerHTML = svgCode;
        diagram.push(element);
        const diagramElement = element.firstChild as HTMLElement;
        if (diagramElement) {
          diagramElement.id = mermaidId;
          html = html.replace(mermaidCodeRegex, diagramElement.outerHTML);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  console.log(diagram);

  return html;
};

/**
 * @param {string} value
 * @returns {string} html
 * @returns {object} metadata
 * @description
 * This function is used to convert markdown to html
 */
export const getMarkdown = (value: string) => {
  type Metadata = {
    title: string;
    date: string;
    tags: string[];
    material: {};
  };
  const meta = {} as Metadata;
  const md = require("markdown-it")({
    html: true,
    typographer: true,
    highlight: function (str: string, lang: string) {
      if (lang === "mermaid") {
        return str;
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (err) {
          console.log(err);
        }
      }

      try {
        return hljs.highlightAuto(str).value;
      } catch (err) {
        console.log(err);
      }
    },
  });
  require("markdown-it-pandoc")(md);
  md.use(metadata_block, {
    parseMetadata: yaml.parse,
    meta,
  });

  md.use(todo, { enabled: true });
  try {
    const diagram = getMarkdownWithMermaid(value);
    let result = md.render(diagram);
    return {
      document: { __html: result },
      metadata: meta,
    };
  } catch (err) {
    return { __html: "Couldn't render page, Something not right!" };
  }
};
