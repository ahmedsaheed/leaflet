import { EditorView } from '@codemirror/view'
import { ReactNode } from 'react'
export const QUICKBUTTONS = (
  view: EditorView,
  title: string,
  icon: string | ReactNode,
  onclick: () => void
) => {
  return (
    <button
      disabled={!view}
      className='quickAction cursor-pointer'
      aria-label={title}
      title={title}
      onClick={onclick}
      style={{
        border: '1px solid transparent',
        padding: '1px',
        marginRight: '1em',
        cursor: 'default',
        borderRadius: '4px'
      }}
    >
      <div>{icon}</div>
    </button>
  )
}
