import { Dispatch, SetStateAction } from 'react'
import { EditorView } from '@codemirror/view'
import path from 'path'
import os from 'os'
import {
  GETDATE,
  LINK,
  BOLD,
  QUICKINSERT,
  ADDYAML,
  COMMENTOUT
} from '../lib/util'
import { NavStack } from './routes/route'
type Dispatcher<S> = Dispatch<SetStateAction<S>>
const onboardingDIR = path.resolve(os.homedir(), 'leaflet', 'onboarding.md')
const date = new Date()

export const ListenToKeys = ({
  saveFile,
  editor,
  insert,
  setInsert,
  toPDF,
  toDOCX,
  value,
  name,
  path,
  toggleFileDialog,
  setFileNameBox,
  setSearch,
  setClick,
  click,
  toggleSidebar,
  navStack,
  setFiles,
  Update
}: {
  saveFile: () => void
  editor: EditorView
  insert: boolean
  setInsert: Dispatcher<boolean>
  toPDF: (value: string, name: string) => void
  toDOCX: (value: string, name: string) => void
  value: string
  name: string
  path: string
  toggleFileDialog: (setFile: Dispatcher<any>, Update: () => void) => void
  setFileNameBox: Dispatcher<boolean>
  setSearch: Dispatcher<string>
  setClick: Dispatcher<boolean>
  click: boolean
  toggleSidebar: () => void
  navStack: NavStack
  setFiles: Dispatcher<Array<any>>
  Update: () => void
}) => {
  document.onkeydown = function handleKeysEvent(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      saveFile()
      e.preventDefault()
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      if (!insert) {
        return
      }
      BOLD(editor)
      e.preventDefault()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      toPDF(value, name)
      e.preventDefault()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      console.log(navStack)
      // toDOCX(value, name)
      e.preventDefault()
      return
    }

    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      if (path != onboardingDIR) {
        setInsert(!insert)
        e.preventDefault()
        return
      } else {
        setInsert(false)
        e.preventDefault()
        return
      }
    } else if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
      setInsert(false)
      e.preventDefault()
      return
    }

    if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
      toggleFileDialog(setFiles, Update)
      e.preventDefault()
      return
    }

    if ((e.key === '[' || e.key === ']') && (e.ctrlKey || e.metaKey)) {
      if (!insert) {
        return
      }
      LINK(editor)
    }
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      setFileNameBox(true)
      e.preventDefault()
      return
    }

    if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
      if (!insert) {
        return
      }
      QUICKINSERT(editor, GETDATE())
      e.preventDefault()
      return
    }
    if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
      if (!insert) {
        return
      }
      COMMENTOUT(editor)
      e.preventDefault()
      return
    }

    if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
      if (!insert) {
        return
      }

      QUICKINSERT(editor, date.toLocaleTimeString())
      e.preventDefault()
      return
    }
    if (e.key === 'j' && (e.ctrlKey || e.metaKey)) {
      if (!insert) {
        return
      }
      ADDYAML(editor)
      e.preventDefault()
      return
    }
    // if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    //   if (!insert || !editor) return;
    //   undo(editor);
    // }

    if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
      toggleSidebar()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      e.stopPropagation()
      setSearch('')
      setClick(!click)
      return
    } else if (e.key === 'Escape') {
      setClick(false)
      return
    }
  }
}
