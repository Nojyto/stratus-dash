"use server"

import { getSupabaseWithUser } from "./utils"

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
    console.error(`Error updating ${table} order:`, firstError.error)
    const errorMessage =
      firstError.error?.message ?? "An unknown database error occurred"
    return { success: false, error: errorMessage }
  }

  return { success: true }
}
