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
  tabIndex: number
}

export function QuickLinkItem({
  link,
  isEditing,
  onDeleteAction,
  onUpdateAction,
  tabIndex,
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
        tabIndex={tabIndex}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 backdrop-blur-sm transition-all hover:bg-secondary/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground/50 focus-visible:ring-offset-0",
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
          width={36}
          height={36}
          className="h-9 w-9"
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
