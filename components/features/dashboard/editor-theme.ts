import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { Range, type Extension } from "@codemirror/state"
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view"
import { tags } from "@lezer/highlight"

// Base theme settings
const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
  },
  ".cm-content": {
    caretColor: "hsl(var(--primary))",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "hsl(var(--primary))",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "hsl(var(--primary) / 0.2)",
  },
  ".cm-gutters": {
    border: "none",
  },
  // WYSIWYG styles
  ".cm-line.cm-heading-1": { fontSize: "1.6em", fontWeight: "bold" },
  ".cm-line.cm-heading-2": { fontSize: "1.4em", fontWeight: "bold" },
  ".cm-line.cm-heading-3": { fontSize: "1.2em", fontWeight: "bold" },
})

// Light and Dark theme definitions
export const lightTheme = EditorView.theme(
  {
    "&": {
      color: "hsl(var(--foreground))",
      backgroundColor: "hsl(var(--background))",
    },
    ".cm-gutters": {
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--muted-foreground))",
    },
  },
  { dark: false }
)

export const darkTheme = EditorView.theme(
  {
    "&": {
      color: "hsl(var(--foreground))",
      backgroundColor: "hsl(var(--background))",
    },
    ".cm-gutters": {
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--muted-foreground))",
    },
  },
  { dark: true }
)

export const markdownHighlighting = HighlightStyle.define([
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "hsl(var(--primary))", textDecoration: "underline" },
  {
    tag: tags.quote,
    borderLeft: "3px solid hsl(var(--border))",
    paddingLeft: "8px",
    fontStyle: "italic",
    color: "hsl(var(--muted-foreground))",
  },
  {
    tag: tags.monospace,
    backgroundColor: "hsl(var(--muted))",
    color: "hsl(var(--muted-foreground))",
    padding: "0.2em 0.4em",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  {
    tag: tags.contentSeparator,
    color: "hsl(var(--border))",
    fontWeight: "bold",
  },
  { tag: tags.keyword, color: "hsl(var(--chart-1))", fontWeight: "bold" },
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.propertyName,
      tags.macroName,
    ],
    color: "hsl(var(--destructive))",
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: "hsl(var(--chart-2))",
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: "hsl(var(--chart-3))",
  },
  {
    tag: [tags.definition(tags.name), tags.separator],
    color: "hsl(var(--foreground))",
  },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: "hsl(var(--chart-4))",
  },
  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string),
    ],
    color: "hsl(var(--foreground))",
  },
  { tag: [tags.meta, tags.comment], color: "hsl(var(--muted-foreground))" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "hsl(var(--primary))", textDecoration: "underline" },
  { tag: tags.invalid, color: "hsl(var(--destructive))" },
  {
    tag: [
      tags.string,
      tags.inserted,
      tags.attributeValue,
      tags.processingInstruction,
    ],
    color: "hsl(var(--chart-5))",
  },
])

// WYSIWYG-like extension to hide markdown syntax
const hideMarkdownSyntax = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view)
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder: Range<Decoration>[] = []
      const { state } = view
      const cursorPos = state.selection.main.head

      for (const { from, to } of view.visibleRanges) {
        let lineFrom = -1
        for (let pos = from; pos <= to; ) {
          const line = state.doc.lineAt(pos)
          if (line.from > lineFrom) {
            const isLineActive = cursorPos >= line.from && cursorPos <= line.to

            if (!isLineActive) {
              const headingMatch = line.text.match(/^(#{1,3})\s/)
              if (headingMatch) {
                const level = headingMatch[1].length
                builder.push(
                  Decoration.line({
                    class: `cm-heading-${level}`,
                  }).range(line.from)
                )
                builder.push(
                  Decoration.replace({}).range(
                    line.from,
                    line.from + headingMatch[0].length
                  )
                )
              }
            }
          }
          lineFrom = line.from
          pos = line.to + 1
        }
      }

      builder.sort((a, b) => {
        if (a.from !== b.from) {
          return a.from - b.from
        }
        const aIsBlock = !!a.value.spec.block
        const bIsBlock = !!b.value.spec.block
        if (aIsBlock !== bIsBlock) {
          return aIsBlock ? -1 : 1
        }
        return 0
      })

      return Decoration.set(builder)
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)

export function getEditorExtensions(settings: {
  wysiwyg: boolean
}): Extension[] {
  const extensions = [baseTheme, syntaxHighlighting(markdownHighlighting)]

  if (settings.wysiwyg) {
    extensions.push(hideMarkdownSyntax)
  }

  return extensions
}
