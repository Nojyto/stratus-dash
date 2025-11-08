"use client"

import { deleteQuickLink, updateQuickLink } from "@/app/new-tab/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { FormState, QuickLink } from "@/types/new-tab"
import { Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useFormState, useFormStatus } from "react-dom"

function EditFormButtons({
  onDelete,
  deletePending,
}: {
  onDelete: () => void
  deletePending: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <div className="flex justify-between gap-2">
      <Button
        type="button"
        variant="destructive"
        onClick={onDelete}
        disabled={pending || deletePending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {deletePending ? "Deleting..." : "Delete"}
      </Button>
      <Button type="submit" disabled={pending || deletePending}>
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}

type EditLinkPopoverProps = {
  link: QuickLink
  onDeleteAction: (id: string) => void
  onUpdateAction: (link: QuickLink) => void
}

export function EditLinkPopover({
  link,
  onDeleteAction,
}: EditLinkPopoverProps) {
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [state, formAction] = useFormState<FormState | null, FormData>(
    updateQuickLink,
    null
  )

  const handleDelete = () => {
    startDeleteTransition(async () => {
      onDeleteAction(link.id)
      setPopoverOpen(false)
      await deleteQuickLink(null, link.id)
    })
  }

  // Close popover on successful save
  useEffect(() => {
    if (state?.success) {
      setPopoverOpen(false)
    }
  }, [state])

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-1 -top-1 h-5 w-5 border-none bg-transparent p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="id" value={link.id} />
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit link</h4>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-title-${link.id}`}>Title (Optional)</Label>
            <Input
              id={`edit-title-${link.id}`}
              name="title"
              defaultValue={link.title || ""}
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-url-${link.id}`}>URL (Required)</Label>
            <Input
              id={`edit-url-${link.id}`}
              name="url"
              defaultValue={link.url}
              className="h-9"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <EditFormButtons
            onDelete={handleDelete}
            deletePending={isDeletePending}
          />
        </form>
      </PopoverContent>
    </Popover>
  )
}
