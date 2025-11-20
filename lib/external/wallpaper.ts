"use server"

import type { WallpaperInfo } from "@/types/new-tab"
import { unstable_cache as cache } from "next/cache"
import { createApi } from "unsplash-js"
import { env } from "../env"

const FALLBACK_WALLPAPER_URL = "/default-wallpaper.jpg"
const FALLBACK_ARTIST = "Local Image"
const FALLBACK_URL = "https://unsplash.com/"

const unsplash = createApi({
  accessKey: env.UNSPLASH_ACCESS_KEY,
})

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
        photoUrl: FALLBACK_URL,
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
      photoUrl: FALLBACK_URL,
    }
  }
}

export const getCachedRandomWallpaper = cache(
  async (query: string): Promise<Omit<WallpaperInfo, "isLocked">> => {
    return fetchFreshRandomWallpaper(query)
  },
  ["random-wallpaper"],
  {
    revalidate: 3600,
    tags: ["random-wallpaper-cache"],
  }
)
