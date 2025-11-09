"use server"

import { absoluteUrl } from "@/lib/config"
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

  const restrictSignup = process.env.RESTRICT_SIGNUP === "true"

  if (restrictSignup) {
    const allowedEmailsEnv = process.env.ALLOWED_EMAILS

    if (!allowedEmailsEnv) {
      console.error(
        "SIGNUP ERROR: RESTRICT_SIGNUP is true, but no ALLOWED_EMAILS list is provided in .env"
      )
      return {
        error:
          "Sign-up is currently disabled. Please contact an administrator.",
      }
    }

    const allowedEmails = allowedEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())

    if (!email || !allowedEmails.includes(email.toLowerCase())) {
      return {
        error:
          "Sign-up is restricted. Please contact an administrator for access.",
      }
    }
  }

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
      emailRedirectTo: absoluteUrl("/auth/confirm?next=/protected"),
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
    redirectTo: absoluteUrl("/auth/confirm?next=/auth/update-password"),
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
