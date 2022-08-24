import { Remarkable } from "remarkable";
import hljs from "highlight.js";
import katex from "remarkable-katex";

export const getMarkdown = (value) => {  
    const md = new Remarkable("full", {
        html: true,
        typographer: true,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (err) {}
          }
    
          try {
            return hljs.highlightAuto(str).value;
          } catch (err) {}
        },
      });
      md.use(katex);

     return { __html: md.render(value) };
}