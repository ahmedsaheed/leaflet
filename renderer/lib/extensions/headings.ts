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
const headingRegex = /^(#{1,3})\s(?![#])\S.*$/gm

const headingDecorations = (state: EditorState) => {
  const decorators: Range<Decoration>[] = []
  let match

  while ((match = headingRegex.exec(state.doc.toString())) !== null) {
    const from = state.doc.lineAt(match.index).from
    const to = from + match[1]?.length // Only target the '#' characters
    const level = match[1]?.length

    decorators.push(
      Decoration.replace({
        widget: new SpaceWidget(level),
        side: -1
      }).range(from, to)
    )
  }

  return decorators.length > 0 ? RangeSet.of(decorators) : Decoration.none
}

const headingDecorationsField = StateField.define<DecorationSet>({
  create: (state) => headingDecorations(state),
  update(decorations, tr) {
    return tr.docChanged ? headingDecorations(tr.state) : decorations
  },
  provide: (f) => EditorView.decorations.from(f)
})

export const headings = (): Extension => {
  return [headingDecorationsField]
}

class SpaceWidget extends WidgetType {
  constructor(private level: number) {
    super()
  }

  eq(other: SpaceWidget) {
    return other.level === this.level
  }

  toDOM() {
    const span = document.createElement('span')
    // span.textContent = '\uFEFF'
    span.className = `cm-heading-space cm-heading-${this.level}`
    return span
  }
}
