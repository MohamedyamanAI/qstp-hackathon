"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"
import type { Database } from "@/lib/supabase/database.types"

type Status = Database["public"]["Enums"]["opportunity_status_enum"]

const VALID: Status[] = ["new", "saved", "applied", "dismissed"]

export async function setOpportunityStatus(formData: FormData): Promise<void> {
  const { supabase, userId } = await requireRole("founder")
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as Status

  if (!id || !VALID.includes(status)) return

  const { data: opp } = await supabase
    .from("opportunities")
    .select("id, startup_id, startups:startups!opportunities_startup_id_fkey(founder_id)")
    .eq("id", id)
    .maybeSingle()

  // Allow status changes only on opps already matched to this founder's startup,
  // or on global ones — in which case we leave them global (a real impl would
  // clone into per-startup state, but we don't have that schema yet).
  if (
    opp?.startup_id &&
    opp.startups &&
    opp.startups.founder_id !== userId
  ) {
    return
  }

  await supabase.from("opportunities").update({ status }).eq("id", id)
  revalidatePath("/founder/opportunities")
}
