import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const absoluteUrl = (path: string) => {
  return `${defaultUrl}${path}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function prefixUrl(url: string): string {
  if (!url) return ""
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export function getHostname(url: string): string | null {
  try {
    const fullUrl = prefixUrl(url)
    return new URL(fullUrl).hostname
  } catch {
    return null
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (isNaN(diffInSeconds)) return ""

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ] as const

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds)
      if (count >= 1) {
        return rtf.format(-count, interval.label)
      }
    }

    return "just now"
  } catch (e) {
    console.error("Error formatting time ago:", e)
    return ""
  }
}
