import  { useEffect,useCallback, useRef, useState } from "react";
import {EditorState, StateField} from "@codemirror/state"
import {EditorView, highlightActiveLine, keymap, ViewPlugin} from "@codemirror/view"
import {  indentOnInput } from "@codemirror/language";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { bracketMatching,HighlightStyle, defaultHighlightStyle } from "@codemirror/language";
import { history } from "@codemirror/commands";
import { Extension } from "@codemirror/state";
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import {tags} from "@lezer/highlight";
import {javascript} from "@codemirror/lang-javascript"
import { syntaxHighlighting, syntaxTree } from "@codemirror/language";


const transparentTheme = EditorView.theme({
    '&': {
      backgroundColor: 'transparent !important',
    },
    'body' :{
      fontSize: "85% !important",

    }
  })
  
   const highlight = HighlightStyle.define([
    {
      tag: tags.heading1,
      fontSize: '1.6em',
      fontWeight: 'bold'
    },
    {
      tag: tags.heading2,
      fontSize: '1.4em',
      fontWeight: 'bold'
    },
    {
      tag: tags.heading3,
      fontSize: '1.2em',
      fontWeight: 'bold'
    }
  ])
  
  interface Props  {
    initialDoc: string;
    onChange?: (state: EditorState) => void;
  }


export const codeMirrior = <T extends Element>(props: Props): [React.MutableRefObject<T | null>, EditorView?] => {
   const refContainer = useRef<T | null>(null);
   const [view, setView] = useState<EditorView | null>(null);
   const {onChange} = props;


 useEffect(() => {
   if (!refContainer.current) return

   const startState = EditorState.create({
     doc: props.initialDoc,
     extensions: [
       keymap.of([...defaultKeymap, ...historyKeymap]),
       history(),
       indentOnInput(),
       bracketMatching(),
       markdown({
         base: markdownLanguage,
         codeLanguages: languages,
         addKeymap: true
       }),
       oneDark,
       transparentTheme,
       javascript(),
       syntaxHighlighting(highlight),
       EditorView.lineWrapping,
       EditorView.updateListener.of(update => {
          if(update.changes){
            onChange && onChange(update.state)
          }
       })
       

     ]
   })
   const view = new EditorView({
     state: startState,
     parent: refContainer.current
   })
   setView(view)

  
 }, [refContainer])

 return [refContainer, view]
}
