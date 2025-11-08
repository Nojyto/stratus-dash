"use server"

import { createClient } from "@/lib/supabase/server"
import { FormState } from "@/types/new-tab"
import { redirect } from "next/navigation"

export async function login(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return redirect("/protected")
}

export async function signup(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const repeatPassword = formData.get("repeat-password") as string

  if (!email || !password || !repeatPassword) {
    return { error: "All fields are required" }
  }

  if (password !== repeatPassword) {
    return { error: "Passwords do not match" }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm?next=/protected`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return redirect("/auth/sign-up-success")
}

export async function forgotPassword(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm?next=/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const password = formData.get("password") as string

  if (!password) {
    return { error: "Password is required" }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return redirect("/protected")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/auth/login")
}
