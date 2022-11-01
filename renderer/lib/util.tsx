import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export const PDFIcon: React.FC<{}> = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="18"
      height="18"
      viewBox="0 0 32 32"
    >
      <path
        fill="#888888"
        d="M30 18v-2h-6v10h2v-4h3v-2h-3v-2h4zm-11 8h-4V16h4a3.003 3.003 0 0 1 3 3v4a3.003 3.003 0 0 1-3 3zm-2-2h2a1.001 1.001 0 0 0 1-1v-4a1.001 1.001 0 0 0-1-1h-2zm-6-8H6v10h2v-3h3a2.003 2.003 0 0 0 2-2v-3a2.002 2.002 0 0 0-2-2zm-3 5v-3h3l.001 3z"
      />
      <path
        fill="currentColor"
        d="M22 14v-4a.91.91 0 0 0-.3-.7l-7-7A.909.909 0 0 0 14 2H4a2.006 2.006 0 0 0-2 2v24a2 2 0 0 0 2 2h16v-2H4V4h8v6a2.006 2.006 0 0 0 2 2h6v2Zm-8-4V4.4l5.6 5.6Z"
      />
    </svg>
  );
};

export const DOCXIcon: React.FC<{}> = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="18"
      height="18"
      viewBox="0 0 16 16"
    >
      <path
        fill="#888888"
        fill-rule="evenodd"
        d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5Zm-6.839 9.688v-.522a1.54 1.54 0 0 0-.117-.641a.861.861 0 0 0-.322-.387a.862.862 0 0 0-.469-.129a.868.868 0 0 0-.471.13a.868.868 0 0 0-.32.386a1.54 1.54 0 0 0-.117.641v.522c0 .256.04.47.117.641a.868.868 0 0 0 .32.387a.883.883 0 0 0 .471.126a.877.877 0 0 0 .469-.126a.861.861 0 0 0 .322-.386a1.55 1.55 0 0 0 .117-.642Zm.803-.516v.513c0 .375-.068.7-.205.973a1.47 1.47 0 0 1-.589.627c-.254.144-.56.216-.917.216a1.86 1.86 0 0 1-.92-.216a1.463 1.463 0 0 1-.589-.627a2.151 2.151 0 0 1-.205-.973v-.513c0-.379.069-.704.205-.975c.137-.274.333-.483.59-.627c.257-.147.564-.22.92-.22c.357 0 .662.073.916.22c.256.146.452.356.59.63c.136.271.204.595.204.972ZM1 15.925v-3.999h1.459c.406 0 .741.078 1.005.235c.264.156.46.382.589.68c.13.296.196.655.196 1.074c0 .422-.065.784-.196 1.084c-.131.301-.33.53-.595.689c-.264.158-.597.237-.999.237H1Zm1.354-3.354H1.79v2.707h.563c.185 0 .346-.028.483-.082a.8.8 0 0 0 .334-.252c.088-.114.153-.254.196-.422a2.3 2.3 0 0 0 .068-.592c0-.3-.04-.552-.118-.753a.89.89 0 0 0-.354-.454c-.158-.102-.361-.152-.61-.152Zm6.756 1.116c0-.248.034-.46.103-.633a.868.868 0 0 1 .301-.398a.814.814 0 0 1 .475-.138c.15 0 .283.032.398.097a.7.7 0 0 1 .273.26a.85.85 0 0 1 .12.381h.765v-.073a1.33 1.33 0 0 0-.466-.964a1.44 1.44 0 0 0-.49-.272a1.836 1.836 0 0 0-.606-.097c-.355 0-.66.074-.911.223c-.25.148-.44.359-.571.633c-.131.273-.197.6-.197.978v.498c0 .379.065.704.194.976c.13.271.321.48.571.627c.25.144.555.216.914.216c.293 0 .555-.054.785-.164c.23-.11.414-.26.551-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.765a.8.8 0 0 1-.117.364a.699.699 0 0 1-.273.248a.874.874 0 0 1-.401.088a.845.845 0 0 1-.478-.131a.834.834 0 0 1-.298-.393a1.7 1.7 0 0 1-.103-.627v-.495Zm5.092-1.76h.894l-1.275 2.006l1.254 1.992h-.908l-.85-1.415h-.035l-.852 1.415h-.862l1.24-2.015l-1.228-1.984h.932l.832 1.439h.035l.823-1.439Z"
      />
    </svg>
  );
};

export const MARKDOWNIcon = () => {
  return (
    <svg
      style={{
        display: "inline",
      }}
      height="22"
      viewBox="0 0 24 24"
    >
      <path
        fill="#888888"
        d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35l1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35l-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z"
      />
    </svg>
  );
};

export const COMMANDPALLETEOPENIcon = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="15"
      height="15"
      viewBox="0 0 512 512"
    >
      <path
        d="M432.8 136v96H122.3l84.4-86.2-33.2-33.8L32 256l141.5 144 33.2-33.8-84.4-86.2H480V136h-47.2z"
        fill="#888888"
      />
    </svg>
  );
};

export const COMMANDPALLETESELECTIcon = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="15"
      height="15"
      viewBox="0 0 32 32"
    >
      <path
        fill="#888888"
        d="M27.6 20.6L24 24.2V4h-2v20.2l-3.6-3.6L17 22l6 6l6-6zM9 4l-6 6l1.4 1.4L8 7.8V28h2V7.8l3.6 3.6L15 10z"
      />
    </svg>
  );
};

export const TAGIcon = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <g fill="#888888">
        <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z" />
        <path d="M5.5 5a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1zm0 1a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3zM1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1v5.086z" />
      </g>
    </svg>
  );
};

export const MATERIALIcon = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="16"
      height="16"
      viewBox="0 0 24 24"
    >
      <path
        fill="#888888"
        d="M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5A2.5 2.5 0 0 1 11 2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6h-1.5Z"
      />
    </svg>
  );
};
export const getBG = () => {
  const bg = ["#90FFFF", "#EE82EE", "#FEC1CB", "#65CDAA", "#F0E68C"];
  return bg[Math.floor(Math.random() * bg.length)];
};

export const CLOCKIcon = () => {
  return (
    <svg
      style={{ display: "inline" }}
      width="16"
      height="16"
      viewBox="0 0 24 24"
    >
      <path
        fill="#888888"
        d="M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8s-8 3.6-8 8s3.6 8 8 8m0-18c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2m.5 5v6H7v-1.5h4V7h1.5Z"
      />
    </svg>
  );
};



export const BOLD = (view : EditorView ) => {
  if(!view) return;
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: '**' },
        { from: range.to, insert: '**' },
      ],
      range: EditorSelection.range(range.from + 2, range.to + 2),
    })),
  );
}


export const ADDYAML = (view : EditorView) => {
  if(!view) return;
  const yaml = `---
title: Your Title
author: 
 - John Doe
 - Jane Doe
date: ${new Date().toLocaleDateString()}
tags:
 - programming
 - computers
 - conversations
material:
 - {github: 'https://github.com/'} 
 - {mala: 'https://github.com/'}
 - {xala: 'https://github.com/'}   
---

`

  view.dispatch({
      changes: { from: 0, to: 0, insert: yaml },
      selection: { anchor: 0, head: 0 },
       scrollIntoView: true
      });

}

export const GETDATE = () => {
  const date = new Date();
  const strArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const s =
    "" +
    (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()) +
    "-" +
    strArray[date.getMonth()] +
    "-" +
    date.getFullYear() +
    " ";
  return s;
};


export const LINK = (view : EditorView) => {
  if(!view) return;
  const main = view.state.selection.main;
  const txt = view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to);
  if (txt.match("[(.*?)]((.*?))")) return;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: `[${txt}](url)`,
    },
    selection: EditorSelection.range(main.from + 3 + txt.length, main.to + 3),
  });
}


export const QUICKINSERT = (view : EditorView, txt : string) => {
  if (!view) return;
  const main = view.state.selection.main;
  view.dispatch({
    changes: {
      from: main.from,
      to: main.to,
      insert: txt,
    },
    selection: EditorSelection.range(main.from + txt.length, main.to + txt.length)
  });
}