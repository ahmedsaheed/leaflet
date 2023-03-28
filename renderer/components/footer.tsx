import { EditorView } from '@codemirror/view'
import { EditorUtils } from './editorutils'
import readingTime from 'reading-time'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
export type FooterProps = {
  insert: boolean
  vimToggler: () => void
  value: string
  cursor: string
  editorview: EditorView
}

export const Footer = (prop: FooterProps) => {
  const [showChild, setShowChild] = useState(false)
  function handleOnChange(e) {
    console.log(e.target.value)
  }
  return (
    <div
      className={`fixed inset-x-0 bottom-0 ButtomBar ${
        prop.insert ? 'insert-util-parent' : ''
      }`}
      onMouseEnter={() => (prop.insert ? setShowChild(true) : null)}
      onMouseLeave={() => (prop.insert ? setShowChild(false) : null)}
      style={{
        display: 'inline',
        userSelect: 'none',
        maxHeight: '10vh',
        marginTop: '20px',
        height: prop.insert ? '40px' : undefined
      }}
    >
      <>
        <div
          onMouseEnter={() => (prop.insert ? setShowChild(true) : null)}
          onMouseLeave={() => (prop.insert ? setShowChild(false) : null)}
          style={{
            float: 'left',
            paddingLeft: '10px',
            paddingTop: '5px',
            fontSize: '12px !important'
          }}
        >
          <div>
            {prop.insert ? (
              <AnimatePresence>
                {showChild && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className='insert-util'>
                      <select
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          outline: 'none',
                          cursor: 'pointer',
                          marginRight: '0.5em',
                          fontSize: '12px',
                          appearance: 'none'
                        }}
                        onChange={handleOnChange}
                      >
                        <option className='bgbgb' value='1'>
                          Heading 1{' '}
                        </option>
                        <option className='bgbgb' value='2'>
                          Heading 2
                        </option>
                        <option className='bgbgb' value='3'>
                          Heading 3
                        </option>
                      </select>

                      {EditorUtils(prop.editorview)}

                      <div
                        style={{
                          float: 'right',
                          display: 'inline'
                        }}
                      >
                        <select
                          style={{
                            float: 'right',
                            backgroundColor: 'transparent',
                            border: 'none',
                            appearance: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '12px !important'
                          }}
                        >
                          <option value='black'>{prop.cursor}</option>
                          <option value=''>
                            {prop.value.toString().split(' ').length} Words
                          </option>
                          <option value='dark'>
                            {prop.value.toString().length} Character
                          </option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <span style={{ display: 'inline' }}>
                <div className='py-2 flex items-center'>
                  <div style={{ display: 'inline', marginRight: '20px' }}></div>
                  <span>{`${prop.value.toString().split(' ').length} words  ${
                    prop.value.toString().length
                  } characters `}</span>
                  <div style={{ display: 'inline', marginRight: '30px' }}></div>
                  <span>{`${readingTime(prop.value).text}`}</span>
                </div>
              </span>
            )}
          </div>
        </div>
      </>
    </div>
  )
}
