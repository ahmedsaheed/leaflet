import { Remarkable } from "remarkable";
// import {MarkdownIt} from "markdown-it";
import hljs from "highlight.js";

export const getMarkdown = (value: string) => {  
    const md = require('markdown-it')({
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
      var katex = require('markdown-it-katex');
      md.use(katex);
      md.use(require('markdown-it-footnote'));
      md.use(require('markdown-it-task-lists'))

      try{
        return { __html: md.render(value) };
      }catch(err){
        return { __html: "Can't Render Something not right!" };
      }

     
}



// import { unified } from "unified"
// import parse from "remark-parse"
// import math from "remark-math"
// import remark2rehype from "remark-rehype"
// import katex from "rehype-katex"
// import stringify from "rehype-stringify"
// import highlight from "rehype-highlight"
// // import slug from "rehype-slug"
// // import link from "rehype-autolink-headings"
// import rehypeRaw from "rehype-raw"
// import remarkGfm from "remark-gfm"

// export async  function getMarkdown(markdown) {
//     const result = await  unified()
//         .use(parse)
//         .use(math)
//         .use(remark2rehype, { allowDangerousHtml: true })
//         .use(remarkGfm)
//         .use(rehypeRaw)
//         .use(katex)
//         .use(stringify)
//         .use(highlight)
//         // .use(slug)
//         .process(markdown.toString());

//         return { __html: result.toString() };

//     // return result.toString()
// }