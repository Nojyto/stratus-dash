"use client"

import type { Folder, Note } from "@/app/dashboard/actions"
import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { FileExplorer } from "./file-explorer"
import { NoteEditor } from "./note-editor"

type DashboardProps = {
  initialNotes: Note[]
  initialFolders: Folder[]
}

export function Dashboard({ initialNotes, initialFolders }: DashboardProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [folders, setFolders] = useState(initialFolders)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")

  return (
    <PanelGroup
      direction={layout}
      className="h-full max-h-[calc(100vh-80px)] pl-2"
    >
      <Panel defaultSize={20} minSize={15} maxSize={30}>
        <FileExplorer
          notes={notes}
          folders={folders}
          selectedNote={selectedNote}
          onSelectNoteAction={setSelectedNote}
          setNotesAction={setNotes}
          setFoldersAction={setFolders}
          onLayoutChangeAction={setLayout}
        />
      </Panel>
      <PanelResizeHandle className="h-screen w-2 bg-border" />
      <Panel defaultSize={80}>
        <NoteEditor
          key={selectedNote?.id}
          note={selectedNote}
          setNotesAction={setNotes}
        />
      </Panel>
    </PanelGroup>
  )
}
