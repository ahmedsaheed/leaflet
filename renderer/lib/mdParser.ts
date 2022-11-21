import hljs from "highlight.js";
import todo from "markdown-it-task-lists";
import yaml from 'yaml'
import metadata_block from 'markdown-it-metadata-block'
/**
 * @param {string} value
 * @returns {string} html
 * @returns {object} metadata
 * @description
 * This function is used to convert markdown to html
 */
export const getMarkdown = (value: string) => {
    type Metadata = {
        title: string,
        date: string,
        tags: string[],
        material: {}

    }
  const meta:Metadata = {};
  const md = require("markdown-it")({
    html: true,
    typographer: true,
    highlight: function (str: string, lang: string) {
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
  md.use(metadata_block,{
    parseMetadata: yaml.parse,
    meta
})
  md.use(todo, { enabled: true });
  try {
    const result = md.render(value);
    return {
      document: { __html: result },
      metadata: meta,
    };
  } catch (err) {
    return { __html: "Couldn't render page, Something not right!" };
  }
};


