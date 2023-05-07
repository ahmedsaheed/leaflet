import React, { useCallback, useEffect, useRef, useState } from 'react'
import moment from 'moment'
import fs from 'fs-extra'
import mainPath from 'path'
import 'react-cmdk/dist/cmdk.css'
import { ipcRenderer } from 'electron'
import { vim } from '@replit/codemirror-vim'
import { effects } from '../lib/effects'
import { FileTree } from '../components/filetree'
import { getMarkdown } from '../lib/mdParser'
import { githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror, { basicSetup } from '@uiw/react-codemirror'
import { getStatistics, ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { usePrefersColorScheme } from '../lib/theme'
import { basicLight } from 'cm6-theme-basic-light'
import { ListenToKeys } from '../lib/keyevents'
import { toast } from 'react-hot-toast'
import { Footer, FooterProps } from '../components/footer'
import { CMDK } from '../components/cmdk'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { Nav } from '../components/nav'
import {
  MARKDOWNToggler,
  OPENSLIDERIcon,
  SEARCHIcon,
  SLIDERIcon,
  STACKIcon
} from '../components/icons'
import log4js from 'log4js'
import {
  GETDATE,
  EXTENSIONS,
  toDOCX,
  toPDF,
  format,
  toggleBetweenVimAndNormalMode,
  ValidateYaml,
  toggleFileDialog
} from '../lib/util'
import { NavStack, RouteInitializer, stashToRouter } from '../lib/routes/route'
import { clientStore } from '../lib/storage'

export default function Leaflet({ toggleFont, currentFont }) {
  type file = {
    path: string
    name: string
    body: string
    structure: { [key: string]: any }
  }
  const date = new Date()
  const [value, setValue] = useState<string>('')
  const [insert, setInsert] = useState<boolean>(false)
  const [files, setFiles] = useState<file[]>([])
  const [name, setName] = useState<string>('')
  const [scroll, setScroll] = useState<number>(0)
  const [path, setPath] = useState<string>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState<'root' | 'projects'>('root')
  const [menuOpen, setMenuOpen] = useState<boolean>(true)
  const [click, setClick] = useState<boolean>(false)
  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [fileNameBox, setFileNameBox] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string>('')
  const [pandocAvailable, setPandocAvailable] = useState<boolean>(false)
  const [cursor, setCursor] = useState<string>('1L:1C')
  const appDir = mainPath.resolve(require('os').homedir(), 'leaflet')
  const [struct, setStruct] = useState<{ [key: string]: any }>([])
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false)
  const [parentDir, setParentDir] = useState<string>(appDir)
  const [editorview, setEditorView] = useState<EditorView>()
  const [isVim, setIsVim] = useState<boolean>(false)
  const [open, setOpen] = React.useState(false)
  const [readingSession, setReadingSession] = useState({
    startTime: null,
    endTime: null
  })
  const refs = React.useRef<ReactCodeMirrorRef>({})
  const contentRef = React.useRef<HTMLDivElement>(null)
  const prefersColorScheme = usePrefersColorScheme()
  const isDarkMode = prefersColorScheme === 'dark'
  let navStack = RouteInitializer()
  const resolvedMarkdown = getMarkdown(value)
  const logger = log4js.getLogger()
  logger.level = 'debug'

  useEffect(() => {
    ListenToKeys({
      saveFile,
      editor: editorview,
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
      toggleSidebar: open ? handleDrawerClose : handleDrawerOpen,
      navStack,
      setFiles,
      Update
    })
  })

  function handleStartReading() {
    const startTime = moment()
    setReadingSession({ ...readingSession, startTime })
  }

  function handleStopReading() {
    const endTime = moment()
    const durationMs = moment
      .duration(endTime.diff(readingSession.startTime))
      .asMilliseconds()
    setReadingSession({ ...readingSession, endTime })
  }

  const handleDrawerOpen = () => {
    clientStore.set('sideBarOpen', true)
    setOpen(true)
  }
  const handleDrawerClose = () => {
    clientStore.set('sideBarOpen', false)
    setOpen(false)
  }

  const saveFile = () => {
    try {
      let newvalue = value
      try {
        newvalue = format(value)
      } catch (e) {
        console.log(e)
      }

      ipcRenderer.invoke('saveFile', path, newvalue).then(() => {
        setTimeout(() => {
          setIsEdited(false)
        }, 3000)
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * @description delete a file node
   * @param {string} path - path of the file to be deleted
   * @param {string} name - name of the file to be deleted
   * @returns {void}
   */
  function onDelete(path: string, name: string): void {
    try {
      if (!fs.existsSync(path)) {
        return
      }
      ipcRenderer.invoke('deleteFile', name, path).then(() => {
        Update()
        toast('File moved to trash', {
          icon: '🗑️',
          style: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#fff' : '#000'
          }
        })

        setStruct(files[0].structure.children)
        const index = Math.floor(Math.random() * files.length)
        setInsert(false)
        setValue(files[index].body)
        setName(files[index].name)
        setPath(files[index].path)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const Update = () => {
    ipcRenderer.invoke('getTheFile').then((files = []) => {
      setFiles(files)
      setStruct(files[0].structure.children)
    })
  }

  effects({
    initialised: false,
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
    navRouter: navStack,
    setOpen,
    toggleFont
  })

  const updateCursor = (a, b) => {
    const line = a.number
    const column = b - a.from
    setCursor(`${line}L:${column}C`)
  }

  const checkEdit = (doc) => {
    if (!path) return
    doc.toString() === fs.readFileSync(path, 'utf8')
      ? setIsEdited(false)
      : () => {}
    setIsEdited(true)
  }

  /**
   * @description updates cm state on change
   */
  const codeMirrorOnChangeHandler = useCallback(
    (doc: string, viewUpdate: ViewUpdate) => {
      setValue(doc.toString())
      let offset = getStatistics(viewUpdate).selection.main.head
      let line = viewUpdate.state.doc.lineAt(offset)
      let currLine
      updateCursor(line, offset)
      if (line.number === viewUpdate.state.doc.length) {
        refs.current.editor.scrollTo({ top: offset, behavior: 'smooth' })
        refs.current.editor.scrollIntoView({ block: 'end', inline: 'nearest' })
      }

      checkEdit(doc)
    },
    [path]
  )

  /**
   * @description creates a new directory with a single file
   * @param {string} name - name of the directory
   */
  const createNewDir = (name: string) => {
    if (fs.existsSync(mainPath.join(parentDir, name)) || name === '') {
      return
    }
    if (fs.existsSync(parentDir)) {
      fs.mkdirSync(`${parentDir}/${name}`)
      fs.writeFileSync(
        `${parentDir}/${name}/new.md`,
        `${name} created on ${GETDATE()} at ${date.toLocaleTimeString()}`
      )
      Update()
    }
    setIsCreatingFolder(false)
  }

  const contentControls = useAnimation()
  const containerRef = useRef(null)

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const scrollEnd = scrollHeight - clientHeight

    if (scrollTop >= scrollEnd) {
      contentControls.start({
        y: -20,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
      })
    } else {
      contentControls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
      })
    }
  }

  const CommandMenu = click && (
    <CMDK
      onNewFile={() => {
        setFileNameBox(true)
      }}
      onCreatingFolder={() => {
        try {
          setIsCreatingFolder(true)
          setFileNameBox(true)
        } catch (e) {
          console.log(e)
        }
      }}
      setSearch={setSearch}
      files={files}
      setClick={setClick}
      page={page}
      search={search}
      menuOpen={menuOpen}
      onFileSelect={(file) => {
        try {
          onNodeClicked(file.path, file.name)
        } catch (err) {
          console.log(err)
        }
      }}
    />
  )
  useEffect(() => {
    ipcRenderer.on('new', function () {
      setFileNameBox(true)
    })
  }, [fileNameBox])

  const ScrollToTopOfContentRef = () => {
    console.log('scrolling to top of content ref')
    if (!insert) {
      let ref = document.getElementsByClassName('markdown-content')[0]
      if (ref) {
        ref.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
      // contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  /**
   * @description handle file selection from the sidebar
   * @param {string} path - path of the file to be selected
   * @param {string} name - name of the file to be selected
   * @returns {void}
   */
  const onNodeClicked = (path: string, name: string): void => {
    try {
      saveFile()
      setValue(fs.readFileSync(path, 'utf8'))
      setName(name)
      setPath(path)
      stashToRouter(path, navStack as NavStack)
      clientStore.set('currentFilePath', path)
      setInsert(false)
      ScrollToTopOfContentRef()
    } catch (err) {
      console.log(err)
    }
  }
  const vimToggler = () => toggleBetweenVimAndNormalMode(setIsVim)
  const footerProps = {
    insert,
    vimToggler,
    value,
    cursor,
    editorview,
    path
  } as FooterProps

  return (
    <div className='h-screen w-screen' style={{ overflow: 'hidden' }}>
      <div className='flex' style={{ minHeight: '100vh' }}>
        <div className='hidden md:flex md:flex-row'>
          <div className='max-h-screen no-scrollbar flex overflow-y-scroll bg-palette-0 bg-black'></div>
          <Nav
            open={open}
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleDrawerClose}
            setClick={() => setClick(!click)}
            click={click}
          />
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                animate={{ width: 250 }}
                initial={{ width: 0 }}
                exit={{ width: 0 }}
                className='second-nav h-screen max-h-screen custom-border no-scrollbar flex flex-col border-r-[0.5px] bg-transparent'
              >
                <div className='drag flex shrink-0 flex-col justify-center px-4 h-16'>
                  <div className='flex items-center justify-between'>
                    <span className='w-full text-lg font-small text-palette-800'>
                      Notes
                    </span>
                    <span
                      onClick={handleDrawerClose}
                      className='flex h-[22px] items-center transition-all duration-300 smarthover:hover:text-primary-500 text-palette-600'
                    >
                      <SLIDERIcon />
                    </span>
                  </div>
                </div>
                <div className='sticky px-2'>
                  <ul className='space-y-1'>
                    <li>
                      <span
                        className='cursor-pointer flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-300 smarthover:hover:text-primary-500 bg-palette-100 text-primary-500 dark:bg-palette-50'
                        onClick={() => setClick(!click)}
                        aria-current='page'
                      >
                        <SEARCHIcon />
                        <span className='align-middle text-sm'>search</span>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className='no-scrollbar overflow-y-auto mx-2.5 space-y-5 pb-32'>
                  <div></div>
                  <div className='space-y-1.5 overflow-y-scroll hide-scrollbar '>
                    <div className='space-y-1'>
                      <div className=''>
                        <FileTree
                          structures={struct}
                          onNodeClicked={(path, name) =>
                            onNodeClicked(path, name)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          className='flex grow flex-col overflow-hidden transition-all duration-150'
          style={{ willChange: 'transform' }}
        >
          <div
            id='dashboard-view-container'
            className='relative flex h-screen max-h-screen flex-col overflow-y-auto'
            data-projection-id={11}
            style={{ transform: 'none', opacity: 1 }}
          >
            <div className='absolute inset-x-0 top-0 z-50'>
              <div className='topbar drag fixed top-0 z-50 mx-auto flex w-full flex-col bg-palette-0'>
                <div className='custom-border flex h-14 shrink-0 border-b-[0.5px] bg-transparent md:px-4 md:h-16'>
                  <button
                    type='button'
                    onClick={handleDrawerOpen}
                    className='custom-border pl-4 text-palette-900 focus:outline-none md:hidden'
                  >
                    <span className='sr-only'>Open sidebar</span>

                    <OPENSLIDERIcon />
                  </button>
                  <div className='flex flex-1 items-center justify-between px-4 md:px-0'>
                    <div className='flex w-full items-center'>
                      <span className='w-full text-lg font-medium lowercase text-palette-800 select-none'>
                        <AnimatePresence>
                          <motion.div
                            key={path}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {name.endsWith('.md') ? name.slice(0, -3) : name}
                          </motion.div>
                        </AnimatePresence>
                      </span>
                      <div className='flex justify-end space-x-5'>
                        <button
                          className='focus:outline-none'
                          onClick={(e) => {
                            console.log('clicked')
                            insert ? handleStartReading() : handleStopReading()
                            setInsert(!insert)
                          }}
                        >
                          <div className='h-[22px] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500'>
                            <MARKDOWNToggler />
                          </div>
                        </button>
                        <button
                          className='focus:outline-none'
                          onClick={(e) => {
                            e.preventDefault()
                            ipcRenderer.send('show-context-menu', isVim)
                          }}
                        >
                          <STACKIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='no-scrollbar grow pt-[3.5rem] md:pt-[4rem]'>
              <div className='virtual-list h-full markdown-content'>
                <div
                  className='
                flex h-[calc(100vh-170px)] w-full flex-col 
                '
                >
                  {insert ? (
                    <div className='' style={{ padding: '40px' }}>
                      <div>
                        <CodeMirror
                          ref={refs}
                          value={value}
                          height='100%'
                          width='100%'
                          autoFocus={true}
                          theme={isDarkMode ? githubDark : basicLight}
                          placeholder='Start your best ideas here...'
                          indentWithTab={true}
                          extensions={
                            isVim ? [...EXTENSIONS, vim()] : EXTENSIONS
                          }
                          onChange={codeMirrorOnChangeHandler}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence>
                        <div ref={containerRef} onScroll={handleScroll}>
                          <motion.div
                            key={path}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            style={{ paddingTop: '1em' }}
                            id='content'
                          >
                            <div ref={contentRef} style={{ padding: '40px' }}>
                              <div>
                                <div
                                  id='previewArea'
                                  dangerouslySetInnerHTML={
                                    resolvedMarkdown.document
                                  }
                                />
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </AnimatePresence>
                    </>
                  )}
                  {Footer(footerProps)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {CommandMenu}
    </div>
  )
}
