"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { redeemReward } from "@/app/founder/rewards/actions"
import { Button } from "@/components/ui/button"

type Props = {
  itemId: string
  itemName: string
  cost: number
  balance: number
}

export function RedeemButton({ itemId, itemName, cost, balance }: Props) {
  const [pending, startTransition] = useTransition()
  const canAfford = balance >= cost

  function handleClick() {
    startTransition(async () => {
      const result = await redeemReward(itemId)
      if (result.ok) {
        toast.success(`Redeemed: ${itemName}`, {
          description: `−${cost.toLocaleString()} points · the QSTP team will reach out to fulfill your reward.`,
        })
      } else if (result.error === "insufficient") {
        toast.error("Not enough points", {
          description: `You need ${(cost - balance).toLocaleString()} more.`,
        })
      } else {
        toast.error("Could not redeem", {
          description: "Please try again in a moment.",
        })
      }
    })
  }

  return (
    <Button
      size="sm"
      disabled={!canAfford || pending}
      variant={canAfford ? "default" : "outline"}
      className="h-7 w-full text-xs"
      onClick={handleClick}
    >
      {pending
        ? "Redeeming…"
        : canAfford
          ? "Redeem"
          : `${(cost - balance).toLocaleString()} pts short`}
    </Button>
  )
}
