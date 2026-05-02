"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import {
  AllBookmarkIcon,
  Award01Icon,
  Coins01Icon,
  CustomerService01Icon,
  UserGroupIcon,
  ToolsIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "all", label: "All", icon: AllBookmarkIcon },
  { value: "grant", label: "Grants & Competitions", icon: Award01Icon },
  { value: "investor", label: "Investors", icon: Coins01Icon },
  { value: "customer", label: "Customers", icon: CustomerService01Icon },
  { value: "talent", label: "Talent", icon: UserGroupIcon },
  { value: "resource", label: "Resources", icon: ToolsIcon },
]

export function OpportunitiesTabs({ active }: { active: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, start] = useTransition()

  function setTab(value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === "all") next.delete("category")
    else next.set("category", value)
    start(() => router.replace(`${pathname}?${next.toString()}`))
  }

  return (
    <Tabs value={active} onValueChange={setTab}>
      <TabsList variant="line" className="h-auto flex-wrap justify-start">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            <HugeiconsIcon icon={t.icon} className="size-4" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
