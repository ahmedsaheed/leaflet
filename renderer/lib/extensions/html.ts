import { syntaxTree } from '@codemirror/language'
import {
  EditorState,
  Extension,
  Range,
  RangeSet,
  StateField
} from '@codemirror/state'
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType
} from '@codemirror/view'

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
    const wrapper = document.createElement('div')
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
