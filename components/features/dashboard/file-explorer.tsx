"use client"

import {
  createNote,
  deleteNote,
  updateNote,
  type Note,
} from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Edit,
  File,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
} from "lucide-react"
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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const handleCreate = async (isFolder: boolean) => {
    let parentId = null
    if (selectedNote) {
      parentId = selectedNote.is_folder
        ? selectedNote.id
        : selectedNote.parent_id
    }

    const newNote = await createNote({
      title: isFolder ? "New Folder" : "New Note",
      content: "",
      is_folder: isFolder,
      parent_id: parentId,
    })

    if (newNote) {
      setNotesAction((prev) => [...prev, newNote])
      if (parentId) {
        setExpandedFolders((prev) => new Set(prev).add(parentId!))
      }
    }
  }

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId)
    setNotesAction((prev) => prev.filter((n) => n.id !== noteId))
    if (selectedNote?.id === noteId) {
      onSelectAction(null)
    }
  }

  const handleRename = (note: Note) => {
    setEditingNoteId(note.id)
    setNewName(note.title)
  }

  const handleSaveRename = async (noteId: string) => {
    if (newName.trim() === "") return
    const updatedNote = await updateNote(noteId, { title: newName })
    if (updatedNote) {
      setNotesAction((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
      )
    }
    setEditingNoteId(null)
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderNotes = (parentId: string | null) => {
    return notes
      .filter((note) => note.parent_id === parentId)
      .sort((a, b) => (a.is_folder === b.is_folder ? 0 : a.is_folder ? -1 : 1))
      .map((note) => {
        const isExpanded = expandedFolders.has(note.id)
        return (
          <div key={note.id} className="ml-4">
            <div
              className={cn(
                "group relative flex cursor-pointer items-center justify-between rounded p-1",
                selectedNote?.id === note.id && "bg-accent"
              )}
              onClick={() => onSelectAction(note)}
            >
              {editingNoteId === note.id ? (
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleSaveRename(note.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSaveRename(note.id)
                  }
                  autoFocus
                  className="h-7"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {note.is_folder && (
                    <ChevronRight
                      size={16}
                      className={cn(
                        "transition-transform",
                        isExpanded && "rotate-90"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFolder(note.id)
                      }}
                    />
                  )}
                  {note.is_folder ? (
                    <Folder size={16} />
                  ) : (
                    <File size={16} className="ml-4" />
                  )}
                  <span>{note.title}</span>
                </div>
              )}
              <div className="absolute right-0 top-1/2 flex -translate-y-1/2 bg-background opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRename(note)
                  }}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(note.id)
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            {note.is_folder && isExpanded && renderNotes(note.id)}
          </div>
        )
      })
  }

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold">Explorer</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreate(false)}
            title="New Note"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreate(true)}
            title="New Folder"
          >
            <FolderPlus size={16} />
          </Button>
        </div>
      </div>
      {renderNotes(null)}
    </div>
  )
}
