import React from 'react'

export type NavStack = {
  notes: Array<string>
  index: number
}

export const stashToRouter = (note: string, stack: NavStack) => {
  //   const [stacky, setStack] = React.useState<NavStack>({ notes: [], index: -1 })

  let newNotes: string[]
  console.log('called with inititial stack', stack, 'and note', note)
  if (stack?.notes) {
    let { notes } = stack
    newNotes = notes.slice(0, stack.index + 1).filter((note) => note !== note)
  } else {
    newNotes = []
    newNotes.push(note)
  }
  stack = {
    notes: newNotes,
    index: stack.index + 1
  }
  return {
    notes: newNotes,
    index: stack.index + 1
  }
}

const reversible = (stack: NavStack) => {
  const { index } = stack
  return index > 0
}

const canGoForward = (stack: NavStack) => {
  const { index, notes } = stack
  return index < notes.length - 1
}

const goBack = (stack: NavStack) => {
  let { index } = stack
  if (reversible(stack)) {
    index++
    return stack
  } else {
    return null
  }
}

const goForward = (stack: NavStack) => {
  let { index } = stack
  if (canGoForward(stack)) {
    index++
    return stack
  } else {
    return null
  }
}

export const RouteInitializer = (): NavStack => {
  return {
    notes: [],
    index: -1
  }
}
