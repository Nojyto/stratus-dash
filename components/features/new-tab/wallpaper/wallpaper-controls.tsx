"use client"

import {
  lockWallpaper,
  refreshWallpaper,
  unlockWallpaper,
} from "@/app/new-tab/actions/wallpaper"
import { Button } from "@/components/ui/button"
import type { WallpaperInfo } from "@/types/new-tab"
import { Lock, Shuffle, Unlock } from "lucide-react"
import { useState, useTransition } from "react"

type WallpaperControlsProps = {
  initialWallpaper: WallpaperInfo
  initialWallpaperQuery: string
  wallpaperMode: "image" | "gradient"
}

export function WallpaperControls({
  initialWallpaper,
  initialWallpaperQuery,
  wallpaperMode,
}: WallpaperControlsProps) {
  const [wallpaper, setWallpaper] = useState(initialWallpaper)
  const [isLocked, setIsLocked] = useState(initialWallpaper.isLocked)
  const [wallpaperQuery] = useState(initialWallpaperQuery)
  const [isWallpaperPending, startWallpaperTransition] = useTransition()

  const handleRandomizeWallpaper = () => {
    startWallpaperTransition(async () => {
      const newWallpaper = await refreshWallpaper(wallpaperQuery)
      setWallpaper({ ...newWallpaper, isLocked: false })
      setIsLocked(false)
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

  const formatArtistName = (name: string) => {
    if (!name) return null
    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
    }
    return name
  }
  const artistName = formatArtistName(wallpaper.artist)

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
      {artistName && (
        <a
          href={wallpaper.photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          Photo by {artistName}
        </a>
      )}
    </>
  )
}
