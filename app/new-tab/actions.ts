"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type QuickLink = {
  id: string
  title: string | null
  url: string
  user_id: string
  sort_order: number
}

export type UserSettings = {
  user_id: string
  default_search_engine: string
}

export type NewTabItems = {
  links: QuickLink[]
  settings: UserSettings | null
}

export async function getNewTabItems(): Promise<NewTabItems> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { links: [], settings: null }
  }

  const [linksResult, settingsResult] = await Promise.all([
    supabase
      .from("quick_links")
      .select("id, title, url, user_id, sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("user_settings")
      .select("user_id, default_search_engine")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  if (linksResult.error) {
    console.error("Error fetching links:", linksResult.error)
  }
  if (settingsResult.error) {
    console.error("Error fetching settings:", settingsResult.error)
  }

  return {
    links: (linksResult.data as QuickLink[]) ?? [],
    settings: (settingsResult.data as UserSettings) ?? null,
  }
}

async function getNextSortOrder(userId: string): Promise<number> {
  const supabase = await createClient()
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

export async function createQuickLink(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string
  if (!url) throw new Error("URL is required")

  const prefixedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`

  const sortOrder = await getNextSortOrder(user.id)

  const { error } = await supabase.from("quick_links").insert({
    user_id: user.id,
    title,
    url: prefixedUrl,
    sort_order: sortOrder,
  })

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateQuickLink(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string
  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string

  if (!id || !url) throw new Error("ID and URL are required")

  const prefixedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`

  const { error } = await supabase
    .from("quick_links")
    .update({ title, url: prefixedUrl })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function deleteQuickLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("quick_links").delete().eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateLinkOrder(
  links: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

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

export async function updateSearchEngine(engine: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

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
