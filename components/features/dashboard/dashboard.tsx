"use client"

import type { Folder, Note } from "@/types/dashboard"
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

  const [sidebarPosition, setSidebarPosition] = useState<"left" | "right">(
    "left"
  )

  const toggleSidebarPosition = () => {
    setSidebarPosition((prev) => (prev === "left" ? "right" : "left"))
  }

  const sidebarPanel = (
    <Panel
      defaultSize={20}
      minSize={15}
      maxSize={30}
      className="border-r border-border/50 bg-card/50"
    >
      <FileExplorer
        notes={notes}
        folders={folders}
        selectedNote={selectedNote}
        sidebarPosition={sidebarPosition}
        onSelectNoteAction={setSelectedNote}
        setNotesAction={setNotes}
        setFoldersAction={setFolders}
        onToggleSidebarPositionAction={toggleSidebarPosition}
      />
    </Panel>
  )

  const editorPanel = (
    <Panel defaultSize={80}>
      <NoteEditor
        key={selectedNote?.id}
        note={selectedNote}
        setNotesAction={setNotes}
      />
    </Panel>
  )

  return (
    <PanelGroup
      direction="horizontal"
      className="h-full max-h-[calc(100vh-56px)]"
      key={sidebarPosition}
    >
      {sidebarPosition === "left" ? (
        <>
          {sidebarPanel}
          <PanelResizeHandle className="w-1 bg-border/50 transition-colors hover:bg-primary/50" />
          {editorPanel}
        </>
      ) : (
        <>
          {editorPanel}
          <PanelResizeHandle className="w-1 bg-border/50 transition-colors hover:bg-primary/50" />
          {sidebarPanel}
        </>
      )}
    </PanelGroup>
  )
}
