"use client"

import { useEffect, useRef } from "react"

type BackgroundManagerProps = {
  wallpaperMode: "image" | "gradient"
  wallpaperUrl: string
  gradientFrom: string
  gradientTo: string
}

export function BackgroundManager({
  wallpaperMode,
  wallpaperUrl,
  gradientFrom,
  gradientTo,
}: BackgroundManagerProps) {
  const appliedWallpaperUrl = useRef<string | null>(null)

  useEffect(() => {
    if (wallpaperMode === "image") {
      document.documentElement.style.removeProperty("--gradient-from")
      document.documentElement.style.removeProperty("--gradient-to")
      document.body.classList.remove("bg-gradient-active")

      if (wallpaperUrl === appliedWallpaperUrl.current) {
        document.body.classList.add("bg-image-active", "bg-image-loaded")
        return
      }

      const img = new Image()
      img.src = wallpaperUrl
      img.onload = () => {
        appliedWallpaperUrl.current = wallpaperUrl
        document.documentElement.style.setProperty(
          "--bg-image",
          `url(${wallpaperUrl})`
        )
        document.body.classList.add("bg-image-active")

        requestAnimationFrame(() => {
          document.body.classList.add("bg-image-loaded")
        })
      }
      img.onerror = () => {
        appliedWallpaperUrl.current = null
        document.body.classList.remove("bg-image-active", "bg-image-loaded")
      }
    } else if (wallpaperMode === "gradient") {
      appliedWallpaperUrl.current = null
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active", "bg-image-loaded")

      document.documentElement.style.setProperty(
        "--gradient-from",
        gradientFrom
      )
      document.documentElement.style.setProperty("--gradient-to", gradientTo)
      document.body.classList.add("bg-gradient-active")
    }
  }, [wallpaperUrl, wallpaperMode, gradientFrom, gradientTo])

  return null
}
