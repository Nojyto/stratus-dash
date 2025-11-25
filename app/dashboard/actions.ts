"use server"

import { getSupabaseWithUser } from "@/lib/supabase/utils"
import type { DashboardItems, Folder, Note } from "@/types/dashboard"
import type { SupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function getDashboardItems(): Promise<DashboardItems> {
  try {
    const { supabase, user } = await getSupabaseWithUser()

    const [notesResult, foldersResult] = await Promise.all([
      supabase.from("notes").select().eq("user_id", user.id),
      supabase.from("folders").select().eq("user_id", user.id),
    ])

    if (notesResult.error) {
      console.error("[DB Action] Error fetching notes:", notesResult.error)
    }
    if (foldersResult.error) {
      console.error("[DB Action] Error fetching folders:", foldersResult.error)
    }

    return {
      notes: (notesResult.data as Note[]) ?? [],
      folders: (foldersResult.data as Folder[]) ?? [],
    }
  } catch (error) {
    console.error("[DB Action] Error in getDashboardItems:", error)
    return { notes: [], folders: [] }
  }
}

async function _deleteItem(
  supabase: SupabaseClient,
  table: "notes" | "folders",
  id: string
): Promise<{ success: boolean }> {
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`[DB Action] Error deleting ${table}:`, error)
    return { success: false }
  }
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createNote(
  note: Pick<Note, "title" | "folder_id">
): Promise<Note | null> {
  const { supabase, user } = await getSupabaseWithUser()
  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        ...note,
        content: "",
        user_id: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(`[DB Action] Error creating note:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data
}

export async function updateNote(
  id: string,
  note: Partial<Pick<Note, "title" | "content">>
): Promise<Note | null> {
  const { supabase } = await getSupabaseWithUser()
  const { data, error } = await supabase
    .from("notes")
    .update(note)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`[DB Action] Error updating note:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data
}

export async function deleteNote(id: string): Promise<{ success: boolean }> {
  const { supabase } = await getSupabaseWithUser()
  return _deleteItem(supabase, "notes", id)
}

export async function createFolder(
  folder: Pick<Folder, "name" | "parent_id">
): Promise<Folder | null> {
  const { supabase, user } = await getSupabaseWithUser()
  const { data, error } = await supabase
    .from("folders")
    .insert([{ ...folder, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error(`[DB Action] Error creating folder:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data
}

export async function updateFolder(
  id: string,
  folder: Partial<Pick<Folder, "name">>
): Promise<Folder | null> {
  const { supabase } = await getSupabaseWithUser()
  const { data, error } = await supabase
    .from("folders")
    .update(folder)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`[DB Action] Error updating folder:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data
}

export async function deleteFolder(id: string): Promise<{ success: boolean }> {
  const { supabase } = await getSupabaseWithUser()
  return _deleteItem(supabase, "folders", id)
}
