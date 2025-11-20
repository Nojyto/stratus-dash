"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

type BackgroundManagerProps = {
  wallpaperMode: "image" | "gradient"
  wallpaperUrl: string
  gradientFrom: string
  gradientTo: string
  theme: string | undefined
}

export function BackgroundManager({
  wallpaperMode,
  wallpaperUrl,
  gradientFrom,
  gradientTo,
  theme,
}: BackgroundManagerProps) {
  const appliedWallpaperUrl = useRef<string | null>(null)
  const pathname = usePathname()

  const cleanupStyles = () => {
    document.body.classList.remove(
      "bg-image-active",
      "bg-image-loaded",
      "bg-gradient-active"
    )
    document.documentElement.style.removeProperty("--bg-image")
    document.documentElement.style.removeProperty("--gradient-from")
    document.documentElement.style.removeProperty("--gradient-to")
  }

  useEffect(() => {
    if (pathname !== "/new-tab") {
      cleanupStyles()
    }
  }, [pathname])

  useEffect(() => {
    let img: HTMLImageElement | null = null
    let timer: NodeJS.Timeout | null = null

    if (pathname !== "/new-tab") {
      cleanupStyles()
      return
    }

    if (wallpaperMode === "image") {
      document.documentElement.style.removeProperty("--gradient-from")
      document.documentElement.style.removeProperty("--gradient-to")
      document.body.classList.remove("bg-gradient-active")

      if (wallpaperUrl === appliedWallpaperUrl.current) {
        document.body.classList.add("bg-image-active", "bg-image-loaded")
        document.documentElement.style.setProperty(
          "--bg-image",
          `url(${wallpaperUrl})`
        )
      } else {
        document.body.classList.remove("bg-image-loaded")

        img = new Image()
        img.src = wallpaperUrl
        img.onload = () => {
          if (window.location.pathname !== "/new-tab") return

          appliedWallpaperUrl.current = wallpaperUrl
          document.documentElement.style.setProperty(
            "--bg-image",
            `url(${wallpaperUrl})`
          )
          document.body.classList.add("bg-image-active")

          timer = setTimeout(() => {
            document.body.classList.add("bg-image-loaded")
          }, 50)
        }
        img.onerror = () => {
          appliedWallpaperUrl.current = null
          document.body.classList.remove("bg-image-active", "bg-image-loaded")
        }
      }
    } else if (wallpaperMode === "gradient") {
      appliedWallpaperUrl.current = null
      document.documentElement.style.removeProperty("--bg-image")
      document.body.classList.remove("bg-image-active", "bg-image-loaded")

      if (theme === "custom") {
        document.documentElement.style.setProperty(
          "--gradient-from",
          gradientFrom
        )
        document.documentElement.style.setProperty("--gradient-to", gradientTo)
      } else {
        document.documentElement.style.removeProperty("--gradient-from")
        document.documentElement.style.removeProperty("--gradient-to")
      }

      document.body.classList.add("bg-gradient-active")
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (img) {
        img.onload = null
        img.onerror = null
      }
      cleanupStyles()
    }
  }, [wallpaperUrl, wallpaperMode, gradientFrom, gradientTo, theme, pathname])

  return null
}
