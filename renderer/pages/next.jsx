import React from 'react';
import { Remarkable } from 'remarkable';
import { markdownToHtml } from '../lib/mdToHtml.ts';
import {useState} from 'react';
import hljs from 'highlight.js'


class Next extends React.Component {
  constructor(props) {
    super(props);
     
 this.md = new Remarkable({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return ''; // use external default escaping
  }
});
    this.handleChange = this.handleChange.bind(this);
    this.state = { value: 'Hello, **world**!' };
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  getRawMarkup() {
    return { __html: this.md.render(this.state.value) };
  }


  render() {
    return (
      <div className="MarkdownEditor">
        <div style = {{float: "left", maxWidth: "50vw", padding: "2em"}}>
        <h3>Input</h3>
        <label htmlFor="markdown-content">
          Enter some markdown
        </label>
        <textarea
          id="markdown-content"
          onChange={this.handleChange}
          defaultValue={this.state.value}
          className=" h-full w-full"
          style={{ marginTop: "2em", minHeight: "60vh", backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px'}} 
        />
        </div>
        <div style={{float: "right", minWidth: "50vw", minHeight: "100vh", border: '1px solid #ccc', padding: "2em"}}>
        <h3>Output</h3>
        <div
            style={{marginTop: "2em"}}
          className="content list-decimal"
          dangerouslySetInnerHTML={ this.getRawMarkup()}
        />
        </div>
      </div>
    );
  }
}




export default Next;
