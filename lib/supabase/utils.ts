"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * A helper function to create a Supabase server client and get the
 * authenticated user.
 *
 * Throws an error if the user is not authenticated.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User }>}
 */
export async function getSupabaseWithUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  return { supabase, user }
}
