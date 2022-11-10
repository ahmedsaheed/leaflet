import React from "react";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import "../styles/globals.css";
import "@fontsource/ia-writer-mono";
import type { AppProps } from "next/app";
import '../styles/menu.css';


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
