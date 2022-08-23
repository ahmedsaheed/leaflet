import React from 'react';
import Countable from 'wordcount';

export default function ButtomBar({word}) {
const date = new Date();
    return(
        <div className="fixed inset-x-0 bottom-0 ButtomBar" style={{marginLeft: "30%", maxHeight: "10vh"}}>
        <container className="Left" style={{float: "left", paddingLeft: "40px"}}>
            <span>1:1</span>
            <div style={{display: "inline", marginRight:"40px"}}></div>
            <span>{Countable(word)}</span>
        </container>
        <container className="Right" style={{float: "right", paddingRight: "40px"}}>
         <span style={{float: "left"}}>note</span>
         <div style={{display: "inline", marginLeft: "40px"}}></div>
        <span style={{float: "right"}}>{date.getHours()}:{date.getMinutes()}</span>
           

        </container>
        
        </div>
    )
}
