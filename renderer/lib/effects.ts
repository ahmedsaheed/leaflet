import React, { useEffect, Dispatch, SetStateAction } from 'react'
import { ipcRenderer } from 'electron'
import { EditorView } from '@codemirror/view'
import mainPath from 'path'
import dragDrop from 'drag-drop'
import {
  openExternalInDefaultBrowser,
  toggleBetweenVimAndNormalMode,
  checkForPandoc,
  toDOCX,
  toPDF,
  revealInFinder,
  imageUrl,
  toggleFileDialog
} from './util'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { NavStack, stashToRouter } from './routes/route'
import { clientStore } from './storage'
type Dispatcher<S> = Dispatch<SetStateAction<S>>
type file = {
  path: string
  name: string
  body: string
  structure: { [key: string]: any }
}
export function effects({
  initialised,
  setPandocAvailable,
  setIsVim,
  setFiles,
  setValue,
  setName,
  setPath,
  refs,
  setEditorView,
  files,
  setStruct,
  path,
  name,
  value,
  saveFile,
  Update,
  onDelete,
  setInsert,
  insert,
  toggleFileDialog,
  setScroll,
  navRouter,
  setOpen,
  toggleFont
}: {
  initialised: boolean
  setPandocAvailable: Dispatcher<boolean>
  setIsVim: Dispatcher<boolean>
  setFiles: Dispatcher<file[]>
  setValue: Dispatcher<string>
  setName: Dispatcher<string>
  setPath: Dispatcher<string>
  refs: React.MutableRefObject<ReactCodeMirrorRef>
  setEditorView: Dispatcher<EditorView>
  files: file[]
  setStruct: Dispatcher<{ [key: string]: any }>
  path: string
  name: string
  value: string
  saveFile: () => void
  Update: () => void
  onDelete: (path: string, name: string) => void
  setInsert: Dispatcher<boolean>
  insert: boolean
  toggleFileDialog: (setFile: Dispatcher<any>, Update: () => void) => void
  setScroll: Dispatcher<number>
  navRouter: NavStack
  setOpen: Dispatcher<boolean>
  toggleFont: any
}) {
  useEffect(() => {
    if (!initialised) {
      initialised = true
      openExternalInDefaultBrowser()
      checkForPandoc(setPandocAvailable)
      toggleBetweenVimAndNormalMode(setIsVim)
      ipcRenderer.invoke('getTheFile').then((files = []) => {
        setFiles(files)
        const currentFilePath = clientStore.get('currentFilePath')
        const currentFile = files.find((file) => file.path === currentFilePath)
        if (currentFile) {
          setValue(currentFile.body)
          setName(currentFile.name)
          setPath(currentFile.path)
          setStruct(currentFile.structure.children)
          stashToRouter(currentFile.path, navRouter)
        } else {
          setValue(files[0] ? `${files[0].body}` : '')
          setName(files[0] ? `${files[0].name}` : '')
          setPath(files[0] ? `${files[0].path}` : '')
          setStruct(files[0].structure.children)
          stashToRouter(files[0].path, navRouter)
        }
        const isSideBarOpen = clientStore.get('sideBarOpen')
        setOpen(isSideBarOpen)
      })
    }
  }, [])

  useEffect(() => {
    if (refs.current?.view) setEditorView(refs.current?.view)
  }, [refs.current])

  useEffect(() => {
    if (files.length > 0) {
      setStruct(files[0].structure.children)
    }
  }, [files])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-revealInFinder', function () {
      if (!ignore) {
        revealInFinder(path)
      }
    })

    return () => {
      ignore = true
    }
  }, [path])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-totrash', function () {
      if (!ignore) {
        onDelete(path, name)
      }
    })

    return () => {
      ignore = true
    }
  }, [path, name])
  useEffect(() => {
    ipcRenderer.on('in-app-command-vibracy', function () {
      document.body.style.background = 'transparent'
    })
  }, [])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-togglevim', function () {
      if (!ignore) {
        toggleBetweenVimAndNormalMode(setIsVim)
      }
    })

    return () => {
      ignore = true
    }
  }, [path, name])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-topdf', function () {
      if (!ignore) {
        toPDF(value, name)
      }
    })

    return () => {
      ignore = true
    }
  }, [value, name])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-todocx', function () {
      if (!ignore) {
        toDOCX(value, name)
      }
    })

    return () => {
      ignore = true
    }
  }, [value, name])

  useEffect(() => {
    let ignore = false
    ipcRenderer.on('in-app-command-togglefont', function () {
      if (!ignore) {
        toggleFont()
      }
    })
  })

  useEffect(() => {
    let save = false
    ipcRenderer.on('save', function () {
      if (!save) {
        saveFile()
        Update()
      }
    })

    return () => {
      save = true
    }
  }, [value, path])

  useEffect(() => {
    ipcRenderer.on('open', function () {
      toggleFileDialog(setFiles, Update)
    })
  }, [])

  useEffect(() => {
    ipcRenderer.on('insertClicked', function () {
      insert ? '' : setInsert(true)
    })

    ipcRenderer.on('previewClicked', function () {
      insert ? setInsert(false) : ''
    })
  }, [insert])

  const handleScroll = (event) => {
    let ScrollPercent = 0
    const Scrolled = document.documentElement.scrollTop
    const MaxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight
    ScrollPercent = (Scrolled / MaxHeight) * 100
    setScroll(ScrollPercent)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [isRunning, setIsRunning] = React.useState(false)
  const dragDropImage = React.useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      dragDrop('.markdown-content', (images: [File]) => {
        const imageFiles = images.filter((file) => {
          const ext = mainPath.extname(file.path)
          return ext === '.jpg' || ext === '.jpeg' || ext === '.png'
        })
        imageFiles.map((validImage) =>
          imageUrl({ view: refs.current?.view, url: validImage.path })
        )
        setIsRunning(false)
      })
    }
  }, [isRunning, refs.current])
  const dragDropRef = React.useRef(dragDropImage)
  dragDropRef.current = dragDropImage

  useEffect(() => {
    if (insert) {
      dragDropRef.current()
    }
  }, [insert, refs.current])
}
