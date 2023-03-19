import React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import "../public/fonts/css/font.css";

if(typeof window !== "undefined"){
  const prefersColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersColorScheme) {
    require("highlight.js/styles/atom-one-dark-reasonable.css");
  }else{
    require("highlight.js/styles/atom-one-light.css");
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
