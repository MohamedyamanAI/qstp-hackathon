"use client"

import { usePathname } from "next/navigation"

const TEAM_TITLES: Record<string, string> = {
  "/team/today": "Today",
  "/team/portfolio": "Portfolio",
  "/team/submissions": "Submissions",
  "/team/insights": "Insights",
  "/team/reports": "Reports",
  "/team/settings": "Settings",
}

const FOUNDER_TITLES: Record<string, string> = {
  "/founder/submit": "Submit",
  "/founder/opportunities": "Unfair Advantage Finder",
  "/founder/data-room": "Data Room",
  "/founder/rewards": "Rewards",
  "/founder/settings": "Settings",
}

export function HeaderTitle() {
  const pathname = usePathname()
  const title =
    TEAM_TITLES[pathname] ?? FOUNDER_TITLES[pathname] ?? null

  if (!title) return null

  return (
    <span className="text-sm font-medium text-muted-foreground">{title}</span>
  )
}
