"use client"

import { useEffect } from "react"

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
  useEffect(() => {
    document.documentElement.style.setProperty("--gradient-from", gradientFrom)
    document.documentElement.style.setProperty("--gradient-to", gradientTo)

    if (wallpaperMode === "image") {
      const img = new Image()
      img.src = wallpaperUrl
      img.onload = () => {
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
        document.body.classList.remove("bg-image-active", "bg-image-loaded")
      }
    }

    return () => {
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove(
        "bg-image-active",
        "bg-image-loaded",
        "bg-gradient-active"
      )
    }
  }, [wallpaperUrl, wallpaperMode, gradientFrom, gradientTo])

  return null
}
