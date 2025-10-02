"use client"

import { updateNote, type Note } from "@/app/dashboard/actions"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Textarea } from "../../ui/textarea"
import { Toolbar } from "./toolbar"

type NoteEditorProps = {
  note: Note | null
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
}

export function NoteEditor({ note, setNotesAction }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || "")

  useEffect(() => {
    setContent(note?.content || "")
  }, [note])

  const handleContentChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newContent = e.target.value
    setContent(newContent)

    if (note) {
      const updatedNote = await updateNote(note.id, { content: newContent })
      if (updatedNote) {
        setNotesAction((prev) =>
          prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
        )
      }
    }
  }

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
    <div className="flex h-full flex-col">
      <Toolbar />
      <div className="grid flex-1 grid-cols-2 gap-4 p-4">
        <Textarea
          value={content}
          onChange={handleContentChange}
          className="h-full resize-none"
          placeholder="Start writing your note here..."
        />
        <div className="prose dark:prose-invert rounded-md border p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
