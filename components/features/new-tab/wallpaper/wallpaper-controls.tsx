"use client"

import {
  lockWallpaper,
  refreshWallpaper,
  unlockWallpaper,
} from "@/app/new-tab/actions/settings"
import { Button } from "@/components/ui/button"
import type { WallpaperInfo } from "@/types/new-tab"
import { Lock, Shuffle, Unlock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

type WallpaperControlsProps = {
  initialWallpaper: WallpaperInfo
  wallpaperQuery: string
  wallpaperMode: "image" | "gradient"
}

export function WallpaperControls({
  initialWallpaper,
  wallpaperQuery,
  wallpaperMode,
}: WallpaperControlsProps) {
  const [wallpaper, setWallpaper] = useState(initialWallpaper)
  const [isLocked, setIsLocked] = useState(initialWallpaper.isLocked)
  const [isWallpaperPending, startWallpaperTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setWallpaper(initialWallpaper)
    setIsLocked(initialWallpaper.isLocked)
  }, [initialWallpaper])

  const handleRandomizeWallpaper = () => {
    startWallpaperTransition(async () => {
      await refreshWallpaper(wallpaperQuery)
      router.refresh()
    })
  }

  const handleToggleLockWallpaper = () => {
    startWallpaperTransition(async () => {
      if (isLocked) {
        await unlockWallpaper()
        setIsLocked(false)
      } else {
        await lockWallpaper(wallpaper.url, wallpaper.artist, wallpaper.photoUrl)
        setIsLocked(true)
      }
    })
  }

  const formatArtistName = (name: string | null) => {
    if (!name || name === "Local Image") return "Local Image"

    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
    }
    return name
  }

  const artistName = formatArtistName(wallpaper.artist)
  const isLocal = artistName === "Local Image"

  if (wallpaperMode !== "image") {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleToggleLockWallpaper}
        disabled={isWallpaperPending}
      >
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleRandomizeWallpaper}
        disabled={isWallpaperPending}
      >
        <Shuffle className="h-4 w-4" />
      </Button>

      {artistName &&
        (isLocal ? (
          <span className="ml-2 cursor-default rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm">
            {artistName}
          </span>
        ) : (
          <a
            href={wallpaper.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            Photo by {artistName}
          </a>
        ))}
    </>
  )
}
