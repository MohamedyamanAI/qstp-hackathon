"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { fetchUserRole, roleHomeFor } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

function getSiteUrl(forwardedHost?: string | null, forwardedProto?: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (forwardedHost) {
    const proto = forwardedProto ?? "https"
    return `${proto}://${forwardedHost}`
  }
  return "http://localhost:3000"
}

async function postAuthRedirect(next: string | null | undefined): Promise<never> {
  if (next && next.length > 0 && next !== "/dashboard" && next !== "/protected") redirect(next)
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId =
    typeof data?.claims?.sub === "string" ? data.claims.sub : null
  const role = userId ? await fetchUserRole(supabase, userId) : null
  redirect(roleHomeFor(role))
}

export type AuthState = { error?: string } | undefined

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "")

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  await postAuthRedirect(next)
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password !== confirm) {
    return { error: "Passwords do not match." }
  }

  const h = await headers()
  const siteUrl = getSiteUrl(
    h.get("x-forwarded-host"),
    h.get("x-forwarded-proto")
  )

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/auth/sign-up-success")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}

export async function forgotPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")

  const h = await headers()
  const siteUrl = getSiteUrl(
    h.get("x-forwarded-host"),
    h.get("x-forwarded-proto")
  )

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/auth/forgot-password-success")
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password !== confirm) {
    return { error: "Passwords do not match." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  await postAuthRedirect(null)
}
