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
import fs from 'fs-extra'
import mime from 'mime'

interface ImageWidgetParams {
  url: string
}

class ImageWidget extends WidgetType {
  readonly url

  constructor({ url }: ImageWidgetParams) {
    super()

    this.url = url
  }

  eq(imageWidget: ImageWidget) {
    return imageWidget.url === this.url
  }

  toDOM() {
    const container = document.createElement('div')
    const backdrop = container.appendChild(document.createElement('div'))
    const figure = backdrop.appendChild(document.createElement('figure'))
    const image = figure.appendChild(document.createElement('img'))

    container.setAttribute('aria-hidden', 'true')
    image.className = 'cm-image-img'
    image.src = formatImageUrl(this.url)
    return container
  }
}

function formatImageUrl(url: string): string {
  if (!url.startsWith('/')) {
    return url
  } else {
    if (fs.existsSync(url)) {
      const fileContents = fs.readFileSync(url)
      return `data:${mime.getType(url)};base64,${fileContents.toString(
        'base64'
      )}`
    }
  }

  return url
}

export const images = (): Extension => {
  const imageRegex = /!\[.*?\]\((?<url>.*?)\)/

  const imageDecoration = (imageWidgetParams: ImageWidgetParams) =>
    Decoration.replace({
      widget: new ImageWidget(imageWidgetParams),
      side: -1,
      block: true
    })

  const decorata = (state: EditorState) => {
    const widgets: Range<Decoration>[] = []

    syntaxTree(state).iterate({
      enter: ({ type, from, to }) => {
        if (type.name === 'Image') {
          const result = imageRegex.exec(state.doc.sliceString(from, to))

          if (result && result.groups && result.groups.url) {
            widgets.push(
              imageDecoration({ url: result.groups.url }).range(
                state.doc.lineAt(from).from,
                state.doc.lineAt(to).to
              )
            )
          }
        }
      }
    })

    return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
  }

  const imagesTheme = EditorView.baseTheme({
    '.cm-image-backdrop': {
      backgroundColor: 'inherit'
    }
  })

  const imagesField = StateField.define<DecorationSet>({
    create(state) {
      return decorata(state)
    },
    update(images, transaction) {
      if (transaction.docChanged) {
        return decorata(transaction.state)
      }

      return images.map(transaction.changes)
    },
    provide(field) {
      return EditorView.decorations.from(field)
    }
  })

  return [imagesTheme, imagesField]
}
