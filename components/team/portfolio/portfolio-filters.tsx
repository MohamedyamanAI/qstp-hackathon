"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SECTORS = [
  { value: "all", label: "All sectors" },
  { value: "fintech", label: "Fintech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "edtech", label: "Edtech" },
  { value: "climate", label: "Climate" },
  { value: "saas", label: "SaaS" },
  { value: "marketplace", label: "Marketplace" },
]

const STAGES = [
  { value: "all", label: "All stages" },
  { value: "idea", label: "Idea" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "growth", label: "Growth" },
]

const HEALTH = [
  { value: "all", label: "All health" },
  { value: "healthy", label: "Healthy (75+)" },
  { value: "warning", label: "Warning (50–74)" },
  { value: "critical", label: "Critical (< 50)" },
]

const SORTS = [
  { value: "active", label: "Most active" },
  { value: "at_risk", label: "At-risk first" },
  { value: "recent", label: "Recently submitted" },
  { value: "alpha", label: "Alphabetical" },
]

export function PortfolioFilters({
  sectorOptions,
}: {
  sectorOptions?: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, start] = useTransition()

  const sectors =
    sectorOptions && sectorOptions.length > 0
      ? [
          { value: "all", label: "All sectors" },
          ...sectorOptions.map((s) => ({ value: s, label: s })),
        ]
      : SECTORS

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (!value || value === "all") next.delete(key)
      else next.set(key, value)
      start(() => {
        router.replace(`${pathname}?${next.toString()}`)
      })
    },
    [params, pathname, router]
  )

  const q = params.get("q") ?? ""
  const sector = params.get("sector") ?? "all"
  const stage = params.get("stage") ?? "all"
  const health = params.get("health") ?? "all"
  const sort = params.get("sort") ?? "active"

  const activeChips: { key: string; label: string }[] = []
  if (sector !== "all")
    activeChips.push({ key: "sector", label: `Sector: ${sector}` })
  if (stage !== "all")
    activeChips.push({
      key: "stage",
      label: `Stage: ${stage.replace("_", " ")}`,
    })
  if (health !== "all")
    activeChips.push({
      key: "health",
      label: HEALTH.find((h) => h.value === health)?.label ?? health,
    })

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search startups…"
            defaultValue={q}
            onChange={(e) => set("q", e.currentTarget.value)}
            className="ps-8"
            aria-busy={pending}
          />
        </div>
        <Select value={sector} onValueChange={(v) => set("sector", v)}>
          <SelectTrigger className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stage} onValueChange={(v) => set("stage", v)}>
          <SelectTrigger className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={health} onValueChange={(v) => set("health", v)}>
          <SelectTrigger className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEALTH.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => set(chip.key, null)}
              className="group"
            >
              <Badge variant="secondary" className="gap-1 pr-1.5">
                {chip.label}
                <span className="text-muted-foreground group-hover:text-foreground">
                  ✕
                </span>
              </Badge>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
