"use server"

import type { WallpaperInfo } from "@/app/new-tab/actions"
import { unsplash } from "@/lib/external/unsplash"
import { unstable_cache as cache } from "next/cache"

const FALLBACK_WALLPAPER_URL = "/default-wallpaper.jpg"
const FALLBACK_ARTIST = "Local Image"
const FALLBACK_ARTIST_URL = "#"

export async function fetchFreshRandomWallpaper(
  query: string
): Promise<Omit<WallpaperInfo, "isLocked">> {
  try {
    const result = await unsplash.photos.getRandom({
      orientation: "landscape",
      query: query || "nature landscape wallpaper",
    })

    if (result.errors || !result.response) {
      console.warn("Unsplash API Error:", result.errors)
      return {
        url: FALLBACK_WALLPAPER_URL,
        artist: FALLBACK_ARTIST,
        photoUrl: FALLBACK_ARTIST_URL,
      }
    }

    const photo = Array.isArray(result.response)
      ? result.response[0]
      : result.response

    return {
      url: photo.urls.regular,
      artist: photo.user.name,
      photoUrl: photo.links.html,
    }
  } catch (e) {
    console.warn(
      "Failed to fetch from Unsplash, returning fallback. Error:",
      e instanceof Error ? e.message : String(e)
    )
    return {
      url: FALLBACK_WALLPAPER_URL,
      artist: FALLBACK_ARTIST,
      photoUrl: FALLBACK_ARTIST_URL,
    }
  }
}

export const getCachedRandomWallpaper = cache(
  async (query: string): Promise<Omit<WallpaperInfo, "isLocked">> => {
    return fetchFreshRandomWallpaper(query)
  },
  ["random-wallpaper"],
  { revalidate: 3600 }
)
