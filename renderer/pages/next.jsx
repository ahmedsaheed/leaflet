import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Remarkable } from 'remarkable';
import { markdownToHtml } from '../lib/mdToHtml.ts';
import {useState} from 'react';

// convert the below class into a functional component
const Next =  () => {
  const [value, setValue] = useState("Hello **World!**");
  const [html, setHtml] = useState("");

  const handleChange = (e) =>  {
    setValue(e.target.value);
     setHtml(markdownToHtml(e.target.value));
    console.log(html);
  }

  return (
    <div className="MarkdownEditor">
      <div style = {{float: "left", maxWidth: "50vw", padding: "2em"}}>
      <h3>Input</h3>
      <label htmlFor="markdown-content">
        Enter some markdown
      </label>
      <textarea
        id="markdown-content"
        onChange={handleChange}
        defaultValue={value}
        className=" h-full w-full"
        style={{ marginTop: "2em", minHeight: "60vh", backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px'}} 
      />
      </div>
      <div style={{float: "right", minWidth: "50vw", minHeight: "100vh", border: '1px solid #ccc', padding: "2em"}}>
      <h3>Output</h3>
      <div
          style={{marginTop: "2em"}}
        className="content list-decimal"
        dangerouslySetInnerHTML={ {__html: html} }
      />
      </div>
    </div>
  );


}

// class Next extends React.Component {
//   constructor(props) {
//     super(props);
//     this.md = new Remarkable();
//     this.handleChange = this.handleChange.bind(this);
//     this.state = { value: 'Hello, **world**!' };
//   }

//   handleChange(e) {
//     this.setState({ value: e.target.value });
//   }


//   async getContent() {
//     const content = await markdownToHtml(this.state.value || "")
//     console.log(content);

//     return content;
//   }

//   //   async getRawMarkup() {
//   //    return { __html:  await this.getContent() };
//   // }

//   render() {
//     return (
//       <div className="MarkdownEditor">
//         <div style = {{float: "left", maxWidth: "50vw", padding: "2em"}}>
//         <h3>Input</h3>
//         <label htmlFor="markdown-content">
//           Enter some markdown
//         </label>
//         <textarea
//           id="markdown-content"
//           onChange={this.handleChange}
//           defaultValue={this.state.value}
//           className=" h-full w-full"
//           style={{ marginTop: "2em", minHeight: "60vh", backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px'}} 
//         />
//         </div>
//         <div style={{float: "right", minWidth: "50vw", minHeight: "100vh", border: '1px solid #ccc', padding: "2em"}}>
//         <h3>Output</h3>
//         <div
//             style={{marginTop: "2em"}}
//           className="content list-decimal"
//           dangerouslySetInnerHTML={ {__html: this.getContent()}}
//         />
//         </div>
//       </div>
//     );
//   }
// }




export default Next;
