"use client"

import {
  createNote,
  deleteNote,
  updateNote,
  type Note,
} from "@/app/dashboard/actions"
import { Edit, File, Folder, FolderPlus, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"

type FileExplorerProps = {
  notes: Note[]
  selectedNote: Note | null
  onSelectAction: (note: Note | null) => void
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
}

export function FileExplorer({
  notes,
  selectedNote,
  onSelectAction,
  setNotesAction,
}: FileExplorerProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  const handleCreate = async (isFolder: boolean, parentId: string | null) => {
    const newNote = await createNote({
      title: isFolder ? "New Folder" : "New Note",
      content: "",
      is_folder: isFolder,
      parent_id: parentId,
    })
    if (newNote) {
      setNotesAction((prev) => [...prev, newNote])
    }
  }

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId)
    setNotesAction((prev) => prev.filter((n) => n.id !== noteId))
    if (selectedNote?.id === noteId) {
      onSelectAction(null)
    }
  }

  const handleRename = async (note: Note) => {
    setEditingNoteId(note.id)
    setNewName(note.title)
  }

  const handleSaveRename = async (note: Note) => {
    if (newName.trim() === "") return
    const updatedNote = await updateNote(note.id, { title: newName })
    if (updatedNote) {
      setNotesAction((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
      )
    }
    setEditingNoteId(null)
  }

  const renderNotes = (parentId: string | null) => {
    return notes
      .filter((note) => note.parent_id === parentId)
      .map((note) => (
        <div key={note.id} className="ml-4">
          <div
            className={`group flex cursor-pointer items-center justify-between rounded p-1 ${selectedNote?.id === note.id ? "bg-accent" : ""}`}
            onClick={() => onSelectAction(note)}
          >
            {editingNoteId === note.id ? (
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleSaveRename(note)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename(note)}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                {note.is_folder ? <Folder size={16} /> : <File size={16} />}
                <span>{note.title}</span>
              </div>
            )}
            <div className="hidden group-hover:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRename(note)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(note.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
          {note.is_folder && renderNotes(note.id)}
        </div>
      ))
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold">File Explorer</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreate(false, null)}
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreate(true, null)}
          >
            <FolderPlus size={16} />
          </Button>
        </div>
      </div>
      {renderNotes(null)}
    </div>
  )
}
