import { EditorState, Extension, Range, StateField } from '@codemirror/state'
import { Decoration, EditorView, WidgetType } from '@codemirror/view'
import { getMarkdown } from '../mdParser'

class HtmlWidget extends WidgetType {
  readonly content

  constructor({ content }) {
    super()
    this.content = content
  }

  eq(other: HtmlWidget) {
    return other.content === this.content
  }

  toDOM() {
    const wrapper = document.createElement('span')
    wrapper.innerHTML = this.content
    return wrapper
  }
}

const htmlDecoration = (content: string) =>
  Decoration.replace({
    widget: new HtmlWidget({ content }),
    side: -1,
    block: false
  })

const htmlRegex = /<[^>]+>/g

const decorator = (state: EditorState) => {
  const widgets: Range<Decoration>[] = []
  const regex = new RegExp(htmlRegex)
  let match

  while ((match = regex.exec(state.doc.sliceString(0))) !== null) {
    const from = match.index
    const to = from + match[0].length
    widgets.push(htmlDecoration(match[0]).range(from, to))
  }

  return Decoration.set(widgets)
}

export const htmlTag = (): Extension => {
  return StateField.define({
    create(state) {
      return decorator(state)
    },
    update(value, transaction) {
      if (transaction.docChanged) {
        return decorator(transaction.state)
      }
      return value.map(transaction.changes)
    },
    provide: (f) => EditorView.decorations.from(f)
  })
}

const latexRegex = /(\$\$[^\$]+\$\$|\$\$\$\$[^\$]+\$\$\$\$|\$[^$]+\$)/g

const latexDecoration = (content: string) => {
  const delimiter = content.match(/^(\${1,4})/)[0]
  const isInline = delimiter.length === 1 || delimiter.length === 2
  const processedContent = isInline
    ? addInlineClassToInlineLatex(getMarkdown(content).plainHTML)
    : getMarkdown(content).plainHTML
  return Decoration.replace({
    widget: new HtmlWidget({ content: processedContent }),
    side: 1,
    block: !isInline
  })
}

function addInlineClassToInlineLatex(htmlString) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString

  const firstTag = tempDiv.querySelector('*')

  if (firstTag) {
    firstTag.classList.add('inline')
  }

  return tempDiv.innerHTML
}

const decorators = (state: EditorState) => {
  const widgets: Range<Decoration>[] = []
  const regex = new RegExp(latexRegex)
  let match

  while ((match = regex.exec(state.doc.sliceString(0))) !== null) {
    const from = match.index
    const to = from + match[0].length
    widgets.push(latexDecoration(match[0]).range(from, to))
  }

  return Decoration.set(widgets)
}

export const latexTag = (): Extension => {
  return StateField.define({
    create(state) {
      return decorators(state)
    },
    update(value, transaction) {
      if (transaction.docChanged) {
        return decorators(transaction.state)
      }
      return value.map(transaction.changes)
    },
    provide: (f) => EditorView.decorations.from(f)
  })
}
