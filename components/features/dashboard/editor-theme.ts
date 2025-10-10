import { HighlightStyle } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { tags } from "@lezer/highlight"

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
})

export const lightTheme = [
  baseTheme,
  EditorView.theme({
    "&": {
      color: "hsl(var(--foreground))",
      backgroundColor: "hsl(var(--background))",
    },
    ".cm-gutters": {
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--muted-foreground))",
    },
  }),
]

export const darkTheme = [
  baseTheme,
  EditorView.theme(
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
  ),
]

export const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.6em", fontWeight: "bold" },
  { tag: tags.heading2, fontSize: "1.4em", fontWeight: "bold" },
  { tag: tags.heading3, fontSize: "1.2em", fontWeight: "bold" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "hsl(var(--primary))", textDecoration: "none" },
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
