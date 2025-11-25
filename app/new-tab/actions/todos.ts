"use server"

import {
  getNextSortOrder,
  getSupabaseWithUser,
  updateSortOrder,
} from "@/lib/supabase/utils"
import { prefixUrl } from "@/lib/utils"
import type { FormState } from "@/types/new-tab"

type TodoTable = "general_todos" | "daily_tasks"

async function _createTask(
  formData: FormData,
  table: TodoTable
): Promise<FormState> {
  const { supabase, user } = await getSupabaseWithUser()

  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!task) {
    return { error: "Task is required" }
  }

  const sortOrder = await getNextSortOrder(user.id, table)

  const { data, error } = await supabase
    .from(table)
    .insert({
      user_id: user.id,
      task,
      link: link ? prefixUrl(link) : null,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) {
    console.error(
      `[DB Action] Error creating task for table ${table}:`,
      error.message
    )
    return { error: "Failed to create task due to a database error." }
  }
  return { success: true, data: data }
}

async function _updateTask(
  formData: FormData,
  table: TodoTable
): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()

  const id = formData.get("id") as string
  const task = formData.get("task") as string
  const link = (formData.get("link") as string) || null

  if (!id || !task) {
    return { error: "ID and Task are required" }
  }

  const { data, error } = await supabase
    .from(table)
    .update({ task, link: link ? prefixUrl(link) : null })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(
      `[DB Action] Error updating task for table ${table}:`,
      error.message
    )
    return { error: "Failed to update task due to a database error." }
  }
  return { success: true, data: data }
}

async function _deleteTask(id: string, table: TodoTable): Promise<FormState> {
  const { supabase } = await getSupabaseWithUser()
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(
      `[DB Action] Error deleting task for table ${table}:`,
      error.message
    )
    return { error: "Failed to delete task due to a database error." }
  }
  return { success: true }
}

export async function createGeneralTodo(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  return _createTask(formData, "general_todos")
}

export async function updateGeneralTodo(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  return _updateTask(formData, "general_todos")
}

export async function toggleGeneralTodo(id: string, is_completed: boolean) {
  const { supabase } = await getSupabaseWithUser()

  const { error } = await supabase
    .from("general_todos")
    .update({ is_completed })
    .eq("id", id)

  if (error) {
    console.error(`[DB Action] Error toggling general todo:`, error.message)
    return { error: "Failed to update task status due to a database error." }
  }
  return { success: true }
}

export async function deleteGeneralTodo(id: string): Promise<FormState> {
  return _deleteTask(id, "general_todos")
}

export async function updateGeneralTodoOrder(
  todos: { id: string; sort_order: number }[]
) {
  return updateSortOrder(todos, "general_todos")
}

export async function createDailyTask(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  return _createTask(formData, "daily_tasks")
}

export async function updateDailyTask(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  return _updateTask(formData, "daily_tasks")
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
    if (error) {
      console.error(
        `[DB Action] Error inserting daily task completion:`,
        error.message
      )
      return { error: "Failed to mark task complete due to a database error." }
    }
  } else {
    const { error } = await supabase
      .from("daily_task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .eq("completed_date", today)
    if (error) {
      console.error(
        `[DB Action] Error deleting daily task completion:`,
        error.message
      )
      return {
        error: "Failed to unmark task complete due to a database error.",
      }
    }
  }
  return { success: true }
}

export async function deleteDailyTask(id: string): Promise<FormState> {
  return _deleteTask(id, "daily_tasks")
}

export async function updateDailyTaskOrder(
  tasks: { id: string; sort_order: number }[]
) {
  return updateSortOrder(tasks, "daily_tasks")
}
