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
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Folder, Note } from "@/types/dashboard"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  ChevronRight,
  File,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  Palette,
  PanelLeft,
  PanelRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

const FOLDER_COLORS = [
  { label: "Blue", value: "text-blue-500", bg: "bg-blue-500" },
  { label: "Red", value: "text-red-500", bg: "bg-red-500" },
  { label: "Green", value: "text-green-500", bg: "bg-green-500" },
  { label: "Yellow", value: "text-yellow-500", bg: "bg-yellow-500" },
  { label: "Purple", value: "text-purple-500", bg: "bg-purple-500" },
  { label: "Gray", value: "text-slate-500", bg: "bg-slate-500" },
  { label: "Orange", value: "text-orange-500", bg: "bg-orange-500" },
]

type FileExplorerProps = {
  notes: Note[]
  folders: Folder[]
  selectedNote: Note | null
  sidebarPosition: "left" | "right"
  onSelectNoteAction: (note: Note | null) => void
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
  setFoldersAction: React.Dispatch<React.SetStateAction<Folder[]>>
  onToggleSidebarPositionAction: () => void
}

type TreeItem = (Folder & { is_folder: true }) | (Note & { is_folder: false })

function isDescendant(
  folders: Folder[],
  sourceId: string,
  targetId: string
): boolean {
  if (sourceId === targetId) return true
  const target = folders.find((f) => f.id === targetId)
  if (!target || !target.parent_id) return false
  if (target.parent_id === sourceId) return true
  return isDescendant(folders, sourceId, target.parent_id)
}

function ExplorerItem({
  item,
  isSelected,
  isExpanded,
  onToggle,
  onSelect,
  onRename,
  onDelete,
  onCreate,
  onChangeColor,
  children,
  isOverlay = false,
}: {
  item: TreeItem
  isSelected: boolean
  isExpanded: boolean
  onToggle: (id: string) => void
  onSelect: (item: TreeItem) => void
  onRename: (item: TreeItem, name: string) => Promise<void>
  onDelete: (item: TreeItem) => Promise<void>
  onCreate: (type: "note" | "folder", parentId: string) => void
  onChangeColor: (id: string, color: string) => void
  children?: React.ReactNode
  isOverlay?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(item.is_folder ? item.name : item.title)

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: item.id,
    data: item,
    disabled: isEditing,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.id,
    data: item,
    disabled: !item.is_folder || isDragging || isEditing,
  })

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node)
      if (item.is_folder) setDropRef(node)
    },
    [setDragRef, setDropRef, item.is_folder]
  )

  const handleSubmit = async () => {
    if (!name.trim()) return setIsEditing(false)
    await onRename(item, name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
    if (e.key === "Escape") {
      setName(item.is_folder ? item.name : item.title)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (!isSelected || isEditing) return

    const handleShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "F2") {
        e.preventDefault()
        setIsEditing(true)
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault()
        onDelete(item)
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [isSelected, isEditing, item, onDelete])

  const folderColorClass =
    item.is_folder && item.color ? item.color : "text-blue-500"

  const content = (
    <div
      ref={isOverlay ? undefined : setRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
        isSelected && "bg-accent font-medium text-accent-foreground",
        !isSelected && "hover:bg-accent hover:text-accent-foreground",
        isDragging && "opacity-50",
        isOver && "inset-0 bg-primary/20 ring-1 ring-primary"
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (isEditing) return
        if (item.is_folder) {
          onSelect(item)
          onToggle(item.id)
        } else {
          onSelect(item)
        }
      }}
    >
      {item.is_folder ? (
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isExpanded && "rotate-90"
          )}
        />
      ) : (
        <span className="w-4" />
      )}

      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="h-6 px-1 py-0 text-xs"
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-center gap-2 truncate">
          {item.is_folder ? (
            isExpanded ? (
              <FolderOpen className={cn("h-4 w-4", folderColorClass)} />
            ) : (
              <FolderIcon className={cn("h-4 w-4", folderColorClass)} />
            )
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="truncate">{name}</span>
        </div>
      )}
    </div>
  )

  if (isOverlay) return content

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
        <ContextMenuContent>
          {item.is_folder && (
            <>
              <ContextMenuItem onSelect={() => onCreate("note", item.id)}>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => onCreate("folder", item.id)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  Color
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuRadioGroup value={folderColorClass}>
                    {FOLDER_COLORS.map((c) => (
                      <ContextMenuRadioItem
                        key={c.value}
                        value={c.value}
                        onSelect={() => onChangeColor(item.id, c.value)}
                      >
                        <div
                          className={cn(
                            "mr-2 h-3 w-3 rounded-full border border-border",
                            c.bg
                          )}
                        />
                        {c.label}
                      </ContextMenuRadioItem>
                    ))}
                  </ContextMenuRadioGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onSelect={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => onDelete(item)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {item.is_folder && isExpanded && (
        <div className="ml-4 border-l pl-1">{children}</div>
      )}
    </div>
  )
}

function RootDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "root-zone",
    data: { is_folder: true, id: "root-zone", name: "Root" },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[150px] flex-1 overflow-y-auto rounded-md transition-colors",
        isOver && "bg-primary/5 ring-1 ring-primary/50"
      )}
    >
      {children}
    </div>
  )
}

export function FileExplorer({
  notes,
  folders,
  selectedNote,
  sidebarPosition,
  onSelectNoteAction,
  setNotesAction,
  setFoldersAction,
  onToggleSidebarPositionAction,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [activeDragItem, setActiveDragItem] = useState<TreeItem | null>(null)
  const [mounted, setMounted] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreate = useCallback(
    async (type: "note" | "folder", explicitParentId?: string) => {
      const parentId = explicitParentId ?? selectedFolderId

      if (type === "folder") {
        const newFolder = await createFolder({
          name: "New Folder",
          parent_id: parentId,
        })
        if (newFolder) {
          setFoldersAction((prev) => [...prev, newFolder])
          if (parentId) {
            setExpandedFolders((prev) => new Set(prev).add(parentId))
          }
        }
      } else {
        const newNote = await createNote({
          title: "New Note",
          folder_id: parentId,
        })
        if (newNote) {
          setNotesAction((prev) => [...prev, newNote])
          if (parentId) {
            setExpandedFolders((prev) => new Set(prev).add(parentId))
          }
          onSelectNoteAction(newNote)
        }
      }
    },
    [
      selectedFolderId,
      setFoldersAction,
      setNotesAction,
      onSelectNoteAction,
      setExpandedFolders,
    ]
  )

  const handleRename = useCallback(
    async (item: TreeItem, newName: string) => {
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
    },
    [setFoldersAction, setNotesAction]
  )

  const handleChangeColor = useCallback(
    async (id: string, color: string) => {
      setFoldersAction((prev) =>
        prev.map((f) => (f.id === id ? { ...f, color } : f))
      )
      await updateFolder(id, { color })
    },
    [setFoldersAction]
  )

  const handleDelete = useCallback(
    async (item: TreeItem) => {
      if (item.is_folder) {
        const success = await deleteFolder(item.id)
        if (success) {
          setFoldersAction((prev) => prev.filter((f) => f.id !== item.id))
          if (selectedFolderId === item.id) setSelectedFolderId(null)
        }
      } else {
        const success = await deleteNote(item.id)
        if (success) {
          setNotesAction((prev) => prev.filter((n) => n.id !== item.id))
          if (selectedNote?.id === item.id) onSelectNoteAction(null)
        }
      }
    },
    [
      setFoldersAction,
      setNotesAction,
      onSelectNoteAction,
      selectedFolderId,
      selectedNote,
    ]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as TreeItem)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragItem(null)

    if (!over) return

    const draggedItem = active.data.current as TreeItem
    const targetFolderId = over.id === "root-zone" ? null : (over.id as string)

    if (draggedItem.id === targetFolderId) return
    if (
      draggedItem.is_folder &&
      targetFolderId &&
      isDescendant(folders, draggedItem.id, targetFolderId)
    ) {
      return
    }

    const currentParentId = draggedItem.is_folder
      ? draggedItem.parent_id
      : draggedItem.folder_id

    if (currentParentId === targetFolderId) return

    if (draggedItem.is_folder) {
      setFoldersAction((prev) =>
        prev.map((f) =>
          f.id === draggedItem.id ? { ...f, parent_id: targetFolderId } : f
        )
      )
      await updateFolder(draggedItem.id, { parent_id: targetFolderId })
    } else {
      setNotesAction((prev) =>
        prev.map((n) =>
          n.id === draggedItem.id ? { ...n, folder_id: targetFolderId } : n
        )
      )
      await updateNote(draggedItem.id, { folder_id: targetFolderId })
    }

    if (targetFolderId) {
      setExpandedFolders((prev) => new Set(prev).add(targetFolderId))
    }
  }

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (item: TreeItem) => {
      if (item.is_folder) {
        setSelectedFolderId(item.id)
        onSelectNoteAction(null)
      } else {
        onSelectNoteAction(item as Note)
        setSelectedFolderId((item as Note).folder_id)
      }
    },
    [onSelectNoteAction]
  )

  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault()
        handleCreate("note")
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut)
    return () => window.removeEventListener("keydown", handleGlobalShortcut)
  }, [handleCreate])

  const renderTree = (parentId: string | null) => {
    const childFolders = folders
      .filter((f) => f.parent_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))

    const childNotes = notes
      .filter((n) => n.folder_id === parentId)
      .sort((a, b) => a.title.localeCompare(b.title))

    return (
      <>
        {childFolders.map((folder) => (
          <ExplorerItem
            key={folder.id}
            item={{ ...folder, is_folder: true }}
            isSelected={selectedFolderId === folder.id && selectedNote === null}
            isExpanded={expandedFolders.has(folder.id)}
            onToggle={toggleFolder}
            onSelect={handleSelect}
            onRename={handleRename}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onChangeColor={handleChangeColor}
          >
            {renderTree(folder.id)}
          </ExplorerItem>
        ))}
        {childNotes.map((note) => (
          <ExplorerItem
            key={note.id}
            item={{ ...note, is_folder: false }}
            isSelected={selectedNote?.id === note.id}
            isExpanded={false}
            onToggle={() => {}}
            onSelect={handleSelect}
            onRename={handleRename}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onChangeColor={handleChangeColor}
          >
            {null}
          </ExplorerItem>
        ))}
      </>
    )
  }

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ContextMenu>
          <ContextMenuTrigger className="h-full w-full">
            <div
              className="flex h-full flex-col bg-background p-2"
              onClick={() => {
                setSelectedFolderId(null)
                onSelectNoteAction(null)
              }}
            >
              <div className="mb-2 flex items-center justify-between px-2 text-sm font-semibold text-muted-foreground">
                <span>Explorer</span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreate("note")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Note (A)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreate("folder")
                        }}
                        title="New Folder"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Folder</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <RootDropZone>
                {folders.length === 0 && notes.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Empty
                  </div>
                ) : (
                  renderTree(null)
                )}
              </RootDropZone>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onSelect={() => handleCreate("note")}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleCreate("folder")}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={onToggleSidebarPositionAction}>
              {sidebarPosition === "left" ? (
                <>
                  <PanelRight className="mr-2 h-4 w-4" />
                  Move Sidebar Right
                </>
              ) : (
                <>
                  <PanelLeft className="mr-2 h-4 w-4" />
                  Move Sidebar Left
                </>
              )}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {mounted &&
          createPortal(
            <DragOverlay>
              {activeDragItem && (
                <div className="opacity-90">
                  <ExplorerItem
                    item={activeDragItem}
                    isSelected={false}
                    isExpanded={false}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onRename={async () => {}}
                    onDelete={async () => {}}
                    onCreate={() => {}}
                    onChangeColor={() => {}}
                    isOverlay
                  />
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </TooltipProvider>
  )
}
