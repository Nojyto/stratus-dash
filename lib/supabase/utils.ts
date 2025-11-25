"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getSupabaseWithUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return { supabase, user }
}

type SortableTable = "quick_links" | "general_todos" | "daily_tasks"

export async function getNextSortOrder(
  userId: string,
  table: SortableTable
): Promise<number> {
  const { supabase } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from(table)
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

export async function updateSortOrder(
  items: { id: string; sort_order: number }[],
  table: SortableTable
) {
  const { supabase, user } = await getSupabaseWithUser()

  const updates = items.map((item) =>
    supabase
      .from(table)
      .update({ sort_order: item.sort_order })
      .eq("user_id", user.id)
      .eq("id", item.id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find((res) => res.error)

  if (firstError) {
    console.error(`[DB Util] Error updating ${table} order:`, firstError.error)
    return {
      success: false,
      error: "Failed to update item order due to a database error.",
    }
  }

  return { success: true }
}
