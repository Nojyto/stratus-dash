"use server"

import {
  fetchFreshRandomWallpaper,
  getCachedRandomWallpaper,
} from "@/lib/external/wallpaper"
import { getWeatherForCoords } from "@/lib/external/weather"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { prefixUrl } from "@/lib/utils"
import type {
  FormState,
  NewTabItems,
  QuickLink,
  UserSettings,
  WallpaperInfo,
  WeatherData,
} from "@/types/new-tab"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

function _formatUserSettings(
  dbSettings: {
    user_id: string
    default_search_engine: string | null
    wallpaper_url: string | null
    wallpaper_artist: string | null
    wallpaper_photo_url: string | null
    wallpaper_mode: "image" | "gradient" | null
    wallpaper_query: string | null
    gradient_from: string | null
    gradient_to: string | null
    weather_lat: number | null
    weather_lon: number | null
  } | null,
  userId: string
): UserSettings {
  const defaults: UserSettings = {
    user_id: userId,
    default_search_engine: "google",
    wallpaper_mode: "image",
    wallpaper_query: "nature landscape wallpaper",
    gradient_from: "220 70% 50%",
    gradient_to: "280 65% 60%",
    weather_lat: null,
    weather_lon: null,
  }

  if (!dbSettings) {
    return defaults
  }

  return {
    user_id: dbSettings.user_id,
    default_search_engine:
      dbSettings.default_search_engine ?? defaults.default_search_engine,
    wallpaper_mode: dbSettings.wallpaper_mode ?? defaults.wallpaper_mode,
    wallpaper_query: dbSettings.wallpaper_query ?? defaults.wallpaper_query,
    gradient_from: dbSettings.gradient_from ?? defaults.gradient_from,
    gradient_to: dbSettings.gradient_to ?? defaults.gradient_to,
    weather_lat: dbSettings.weather_lat,
    weather_lon: dbSettings.weather_lon,
  }
}

async function _getWallpaperInfo(
  formattedSettings: UserSettings,
  dbSettings: {
    wallpaper_url: string | null
    wallpaper_artist: string | null
    wallpaper_photo_url: string | null
  } | null
): Promise<WallpaperInfo> {
  if (
    formattedSettings.wallpaper_mode !== "gradient" &&
    dbSettings?.wallpaper_url &&
    dbSettings?.wallpaper_artist &&
    dbSettings?.wallpaper_photo_url
  ) {
    return {
      url: dbSettings.wallpaper_url,
      artist: dbSettings.wallpaper_artist,
      photoUrl: dbSettings.wallpaper_photo_url,
      isLocked: true,
    }
  }

  if (formattedSettings.wallpaper_mode !== "gradient") {
    const randomPhoto = await getCachedRandomWallpaper(
      formattedSettings.wallpaper_query
    )
    return {
      ...randomPhoto,
      isLocked: false,
    }
  }

  return {
    url: "",
    artist: "",
    photoUrl: "",
    isLocked: false,
  }
}

async function _getWeatherData(
  settings: UserSettings
): Promise<WeatherData | null> {
  if (settings.weather_lat != null && settings.weather_lon != null) {
    return getWeatherForCoords(settings.weather_lat, settings.weather_lon)
  }
  return null
}

export async function getNewTabItems(): Promise<NewTabItems> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [linksResult, settingsResult] = await Promise.all([
    supabase
      .from("quick_links")
      .select("id, title, url, user_id, sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("user_settings")
      .select(
        "user_id, default_search_engine, wallpaper_url, wallpaper_artist, wallpaper_photo_url, wallpaper_mode, wallpaper_query, gradient_from, gradient_to, weather_lat, weather_lon"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  if (linksResult.error)
    console.error("Error fetching links:", linksResult.error)
  if (settingsResult.error)
    console.error("Error fetching settings:", settingsResult.error)

  const settings = _formatUserSettings(settingsResult.data, user.id)
  const [wallpaper, weather] = await Promise.all([
    _getWallpaperInfo(settings, settingsResult.data),
    _getWeatherData(settings),
  ])

  return {
    links: (linksResult.data as QuickLink[]) ?? [],
    settings,
    wallpaper,
    weather,
  }
}

export async function refreshWallpaper(
  query: string
): Promise<Omit<WallpaperInfo, "isLocked">> {
  const { supabase, user } = await getSupabaseWithUser()
  const newWallpaper = await fetchFreshRandomWallpaper(query)

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
  revalidateTag("random-wallpaper-cache")

  return newWallpaper
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
  revalidateTag("random-wallpaper-cache")
  return { success: true }
}

export async function updateNewTabSettings(settings: {
  wallpaper_mode?: "image" | "gradient"
  wallpaper_query?: string
  gradient_from?: string | null
  gradient_to?: string | null
  weather_lat?: number | null
  weather_lon?: number | null
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

async function getNextSortOrder(userId: string): Promise<number> {
  const { supabase } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from("quick_links")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return 0
  }
  return (data.sort_order ?? 0) + 1
}

export async function createQuickLink(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getSupabaseWithUser()

  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string
  if (!url) {
    return { error: "URL is required" }
  }

  const prefixedUrl = prefixUrl(url)
  const sortOrder = await getNextSortOrder(user.id)

  const { error } = await supabase.from("quick_links").insert({
    user_id: user.id,
    title,
    url: prefixedUrl,
    sort_order: sortOrder,
  })

  if (error) {
    return { error: error.message }
  }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateQuickLink(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()

  const id = formData.get("id") as string
  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string

  if (!id || !url) {
    return { error: "ID and URL are required" }
  }

  const prefixedUrl = prefixUrl(url)

  const { error } = await supabase
    .from("quick_links")
    .update({ title, url: prefixedUrl })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function deleteQuickLink(
  prevState: FormState | null,
  id: string
): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()
  const { error } = await supabase.from("quick_links").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateLinkOrder(
  links: { id: string; sort_order: number }[]
) {
  const { supabase, user } = await getSupabaseWithUser()

  const updates = links.map((link) =>
    supabase
      .from("quick_links")
      .update({ sort_order: link.sort_order })
      .eq("user_id", user.id)
      .eq("id", link.id)
  )

  const results = await Promise.all(updates)

  const firstError = results.find((res) => res.error)
  if (firstError) {
    console.error("Error updating link order:", firstError.error)
    const errorMessage =
      firstError.error?.message ?? "An unknown database error occurred"
    return { success: false, error: errorMessage }
  }

  revalidatePath("/new-tab")
  return { success: true }
}
