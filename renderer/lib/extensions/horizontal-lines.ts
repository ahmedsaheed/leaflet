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
class HorizontalLineWidget extends WidgetType {
  toDOM() {
    const container = document.createElement('hr')
    container.className = 'cm-horizontal-line'
    return container
  }
}

const horizontalLineRegex = /^(\*{3,}|-{3,}|_{3,})$/gm

const decorate = (state: EditorState) => {
  const widgets: Range<Decoration>[] = []
  let match

  while ((match = horizontalLineRegex.exec(state.doc.toString())) !== null) {
    const from = state.doc.lineAt(match.index).from
    widgets.push(
      Decoration.replace({ widget: new HorizontalLineWidget() }).range(
        from,
        from + match[0].length
      )
    )
  }

  return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
}

const decorationsField = StateField.define<DecorationSet>({
  create: (state) => decorate(state),
  update(decorations, tr) {
    return tr.docChanged ? decorate(tr.state) : decorations
  },
  provide: (f) => EditorView.decorations.from(f)
})

export const horizontalLines = (): Extension => {
  return [decorationsField]
}

class TableWidget extends WidgetType {
  toDOM() {
    const table = document.createElement('table')
    table.className = 'cm-table'
    const tbody = document.createElement('tbody')

    // Add table rows and cells as necessary
    const row1 = document.createElement('tr')
    const row2 = document.createElement('tr')
    const cell11 = document.createElement('td')
    const cell12 = document.createElement('td')
    const cell21 = document.createElement('td')
    const cell22 = document.createElement('td')

    // Add content to table cells as necessary
    cell11.textContent = 'Header 1'
    cell12.textContent = 'Header 2'
    cell21.textContent = 'Row 1, Cell 1'
    cell22.textContent = 'Row 1, Cell 2'

    row1.appendChild(cell11)
    row1.appendChild(cell12)
    row2.appendChild(cell21)
    row2.appendChild(cell22)

    tbody.appendChild(row1)
    tbody.appendChild(row2)

    table.appendChild(tbody)

    return table
  }
}

const tableRegex = /^((\|.*\|)+)$/gm

const tableCellRegex = /(\|[^|]+)+\|/g

const decorates = (state: EditorState) => {
  const decorations: Range<Decoration>[] = []
  let match
  while ((match = tableRegex.exec(state.doc.toString())) !== null) {
    const tableStart = state.doc.lineAt(match.index).from
    const tableEnd = tableStart + match[0].length

    for (let pos = tableStart; pos < tableEnd; ) {
      const line = state.doc.lineAt(pos)
      let cellMatch
      const lineStart = line.from

      //   tableCellRegex.lastIndex = 0 // Reset the lastIndex property

      while ((cellMatch = tableCellRegex.exec(line.text)) !== null) {
        const from = lineStart + cellMatch.index
        const to = from + cellMatch[0].length
        decorations.push(
          Decoration.mark({ class: 'cm-table-cell' }).range(from, to)
        )
      }

      pos = line.to + 1
    }
  }

  return decorations.length > 0 ? RangeSet.of(decorations) : Decoration.none
}

// const decorates = (state: EditorState) => {
//   const widgets: Range<Decoration>[] = []
//   let match

//   while ((match = tableRegex.exec(state.doc.toString())) !== null) {
//     const from = state.doc.lineAt(match.index).from
//     const to = from + match[0].length

//     widgets.push(Decoration.widget({ widget: new TableWidget() }).range(from))
//     widgets.push(Decoration.replace({}).range(from, to))
//   }
//   return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
// }

const tableDecorationsField = StateField.define<DecorationSet>({
  create: (state) => decorates(state),
  update(decorations, tr) {
    return tr.docChanged ? decorates(tr.state) : decorations
  },
  provide: (f) => EditorView.decorations.from(f)
})

export const tables = (): Extension => {
  return [tableDecorationsField]
}

//----------------------------------------------- Headings.ts

