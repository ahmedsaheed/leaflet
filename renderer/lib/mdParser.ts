import { Remarkable } from "remarkable";
import hljs from "highlight.js";
import katex from "remarkable-katex";

export const getMarkdown = (value: string) => {  
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