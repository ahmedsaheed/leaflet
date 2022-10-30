import { useState,  } from 'react';


export const progress = (scroll) => {

   
  
    const progress = ["|", "|", "|", "|", "|", "|", "|", "|", "|", "|"]
    .map((v, i) => {
      return i < (scroll / 100) * 10 ? "<b>|</b>" : v;
    })
    .join("");
  return `${progress} ${scroll.toFixed(1)}%`;
        
}
