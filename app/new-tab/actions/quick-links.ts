"use server"

import {
  getNextSortOrder,
  getSupabaseWithUser,
  updateSortOrder,
} from "@/lib/supabase/utils"
import { prefixUrl } from "@/lib/utils"
import type { FormState } from "@/types/new-tab"
import { revalidatePath } from "next/cache"

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
  const sortOrder = await getNextSortOrder(user.id, "quick_links")

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

export async function deleteQuickLink(id: string): Promise<FormState> {
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
  return updateSortOrder(links, "quick_links")
}
