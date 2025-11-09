"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { prefixUrl } from "@/lib/utils"
import type { FormState } from "@/types/new-tab"

async function getNextSortOrder(
  userId: string,
  table: "general_todos" | "daily_tasks"
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

export async function createGeneralTodo(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getSupabaseWithUser()

  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!task) {
    return { error: "Task is required" }
  }

  const sortOrder = await getNextSortOrder(user.id, "general_todos")

  const { data, error } = await supabase
    .from("general_todos")
    .insert({
      user_id: user.id,
      task,
      link: link ? prefixUrl(link) : null,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }
  return { success: true, data: data }
}

export async function updateGeneralTodo(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()

  const id = formData.get("id") as string
  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!id || !task) {
    return { error: "ID and Task are required" }
  }

  const { data, error } = await supabase
    .from("general_todos")
    .update({ task, link: link ? prefixUrl(link) : null })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }
  return { success: true, data: data }
}

export async function toggleGeneralTodo(id: string, is_completed: boolean) {
  const { supabase } = await getSupabaseWithUser()

  const { error } = await supabase
    .from("general_todos")
    .update({ is_completed })
    .eq("id", id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteGeneralTodo(id: string): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()
  const { error } = await supabase.from("general_todos").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function updateGeneralTodoOrder(
  todos: { id: string; sort_order: number }[]
) {
  const { supabase, user } = await getSupabaseWithUser()

  const updates = todos.map((todo) =>
    supabase
      .from("general_todos")
      .update({ sort_order: todo.sort_order })
      .eq("user_id", user.id)
      .eq("id", todo.id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find((res) => res.error)

  if (firstError) {
    console.error("Error updating todo order:", firstError.error)
    return { error: firstError.error?.message }
  }

  return { success: true }
}

export async function createDailyTask(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getSupabaseWithUser()

  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!task) {
    return { error: "Task is required" }
  }

  const sortOrder = await getNextSortOrder(user.id, "daily_tasks")

  const { data, error } = await supabase
    .from("daily_tasks")
    .insert({
      user_id: user.id,
      task,
      link: link ? prefixUrl(link) : null,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }
  return { success: true, data: data }
}

export async function updateDailyTask(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()

  const id = formData.get("id") as string
  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!id || !task) {
    return { error: "ID and Task are required" }
  }

  const { data, error } = await supabase
    .from("daily_tasks")
    .update({ task, link: link ? prefixUrl(link) : null })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }
  return { success: true, data: data }
}

export async function toggleDailyTask(taskId: string, isCompleted: boolean) {
  const { supabase, user } = await getSupabaseWithUser()
  const today = new Date().toISOString().split("T")[0]

  if (isCompleted) {
    const { error } = await supabase.from("daily_task_completions").upsert(
      {
        task_id: taskId,
        user_id: user.id,
        completed_date: today,
      },
      {
        onConflict: "task_id, user_id, completed_date",
        ignoreDuplicates: true,
      }
    )
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from("daily_task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .eq("completed_date", today)
    if (error) return { error: error.message }
  }
  return { success: true }
}

export async function deleteDailyTask(id: string): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()
  const { error } = await supabase.from("daily_tasks").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function updateDailyTaskOrder(
  tasks: { id: string; sort_order: number }[]
) {
  const { supabase, user } = await getSupabaseWithUser()

  const updates = tasks.map((task) =>
    supabase
      .from("daily_tasks")
      .update({ sort_order: task.sort_order })
      .eq("user_id", user.id)
      .eq("id", task.id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find((res) => res.error)

  if (firstError) {
    console.error("Error updating daily task order:", firstError.error)
    return { error: firstError.error?.message }
  }

  return { success: true }
}
