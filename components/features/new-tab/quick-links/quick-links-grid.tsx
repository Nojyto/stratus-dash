"use client"

import {
  createQuickLink,
  updateLinkOrder,
  type QuickLink,
} from "@/app/new-tab/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { QuickLinkItem } from "./quick-link-item"

type QuickLinksGridProps = {
  initialLinks: QuickLink[]
  isEditing: boolean
  userId: string
}

export function QuickLinksGrid({
  initialLinks,
  isEditing,
  userId,
}: QuickLinksGridProps) {
  const [links, setLinks] = useState(initialLinks)
  const [isPending, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  const didDragEnd = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update link order on server after drag
  useEffect(() => {
    if (!didDragEnd.current) {
      return
    }
    didDragEnd.current = false
    const linksToUpdate = links.map((link, index) => ({
      id: link.id,
      sort_order: index,
    }))
    startTransition(async () => {
      await updateLinkOrder(linksToUpdate)
    })
  }, [links, startTransition])

  const handleAddLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("url", url)

      const result = await createQuickLink(formData)
      if (result.success) {
        setLinks([
          ...links,
          {
            id: crypto.randomUUID(),
            title: title || null,
            url,
            user_id: userId,
            sort_order: links.length,
          },
        ])
        setTitle("")
        setUrl("")
        setPopoverOpen(false)
      } else {
        console.error(result.error)
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      didDragEnd.current = true

      setLinks((currentLinks) => {
        const oldIndex = currentLinks.findIndex((l) => l.id === active.id)
        const newIndex = currentLinks.findIndex((l) => l.id === over.id)
        return arrayMove(currentLinks, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)}>
        <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
          {links.map((link, i) => (
            <QuickLinkItem
              key={link.id}
              link={link}
              isEditing={isEditing}
              tabIndex={i}
              onDeleteAction={(id) =>
                setLinks(links.filter((l) => l.id !== id))
              }
              onUpdateAction={(updatedLink) =>
                setLinks(
                  links.map((l) => (l.id === updatedLink.id ? updatedLink : l))
                )
              }
            />
          ))}

          {isEditing && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="flex w-20 flex-col items-center gap-1.5">
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-full border-dashed"
                    aria-label="Add new quick link"
                    tabIndex={links.length}
                  >
                    <Plus className="h-9 w-9 text-muted-foreground" />
                  </Button>
                  <span className="w-full text-center text-xs text-muted-foreground">
                    Add Link
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form onSubmit={handleAddLink} className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add new link</h4>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Google"
                      className="h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL (Required)</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="example.com"
                      className="h-9"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Link"}
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
