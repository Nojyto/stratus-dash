"use client"

import type { Note } from "@/app/dashboard/actions"
import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { FileExplorer } from "./file-explorer"
import { NoteEditor } from "./note-editor"

export function Dashboard({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={20}>
        <FileExplorer
          notes={notes}
          selectedNote={selectedNote}
          onSelectAction={setSelectedNote}
          setNotesAction={setNotes}
        />
      </Panel>
      <PanelResizeHandle className="w-2 bg-border" />
      <Panel defaultSize={80}>
        <NoteEditor note={selectedNote} setNotesAction={setNotes} />
      </Panel>
    </PanelGroup>
  )
}
