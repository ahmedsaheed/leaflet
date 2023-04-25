import fs from 'fs-extra'
import React, { useState } from 'react'
import Tree from '../lib/Tree/Tree.js'
type Structure = { [key: string]: any }

function convertObject(obj: Structure): Array<{}> {
  const struct: Array<{}> = []
  for (let key in obj) {
    for (let i = 0; i < obj[key].length; i++) {
      let node = obj[key][i]
      if (node?.children) {
        if (node?.name !== 'undefined' && node?.name !== undefined) {
          struct.push({
            type: 'folder',
            name: node.name,
            files: convertObject(node)
          })
        }
      } else {
        if (node?.name !== 'undefined' && node?.name !== undefined) {
          struct.push({
            type: 'file',
            name: node.name,
            path: node.path
          })
        }
      }
    }
  }
  struct.sort((a, b) => {
    //@ts-ignore
    if (a.type === 'folder' && b.type === 'file') {
      return -1;
    //@ts-ignore
    } else if (a.type === 'file' && b.type === 'folder') {
      return 1;
    } else {
      return 0;
    }
  });
  return struct
}

export function FileTree({
  structures,
  onNodeClicked,
  path
}: {
  structures: Structure
  onNodeClicked: (path: string, name: string) => void
  path: string
}) {
  let [data, setData] = useState<Array<{}>>([])
  React.useEffect(() => {
    const incoming = convertObject({ structures })
    setData(incoming)
  }, [structures])
  const handleClick = (node) => {
    if (node.node.type === 'file') {
      let path = node.node?.path
      let name = node.node?.name
      const value = fs.readFileSync(path, 'utf8')
      onNodeClicked(path, name)
    }
    //Path is not updated
  }
  const handleUpdate = (state) => {
    localStorage.setItem(
      'tree',
      JSON.stringify(state, function (key, value) {
        if (key === 'parentNode' || key === 'id') {
          return null
        }
        return value
      })
    )
  }

  return (
    //@ts-ignore
    <Tree
      // children={null}
      data={data}
      onUpdate={handleUpdate}
      onNodeClick={(node) => {
        handleClick(node)
      }}
    />
  )
}
