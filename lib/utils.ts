import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function prefixUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

export function getHostname(url: string): string {
  try {
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`
    return new URL(fullUrl).hostname
  } catch {
    return "duckduckgo.com"
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
    const minutes = Math.round(seconds / 60)
    const hours = Math.round(minutes / 60)
    const days = Math.round(hours / 24)

    if (isNaN(seconds)) {
      return ""
    }

    if (seconds < 60) {
      return `${seconds}s ago`
    } else if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  } catch (e) {
    console.error("Error formatting time ago:", e)
    return ""
  }
}
