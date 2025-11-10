"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { revalidatePath, revalidateTag } from "next/cache"

export async function refreshWallpaper(
  query: string
): Promise<{ success: true }> {
  const { supabase, user } = await getSupabaseWithUser()

  await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      wallpaper_url: null,
      wallpaper_artist: null,
      wallpaper_photo_url: null,
      wallpaper_query: query,
      wallpaper_mode: "image",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  revalidatePath("/new-tab")
  revalidateTag("random-wallpaper-cache", "max")

  return { success: true }
}

export async function lockWallpaper(
  url: string,
  artist: string,
  photoUrl: string
) {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      wallpaper_url: url,
      wallpaper_artist: artist,
      wallpaper_photo_url: photoUrl,
      wallpaper_mode: "image",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function unlockWallpaper() {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      wallpaper_url: null,
      wallpaper_artist: null,
      wallpaper_photo_url: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  revalidateTag("random-wallpaper-cache", "max")
  return { success: true }
}
