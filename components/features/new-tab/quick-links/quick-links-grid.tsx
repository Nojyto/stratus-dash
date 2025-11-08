"use client"

import {
  createQuickLink,
  updateLinkOrder,
} from "@/app/new-tab/actions/quick-links"
import { SubmitButton } from "@/components/common/submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { FormState, QuickLink } from "@/types/new-tab"
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
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { QuickLinkItem } from "./quick-link-item"

type QuickLinksGridProps = {
  initialLinks: QuickLink[]
  isEditing: boolean
  userId: string
}

export function QuickLinksGrid({
  initialLinks,
  isEditing,
}: QuickLinksGridProps) {
  const [links, setLinks] = useState(initialLinks)
  const [, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction] = useActionState<FormState | null, FormData>(
    createQuickLink,
    null
  )

  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  useEffect(() => {
    if (state?.success) {
      setPopoverOpen(false)
      formRef.current?.reset()
    }
  }, [state])

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
                <form ref={formRef} action={formAction} className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add new link</h4>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Google"
                      className="h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL (Required)</Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="example.com"
                      className="h-9"
                      required
                    />
                  </div>
                  {state?.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                  )}
                  <SubmitButton pendingText="Adding...">Add Link</SubmitButton>
                </form>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
