"use client"

import { updateNote, type Note } from "@/app/dashboard/actions"
import { useDebounce } from "@/hooks/use-debounce"
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { syntaxHighlighting } from "@codemirror/language"
import { languages } from "@codemirror/language-data"
import { keymap } from "@codemirror/view"
import { GFM } from "@lezer/markdown"
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { darkTheme, lightTheme, markdownHighlighting } from "./editor-theme"

type NoteEditorProps = {
  note: Note | null
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
}

export function NoteEditor({ note, setNotesAction }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || "")
  const { resolvedTheme } = useTheme()

  const debouncedUpdate = useDebounce((...args: unknown[]) => {
    const newContent = args[0] as string
    if (note) {
      updateNote(note.id, { content: newContent }).then((updatedNote) => {
        if (updatedNote) {
          setNotesAction((prev) =>
            prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
          )
        }
      })
    }
  }, 1000)

  const onChange = useCallback(
    (value: string) => {
      setContent(value)
      debouncedUpdate(value)
    },
    [debouncedUpdate]
  )

  useEffect(() => {
    setContent(note?.content || "")
  }, [note])

  const editorExtensions = [
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      extensions: [GFM],
    }),
    syntaxHighlighting(markdownHighlighting),
    keymap.of([...defaultKeymap, indentWithTab]),
  ]

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a note to start editing
      </div>
    )
  }

  if (note.is_folder) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        This is a folder. Select a note to edit.
      </div>
    )
  }

  return (
    <CodeMirror
      value={content}
      onChange={onChange}
      extensions={editorExtensions}
      theme={resolvedTheme === "dark" ? darkTheme : lightTheme}
      height="100%"
      className="h-full"
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        autocompletion: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
    />
  )
}
