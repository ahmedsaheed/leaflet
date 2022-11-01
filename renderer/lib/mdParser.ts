import hljs from "highlight.js";
const meta = require('markdown-it-meta')
import todo from "markdown-it-task-lists"

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
      require('markdown-it-pandoc')(md);
      md.use(meta)
      md.use(todo, {enabled: true});
      try{
          const result = md.render(value)
          return {
            document: {__html: result},
            metadata: md.meta
          }
      }catch(err){
        return { __html: "Couldn't render, Something not right!" };
      }

     
}

