import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Remarkable } from 'remarkable';
// function Next() {
//   return (
//     <React.Fragment>
//       <Head>
//         <title>OOOIIII</title>
//       </Head>
//       <div className='grid grid-col-1 text-2xl w-full text-center'>
//         <img className='ml-auto mr-auto' src='/images/logo.png' />
//         <span>This is so cool!</span>
//       </div>
//       <div className='mt-1 w-full flex-wrap flex justify-center'>
//         <Link href='/home'>
//           <a className='btn-blue'>Go to home page</a>
//         </Link>
//       </div>
//     </React.Fragment>
//   )
// }

class Next extends React.Component {
  constructor(props) {
    super(props);
    this.md = new Remarkable();
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
        <h3>Input</h3>
        <label htmlFor="markdown-content">
          Enter some markdown
        </label>
        <textarea
          id="markdown-content"
          onChange={this.handleChange}
          defaultValue={this.state.value}
          className=" h-full w-full"
          style={{backgroundColor: 'transparent'}}  
        />
        <h3>Output</h3>
        <div
          style={{listStyle: 'circle inside'}}
          className="content"
          dangerouslySetInnerHTML={this.getRawMarkup()}
        />
      </div>
    );
  }
}




export default Next;
