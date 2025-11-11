"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { revalidatePath, revalidateTag } from "next/cache"

async function _updateUserSettings(
  userId: string,
  settings: Record<string, unknown>
) {
  const { supabase } = await getSupabaseWithUser()

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateNewTabSettings(settings: {
  wallpaper_mode?: "image" | "gradient"
  wallpaper_query?: string
  gradient_from?: string | null
  gradient_to?: string | null
  weather_lat?: number | null
  weather_lon?: number | null
  news_country?: string
  news_category?: string[]
  tracked_stocks?: string[]
}) {
  const { user } = await getSupabaseWithUser()
  return _updateUserSettings(user.id, settings)
}

export async function updateSearchEngine(engine: string) {
  const { user } = await getSupabaseWithUser()
  return _updateUserSettings(user.id, { default_search_engine: engine })
}

export async function refreshWallpaper(
  query: string
): Promise<{ success: true }> {
  const { user } = await getSupabaseWithUser()
  await _updateUserSettings(user.id, {
    wallpaper_url: null,
    wallpaper_artist: null,
    wallpaper_photo_url: null,
    wallpaper_query: query,
    wallpaper_mode: "image",
  })

  revalidateTag("random-wallpaper-cache", "max")

  return { success: true }
}

export async function lockWallpaper(
  url: string,
  artist: string,
  photoUrl: string
) {
  const { user } = await getSupabaseWithUser()
  return _updateUserSettings(user.id, {
    wallpaper_url: url,
    wallpaper_artist: artist,
    wallpaper_photo_url: photoUrl,
    wallpaper_mode: "image",
  })
}

export async function unlockWallpaper() {
  const { user } = await getSupabaseWithUser()
  const result = await _updateUserSettings(user.id, {
    wallpaper_url: null,
    wallpaper_artist: null,
    wallpaper_photo_url: null,
  })

  if (result.success) {
    revalidateTag("random-wallpaper-cache", "max")
  }
  return result
}
