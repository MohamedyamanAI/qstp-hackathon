"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/require"

export type RedeemResult =
  | { ok: true; redemptionId: string }
  | { ok: false; error: "not_found" | "insufficient" | "unknown" }

export async function redeemReward(itemId: string): Promise<RedeemResult> {
  const { supabase, userId } = await requireRole("founder")

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", userId)
    .maybeSingle()

  if (!startup) return { ok: false, error: "not_found" }

  const { data, error } = await supabase.rpc("redeem_reward", {
    p_startup_id: startup.id,
    p_item_id: itemId,
  })

  if (error) {
    if (error.message.includes("insufficient_points")) {
      return { ok: false, error: "insufficient" }
    }
    if (
      error.message.includes("reward_item_not_found") ||
      error.message.includes("startup_not_found")
    ) {
      return { ok: false, error: "not_found" }
    }
    return { ok: false, error: "unknown" }
  }

  revalidatePath("/founder/rewards")
  revalidatePath("/founder/home")
  return { ok: true, redemptionId: data as string }
}
