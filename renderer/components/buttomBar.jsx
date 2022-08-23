import React from 'react';
import Countable from 'wordcount';
import Clock from 'react-live-clock';



export default function ButtomBar({word, mode}) {
const date = new Date();
    return(
        <div className="fixed inset-x-0 bottom-0 ButtomBar" style={{marginLeft: "30%", maxHeight: "10vh", marginTop: "20px"}}>
        <container className="Left" style={{float: "left", paddingLeft: "40px",paddingTop: "5px", paddingBottom: "5px"}}>
            <span>{`${mode} Mode`}</span>
            <div style={{display: "inline", marginRight:"40px"}}></div>
            <span>{Countable(word)}</span>
        </container>
        <container className="Right" style={{float: "right", paddingRight: "40px" ,paddingTop: "5px", paddingBottom: "5px"}}>
         <span style={{float: "left"}}>
        <svg style={{display: "inline"}} width="32" height="22"  viewBox="0 0 24 24"><path fill="#888888" d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35l1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35l-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z"/></svg>

        </span>
         <div style={{display: "inline", marginLeft: "40px"}}></div>
        <span style={{float: "right"}}><Clock format="HH:mm:ss" interval={1000} ticking={true} /></span>
           

        </container>
        
        </div>
    )
}
