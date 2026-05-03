"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"

function generateToken(): string {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 24)
}

async function findStartupId(supabase: Awaited<ReturnType<typeof requireRole>>["supabase"], userId: string) {
  const { data } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", userId)
    .maybeSingle()
  return data?.id ?? null
}

export type ShareState = {
  enabled: boolean
  token: string | null
  showCapTable: boolean
  showDocuments: boolean
}

export async function getShareState(): Promise<ShareState> {
  const { supabase, userId } = await requireRole("founder")
  const startupId = await findStartupId(supabase, userId)
  if (!startupId) {
    return { enabled: false, token: null, showCapTable: true, showDocuments: true }
  }

  const { data } = await supabase
    .from("data_room_shares")
    .select("token, enabled, show_cap_table, show_documents")
    .eq("startup_id", startupId)
    .maybeSingle()

  return {
    enabled: data?.enabled ?? false,
    token: data?.token ?? null,
    showCapTable: data?.show_cap_table ?? true,
    showDocuments: data?.show_documents ?? true,
  }
}

export async function setShareEnabled(enabled: boolean): Promise<ShareState> {
  const { supabase, userId } = await requireRole("founder")
  const startupId = await findStartupId(supabase, userId)
  if (!startupId) {
    throw new Error("No startup associated with this account.")
  }

  const { data: existing } = await supabase
    .from("data_room_shares")
    .select("id, token, show_cap_table, show_documents")
    .eq("startup_id", startupId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("data_room_shares")
      .update({ enabled })
      .eq("id", existing.id)
    if (error) throw error
    revalidatePath("/founder/data-room")
    return {
      enabled,
      token: existing.token,
      showCapTable: existing.show_cap_table,
      showDocuments: existing.show_documents,
    }
  }

  const token = generateToken()
  const { error } = await supabase
    .from("data_room_shares")
    .insert({ startup_id: startupId, token, enabled })
  if (error) throw error

  revalidatePath("/founder/data-room")
  return { enabled, token, showCapTable: true, showDocuments: true }
}

export async function regenerateShareToken(): Promise<ShareState> {
  const { supabase, userId } = await requireRole("founder")
  const startupId = await findStartupId(supabase, userId)
  if (!startupId) {
    throw new Error("No startup associated with this account.")
  }

  const token = generateToken()
  const { data, error } = await supabase
    .from("data_room_shares")
    .upsert(
      { startup_id: startupId, token, enabled: true },
      { onConflict: "startup_id" }
    )
    .select("token, enabled, show_cap_table, show_documents")
    .single()

  if (error) throw error
  revalidatePath("/founder/data-room")
  return {
    enabled: data.enabled,
    token: data.token,
    showCapTable: data.show_cap_table,
    showDocuments: data.show_documents,
  }
}

export async function setShareVisibility(input: {
  showCapTable?: boolean
  showDocuments?: boolean
}): Promise<ShareState> {
  const { supabase, userId } = await requireRole("founder")
  const startupId = await findStartupId(supabase, userId)
  if (!startupId) {
    throw new Error("No startup associated with this account.")
  }

  const update: { show_cap_table?: boolean; show_documents?: boolean } = {}
  if (typeof input.showCapTable === "boolean") update.show_cap_table = input.showCapTable
  if (typeof input.showDocuments === "boolean") update.show_documents = input.showDocuments

  const { data, error } = await supabase
    .from("data_room_shares")
    .update(update)
    .eq("startup_id", startupId)
    .select("token, enabled, show_cap_table, show_documents")
    .maybeSingle()

  if (error) throw error
  revalidatePath("/founder/data-room")
  return {
    enabled: data?.enabled ?? false,
    token: data?.token ?? null,
    showCapTable: data?.show_cap_table ?? true,
    showDocuments: data?.show_documents ?? true,
  }
}
