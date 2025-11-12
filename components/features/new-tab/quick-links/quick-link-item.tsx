"use client"

import { cn, getHostname } from "@/lib/utils"
import type { QuickLink } from "@/types/new-tab"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Globe } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
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
  const [imgError, setImgError] = useState(false)
  const hostname = getHostname(link.url)

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

  useEffect(() => {
    setImgError(hostname === null)
  }, [link.url, hostname])

  const handleImgError = () => {
    setImgError(true)
  }

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
        {imgError || !hostname ? (
          <Globe className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Image
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
            alt=""
            draggable="false"
            width={32}
            height={32}
            className="h-8 w-8"
            onError={handleImgError}
          />
        )}
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
