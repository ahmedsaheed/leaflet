import hljs from "highlight.js";
import metadata_block from 'markdown-it-metadata-block'
import yaml from 'yaml'


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
      md.use(metadata_block,{
        parseMetadata: yaml.parse,
      })

      try{
        return { __html: md.render(value) };
      }catch(err){
        return { __html: "Couldn't render, Something not right!" };
      }

     
}

