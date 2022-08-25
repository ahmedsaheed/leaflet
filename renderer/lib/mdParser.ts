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
      md.use(require("markdown-it-anchor").default); 
      md.use(require("markdown-it-table-of-contents"));

      try{
        return { __html: md.render(value) };
      }catch(err){
        return { __html: "Can't Render Something not right!" };
      }

     
}

