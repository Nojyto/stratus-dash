"use client"

import {
  createFolder,
  createNote,
  deleteFolder,
  deleteNote,
  updateFolder,
  updateNote,
} from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Folder, Note } from "@/types/dashboard"
import {
  ChevronRight,
  Edit,
  File,
  Folder as FolderIcon,
  FolderPlus,
  PanelLeft,
  PanelRight,
  Plus,
  Trash2,
} from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type FileExplorerProps = {
  notes: Note[]
  folders: Folder[]
  selectedNote: Note | null
  onSelectNoteAction: (note: Note | null) => void
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
  setFoldersAction: React.Dispatch<React.SetStateAction<Folder[]>>
  onLayoutChangeAction: (layout: "horizontal" | "vertical") => void
}

type TreeItem = (Folder & { is_folder: true }) | (Note & { is_folder: false })

const MAX_FOLDER_DEPTH = 5

export function FileExplorer({
  notes,
  folders,
  selectedNote,
  onSelectNoteAction,
  setNotesAction,
  setFoldersAction,
  onLayoutChangeAction,
}: FileExplorerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const handleCreate = async (isFolder: boolean) => {
    let parentFolderId: string | null = null
    if (selectedNote?.folder_id) {
      parentFolderId = selectedNote.folder_id
    }

    if (isFolder) {
      const newFolder = await createFolder({
        name: "New Folder",
        parent_id: parentFolderId,
      })
      if (newFolder) {
        setFoldersAction((prev) => [...prev, newFolder])
        if (parentFolderId) {
          setExpandedFolders((prev) => new Set(prev).add(parentFolderId!))
        }
      }
    } else {
      const newNote = await createNote({
        title: "New Note",
        folder_id: parentFolderId,
      })
      if (newNote) {
        setNotesAction((prev) => [...prev, newNote])
        if (parentFolderId) {
          setExpandedFolders((prev) => new Set(prev).add(parentFolderId!))
        }
        onSelectNoteAction(newNote)
      }
    }
  }

  const handleDelete = async (item: TreeItem) => {
    if (item.is_folder) {
      await deleteFolder(item.id)
      setFoldersAction((prev) => prev.filter((f) => f.id !== item.id))
    } else {
      await deleteNote(item.id)
      setNotesAction((prev) => prev.filter((n) => n.id !== item.id))
    }

    if (selectedNote?.id === item.id) {
      onSelectNoteAction(null)
    }
  }

  const handleRename = (item: TreeItem) => {
    setEditingId(item.id)
    setNewName(item.is_folder ? item.name : item.title)
  }

  const handleSaveRename = async (item: TreeItem) => {
    if (newName.trim() === "") {
      setEditingId(null)
      return
    }

    if (item.is_folder) {
      const updated = await updateFolder(item.id, { name: newName })
      if (updated) {
        setFoldersAction((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f))
        )
      }
    } else {
      const updated = await updateNote(item.id, { title: newName })
      if (updated) {
        setNotesAction((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n))
        )
      }
    }
    setEditingId(null)
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
        const firstNoteInFolder = notes.find((n) => n.folder_id === folderId)
        if (firstNoteInFolder) {
          onSelectNoteAction(firstNoteInFolder)
        }
      }
      return newSet
    })
  }

  const renderTree = (
    parentId: string | null,
    depth: number
  ): JSX.Element[] => {
    if (depth > MAX_FOLDER_DEPTH) return []

    const childFolders: TreeItem[] = folders
      .filter((f) => f.parent_id === parentId)
      .map((f) => ({ ...f, is_folder: true }))
    const childNotes: TreeItem[] = notes
      .filter((n) => n.folder_id === parentId)
      .map((n) => ({ ...n, is_folder: false }))

    const items: TreeItem[] = [...childFolders, ...childNotes]

    return items
      .sort((a, b) => {
        if (a.is_folder !== b.is_folder) return a.is_folder ? -1 : 1
        const nameA = a.is_folder ? a.name : a.title
        const nameB = b.is_folder ? b.name : b.title
        return nameA.localeCompare(nameB)
      })
      .map((item) => {
        const isExpanded = item.is_folder && expandedFolders.has(item.id)
        const title = item.is_folder ? item.name : item.title

        return (
          <div key={item.id} className="ml-4">
            <div
              className={cn(
                "group relative flex cursor-pointer items-center justify-between rounded p-1",
                !item.is_folder && selectedNote?.id === item.id && "bg-accent"
              )}
              onClick={() => {
                if (item.is_folder) {
                  toggleFolder(item.id)
                } else {
                  onSelectNoteAction(item)
                }
              }}
            >
              {editingId === item.id ? (
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleSaveRename(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename(item)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  autoFocus
                  className="h-7"
                />
              ) : (
                <div className="flex items-center gap-2 truncate">
                  {item.is_folder ? (
                    <>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "flex-shrink-0 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                      <FolderIcon size={16} className="flex-shrink-0" />
                    </>
                  ) : (
                    <File size={16} className="ml-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{title}</span>
                </div>
              )}
              <div className="absolute right-0 top-1/2 flex -translate-y-1/2 bg-background opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRename(item)
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
                    handleDelete(item)
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            {item.is_folder && isExpanded && renderTree(item.id, depth + 1)}
          </div>
        )
      })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full">
        <div className="h-full p-2">
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
          {folders.length === 0 && notes.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No items yet.</p>
          ) : (
            renderTree(null, 0)
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onLayoutChangeAction("horizontal")}>
          <PanelLeft className="mr-2 h-4 w-4" />
          <span>Move Panel Left</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onLayoutChangeAction("vertical")}>
          <PanelRight className="mr-2 h-4 w-4" />
          <span>Move Panel Right</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
