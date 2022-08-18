
import { unified } from "unified"
import parse from "remark-parse"
import math from "remark-math"
import remark2rehype from "remark-rehype"
import katex from "rehype-katex"
import stringify from "rehype-stringify"
import highlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

export async function markdownToHtml(markdown: string) {
    const result = await unified()
        .use(parse)
        .use(math)
        .use(remark2rehype, { allowDangerousHtml: true })
        .use(remarkGfm)
        .use(rehypeRaw)
        .use(katex)
        .use(stringify)
        .use(highlight)
        .process(markdown)

    return result.toString()
}
