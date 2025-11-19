"use server"

import { createClient } from "@/lib/supabase/server"
import { absoluteUrl } from "@/lib/utils"
import { FormState } from "@/types/new-tab"
import { redirect } from "next/navigation"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

const SignupSchema = z
  .object({
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    "repeat-password": z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data["repeat-password"], {
    message: "Passwords do not match",
    path: ["repeat-password"],
  })

const ForgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
})

const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
})

async function _validateSignupEmail(
  email: string
): Promise<{ error: string } | null> {
  const restrictSignup = process.env.RESTRICT_SIGNUP === "true"
  if (!restrictSignup) {
    return null
  }

  const allowedEmailsEnv = process.env.ALLOWED_EMAILS
  if (!allowedEmailsEnv) {
    console.error(
      "SIGNUP ERROR: RESTRICT_SIGNUP is true, but no ALLOWED_EMAILS list is provided in .env"
    )
    return {
      error: "Sign-up is currently disabled. Please contact an administrator.",
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

  return null
}

export async function login(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const validation = LoginSchema.safeParse(Object.fromEntries(formData))

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { email, password } = validation.data
  const supabase = await createClient()

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
  const validation = SignupSchema.safeParse(Object.fromEntries(formData))

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { email, password } = validation.data
  const supabase = await createClient()

  const emailValidationError = await _validateSignupEmail(email)
  if (emailValidationError) {
    return emailValidationError
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
  const validation = ForgotPasswordSchema.safeParse(
    Object.fromEntries(formData)
  )

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { email } = validation.data
  const supabase = await createClient()

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
  const validation = UpdatePasswordSchema.safeParse(
    Object.fromEntries(formData)
  )

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { password } = validation.data
  const supabase = await createClient()

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
