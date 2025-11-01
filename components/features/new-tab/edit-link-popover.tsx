"use client"

import type { QuickLink } from "@/app/new-tab/actions"
import { deleteQuickLink, updateQuickLink } from "@/app/new-tab/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Edit, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"

type EditLinkPopoverProps = {
  link: QuickLink
  onDeleteAction: (id: string) => void
  onUpdateAction: (link: QuickLink) => void
}

export function EditLinkPopover({
  link,
  onDeleteAction,
  onUpdateAction,
}: EditLinkPopoverProps) {
  const [isPending, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState(link.title || "")
  const [url, setUrl] = useState(link.url)

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", link.id)
      formData.append("title", title)
      formData.append("url", url)

      const result = await updateQuickLink(formData)
      if (result.success) {
        onUpdateAction({
          ...link,
          title: title || null,
          url,
        })
        setPopoverOpen(false)
      } else {
        console.error(result.error)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      onDeleteAction(link.id)
      setPopoverOpen(false)
      await deleteQuickLink(link.id)
    })
  }

  const onOpenChange = (open: boolean) => {
    if (open) {
      setTitle(link.title || "")
      setUrl(link.url)
    }
    setPopoverOpen(open)
  }

  return (
    <Popover open={popoverOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleUpdate} className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit link</h4>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title (Optional)</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-url">URL (Required)</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9"
              required
            />
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
