import React from "react";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import "../styles/globals.css";
import "@fontsource/ia-writer-mono"
// import "@fontsource/ia-writer-duospace";
import type { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
