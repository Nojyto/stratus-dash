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
      console.error("Error fetching notes:", notesResult.error)
    }
    if (foldersResult.error) {
      console.error("Error fetching folders:", foldersResult.error)
    }

    return {
      notes: (notesResult.data as Note[]) ?? [],
      folders: (foldersResult.data as Folder[]) ?? [],
    }
  } catch (error) {
    console.error("Error in getDashboardItems:", error)
    return { notes: [], folders: [] }
  }
}

type TableName = "notes" | "folders"
type Item = Note | Folder
type CreateItemInput<T extends Item> = T extends Note
  ? Pick<Note, "title" | "folder_id"> & { content: string }
  : Pick<Folder, "name" | "parent_id">
type UpdateItemInput<T extends Item> = T extends Note
  ? Partial<Pick<Note, "title" | "content">>
  : Partial<Pick<Folder, "name">>

async function _createItem<T extends Item>(
  supabase: SupabaseClient,
  userId: string,
  table: TableName,
  item: CreateItemInput<T>
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .insert([{ ...item, user_id: userId }])
    .select()
    .single()

  if (error) {
    console.error(`Error creating ${table}:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data as T
}

async function _updateItem<T extends Item>(
  supabase: SupabaseClient,
  table: TableName,
  id: string,
  item: UpdateItemInput<T>
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .update(item)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating ${table}:`, error)
    return null
  }
  revalidatePath("/dashboard")
  return data as T
}

async function _deleteItem(
  supabase: SupabaseClient,
  table: TableName,
  id: string
): Promise<{ success: boolean }> {
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error deleting ${table}:`, error)
    return { success: false }
  }
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createNote(
  note: Pick<Note, "title" | "folder_id">
): Promise<Note | null> {
  const { supabase, user } = await getSupabaseWithUser()
  return _createItem<Note>(supabase, user.id, "notes", {
    ...note,
    content: "",
  })
}

export async function updateNote(
  id: string,
  note: Partial<Pick<Note, "title" | "content">>
): Promise<Note | null> {
  const { supabase } = await getSupabaseWithUser()
  return _updateItem<Note>(supabase, "notes", id, note)
}

export async function deleteNote(id: string): Promise<{ success: boolean }> {
  const { supabase } = await getSupabaseWithUser()
  return _deleteItem(supabase, "notes", id)
}

export async function createFolder(
  folder: Pick<Folder, "name" | "parent_id">
): Promise<Folder | null> {
  const { supabase, user } = await getSupabaseWithUser()
  return _createItem<Folder>(supabase, user.id, "folders", folder)
}

export async function updateFolder(
  id: string,
  folder: Partial<Pick<Folder, "name">>
): Promise<Folder | null> {
  const { supabase } = await getSupabaseWithUser()
  return _updateItem<Folder>(supabase, "folders", id, folder)
}

export async function deleteFolder(id: string): Promise<{ success: boolean }> {
  const { supabase } = await getSupabaseWithUser()
  return _deleteItem(supabase, "folders", id)
}
