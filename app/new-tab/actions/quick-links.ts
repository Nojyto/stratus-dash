"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { prefixUrl } from "@/lib/utils"
import type { FormState } from "@/types/new-tab"
import { revalidatePath } from "next/cache"

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
