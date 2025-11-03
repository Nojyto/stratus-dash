"use client"

import type { QuickLink } from "@/app/new-tab/actions"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { EditLinkPopover } from "./edit-link-popover"

type QuickLinkItemProps = {
  link: QuickLink
  isEditing: boolean
  onDeleteAction: (id: string) => void
  onUpdateAction: (link: QuickLink) => void
}

export function QuickLinkItem({
  link,
  isEditing,
  onDeleteAction,
  onUpdateAction,
}: QuickLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.7 : 1,
  }

  const displayTitle = link.title || null
  const Comp = isEditing ? "div" : "a"

  const getHostname = () => {
    try {
      const fullUrl =
        link.url.startsWith("http://") || link.url.startsWith("https://")
          ? link.url
          : `https://${link.url}`
      return new URL(fullUrl).hostname
    } catch {
      return "duckduckgo.com"
    }
  }
  const hostname = getHostname()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative flex w-20 flex-col items-center gap-1.5"
    >
      <Comp
        href={isEditing ? undefined : link.url}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-all hover:bg-accent",
          isEditing && "cursor-grab"
        )}
        onClick={(e) => {
          if (isEditing || isDragging) {
            e.preventDefault()
          }
        }}
        {...(isEditing ? listeners : {})}
      >
        <Image
          src={`https://icons.duckduckgo.com/ip3/${hostname}.ico`}
          alt=""
          draggable="false"
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </Comp>

      {displayTitle && (
        <span className="w-full truncate text-center text-xs text-foreground">
          {displayTitle}
        </span>
      )}

      {isEditing && (
        <EditLinkPopover
          link={link}
          onDeleteAction={onDeleteAction}
          onUpdateAction={onUpdateAction}
        />
      )}
    </div>
  )
}
