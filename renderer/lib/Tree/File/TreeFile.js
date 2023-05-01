import React, { useRef, useState, useEffect } from 'react'
import { StyledFile } from './TreeFile.style'
import { useTreeContext } from '../state/TreeContext'
import { ActionsWrapper, StyledName, StyledNameWrapper } from '../Tree.style.js'
import { PlaceholderInput } from '../TreePlaceholderInput'
import { FILE } from '../state/constants'
import { ipcRenderer, IpcRenderer } from 'electron'
import { clientStore } from '../../storage'

const File = ({ name, id, node }) => {
  const { dispatch, isImparative, onNodeClick } = useTreeContext()
  const [isEditing, setEditing] = useState(false)
  const ext = useRef('')

  let splitted = name?.split('.')
  ext.current = splitted[splitted.length - 1]

  const toggleEditing = () => setEditing(!isEditing)
  const commitEditing = (name) => {
    dispatch({ type: FILE.EDIT, payload: { id, name } })
    setEditing(false)
  }
  const commitDelete = () => {
    dispatch({ type: FILE.DELETE, payload: { id } })
  }
  const handleNodeClick = React.useCallback(
    (e) => {
      e.stopPropagation()

      if (e.type === 'click') {
        onNodeClick({ node })
        localStorage.getItem('currPath')
      } else if (e.type === 'contextmenu') {
        ipcRenderer.send('file-context-menu')
        console.log('Right click')
      }
    },
    [node]
  )
  const handleCancel = () => {
    setEditing(false)
  }
  const cleanName = (name) => {
    return name.endsWith('.md')
      ? name.substring(0, name.length - 3).toLowerCase()
      : name.toLowerCase()
  }

  return (
    <StyledFile
      onClick={handleNodeClick}
      onContextMenu={handleNodeClick}
      className='tree__file'
    >
      {isEditing ? (
        <PlaceholderInput
          type='file'
          style={{ paddingLeft: 0 }}
          defaultValue={cleanName(name)}
          onSubmit={commitEditing}
          onCancel={handleCancel}
        />
      ) : (
        <ActionsWrapper>
          <StyledNameWrapper>
            <StyledName
              className={
                node.path == clientStore.get('currentFilePath')
                  ? 'isActive'
                  : ''
              }
            >
              &nbsp;&nbsp;{cleanName(name)}
            </StyledName>
          </StyledNameWrapper>
          {isImparative && (
            <div className='actions'>
              {/*<AiOutlineEdit onClick={toggleEditing} />
              <AiOutlineDelete onClick={commitDelete} />
            */}
            </div>
          )}
        </ActionsWrapper>
      )}
    </StyledFile>
  )
}

export { File }
