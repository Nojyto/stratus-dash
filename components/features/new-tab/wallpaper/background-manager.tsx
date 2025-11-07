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
      document.documentElement.style.setProperty(
        "--bg-image",
        `url(${wallpaperUrl})`
      )
      document.body.classList.add("bg-image-active")
      document.body.classList.remove("bg-gradient-active")
    } else {
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active")
      document.body.classList.add("bg-gradient-active")
    }

    return () => {
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active")
      document.body.classList.remove("bg-gradient-active")
    }
  }, [wallpaperUrl, wallpaperMode, gradientFrom, gradientTo])

  return null
}
