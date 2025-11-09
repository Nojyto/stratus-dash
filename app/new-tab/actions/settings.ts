"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { revalidatePath } from "next/cache"

export async function updateNewTabSettings(settings: {
  wallpaper_mode?: "image" | "gradient"
  wallpaper_query?: string
  gradient_from?: string | null
  gradient_to?: string | null
  weather_lat?: number | null
  weather_lon?: number | null
  news_country?: string
  news_category?: string[]
}) {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateSearchEngine(engine: string) {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      default_search_engine: engine,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}
