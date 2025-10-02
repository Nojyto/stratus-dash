"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Note = {
  id: string
  title: string
  content: string | null
  parent_id: string | null
  user_id: string
  created_at: string
  is_folder: boolean
}

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("notes").select()

  if (error) {
    console.error("Error fetching notes:", error)
    return []
  }

  return data as Note[]
}

export async function createNote(note: Partial<Note>): Promise<Note | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error("Error creating note:", error)
    return null
  }

  revalidatePath("/dashboard")
  return data
}

export async function updateNote(
  id: string,
  note: Partial<Note>
): Promise<Note | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notes")
    .update(note)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating note:", error)
    return null
  }

  revalidatePath("/dashboard")
  return data
}

export async function deleteNote(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase.from("notes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting note:", error)
    return { success: false }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
