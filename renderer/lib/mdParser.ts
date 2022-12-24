import hljs from "highlight.js";
import todo from "markdown-it-task-lists";
import yaml from "yaml";
import metadata_block from "markdown-it-metadata-block";
import mermaid from "mermaid";

const getUniqueId = () => {
  let counter = 0;
  return `mermaid-diagram-${counter + 1}`;
};

export const getMarkdownWithMermaid = (markdown: string): string => {
  const parts = markdown.split(/```mermaid([\s\S]*?)```/);
  const svgCodes: string[] = [];
  // Process each mermaid code block
  for (let i = 1; i < parts.length; i += 2) {
    const mermaidCode = parts[i];
    const mermaidId = getUniqueId();
    try {
      mermaid.render(mermaidId, mermaidCode, (svgCode: string) => {
        svgCodes.push(svgCode);
      });
    } catch (e) {
      console.log(e);
    }
  }

  // Build HTML string by replacing the mermaid code blocks with the rendered SVG code
  if (svgCodes.length > 0 == false) {
    return markdown;
  } else {
    let html = parts[0];
    for (let i = 1; i < parts.length; i += 2) {
      html += svgCodes[(i - 1) / 2] + parts[i + 1];
    }
    return html;
  }
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
  const document = getMarkdownWithMermaid(value);
  try {
    let result = md.render(document);
    return {
      document: { __html: result },
      metadata: meta,
    };
  } catch (err) {
    return { __html: "Couldn't render page, Something not right!" };
  }
};


/*
const getUniqueId = () => {
let counter = 0;
  return `mermaid-diagram-${counter + 1}`;
};

export const getMarkdownWithMermaid = (markdown: string) => {
  // Extract mermaid code blocks from the markdown string
  const mermaidCodeRegex = /```mermaid([\s\S]*?)```/;
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
*/
