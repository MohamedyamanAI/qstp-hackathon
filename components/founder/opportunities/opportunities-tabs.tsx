"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "all", label: "All" },
  { value: "grant", label: "Grants & Competitions" },
  { value: "investor", label: "Investors" },
  { value: "customer", label: "Customers" },
  { value: "talent", label: "Talent" },
  { value: "resource", label: "Resources" },
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
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
