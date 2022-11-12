import { useState, useEffect } from 'react';

export const progress = (scroll) => {
    // const [scroll, setScroll] = useState(0);

  // useEffect(() => {


  // const handleScroll = event => {
    // let ScrollPercent = 0;
    // const Scrolled = document.documentElement.scrollTop;
    // const MaxHeight =
    //   document.documentElement.scrollHeight -
    //   document.documentElement.clientHeight;
    // ScrollPercent = (Scrolled / MaxHeight) * 100;
    // setScroll(ScrollPercent);
  // };
    // window.addEventListener("scroll", handleScroll);
    // return () => window.removeEventListener("scroll", handleScroll);
  // }, []);


    const progress = ["| ", "| ", "| ", "| ", "| ", "| ", "| ", "| ", "| ", "| "]
    .map((v, i) => {
      return i < (scroll / 100) * 10 ? "<b>| </b>" : v;
    })
    .join("");
  return `${progress} ${scroll.toFixed(1)}%`;
        
}
