import hljs from 'highlight.js'
import todo from 'markdown-it-task-lists'
import yaml from 'yaml'
import metadata_block from 'markdown-it-metadata-block'
import fs from 'fs-extra'
import mime from 'mime'
import { escapeHtml, unescapeAll } from 'markdown-it/lib/common/utils'

export type Metadata = {
  title: string
  date: string
  tags: string[]
  material: {}
}

/**
 * @param {string} value
 * @returns {string} html
 * @returns {object} metadata
 * @description
 * This function is used to convert markdown to html
 */

export const getMarkdown = (value: string) => {
  const meta = {} as Metadata
  const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string) {
      if (lang === 'mermaid') {
        return str
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value
        } catch (err) {
          console.log(err)
        }
      }

      try {
        return hljs.highlightAuto(str).value
      } catch (err) {
        console.log(err)
      }
    }
  })
  const defaultImageRender = md.renderer.rules.image

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const srcIndex = token.attrIndex('src')
    const src = token.attrs[srcIndex][1]
    console.log(src.replace(/\s/g, "\\ "))
    if (fs.existsSync(src)) {
      const fileContents = fs.readFileSync(src)

      // Encode the file contents as a data URL
      const dataUrl = `data:${mime.getType(src)};base64,${fileContents.toString(
        'base64'
      )}`
      token.attrs[srcIndex][1] = dataUrl
      return defaultImageRender(tokens, idx, options, env, self)
    } else {
      return defaultImageRender(tokens, idx, options, env, self)
    }
  }

  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      langAttrs = '',
      highlighted,
      i,
      arr,
      tmpAttrs,
      tmpToken

    if (info) {
      arr = info.split(/(\s+)/g)
      langName = arr[0]
      langAttrs = arr.slice(2).join('')
    }

    if (langName === '') {
      return (
        '<pre><code' +
        slf.renderAttrs(token) +
        '>' +
        escapeHtml(token.content) +
        '</code></pre>\n'
      )
    }

    if (options.highlight) {
      highlighted =
        options.highlight(token.content, langName, langAttrs) ||
        escapeHtml(token.content)
    } else {
      highlighted = escapeHtml(token.content)
    }

    if (highlighted.indexOf('<pre') === 0) {
      return highlighted + '\n'
    }

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (info) {
      i = token.attrIndex('class')
      tmpAttrs = token.attrs ? token.attrs.slice() : []

      if (i < 0) {
        tmpAttrs.push(['class', options.langPrefix + langName])
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice()
        tmpAttrs[i][1] += ' ' + options.langPrefix + langName
      }

      // Fake token just to render attributes
      tmpToken = {
        attrs: tmpAttrs
      }

      return (
        '<pre><code' +
        slf.renderAttrs(tmpToken) +
        '>' +
        highlighted +
        '</code></pre>\n'
      )
    }

    return (
      '<pre><code' +
      slf.renderAttrs(token) +
      '>' +
      highlighted +
      '</code></pre>\n'
    )
  }

  require('markdown-it-pandoc')(md)
  md.use(metadata_block, {
    parseMetadata: yaml.parse,
    meta
  })

  md.use(todo, { enabled: true })
  const documents = getMarkdownWithMermaid(value)
  try {
    let result = md.render(documents)

    return {
      document: { __html: result },
      metadata: meta
    }
  } catch (err) {
    return { __html: "Couldn't render page, Something not right!" }
  }
}

const getUniqueId = () => {
  let counter = 0
  return `mermaid-diagram-${counter + 1}`
}

export const getMarkdownWithMermaid = (markdown: string): string => {
  const parts = markdown.split(/```mermaid([\s\S]*?)```/)
  const ids: string[] = []
  const svgCodes: string[] = []
  // Process each mermaid code block
  for (let i = 1; i < parts.length; i += 2) {
    const mermaidCode = parts[i]
    const mermaidId = getUniqueId()
    ids.push(mermaidId)
    try {
      // mermaid.render(mermaidId, mermaidCode, (svgCode: string) => {
      //   svgCodes.push(svgCode);
      // });
    } catch (e) {
      console.log(e)
    }
  }

  // Build HTML string by replacing the mermaid code blocks with the rendered SVG code
  if (svgCodes.length > 0 == false) {
    return markdown
  } else {
    let html = parts[0]
    for (let i = 1; i < parts.length; i += 2) {
      html += svgCodes[(i - 1) / 2] + parts[i + 1]
    }
    return html
  }
}
