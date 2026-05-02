import {
  Award01Icon,
  Calendar01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export type StartupCardData = {
  id: string
  name: string
  sector: string
  stage: string
  team_size: number | null
  health_score: number | null
  cohort: string | null
  tier: string
  logo_url: string | null
  last_submission_at: string | null
  founder_name: string | null
  founder_avatar_url: string | null
}

function healthTone(score: number | null) {
  if (score === null)
    return {
      bg: "bg-muted",
      text: "text-muted-foreground",
      label: "—",
    }
  if (score >= 75)
    return {
      bg: "bg-emerald-500/15",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Healthy",
    }
  if (score >= 50)
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      label: "Watch",
    }
  return {
    bg: "bg-destructive/15",
    text: "text-destructive",
    label: "At-risk",
  }
}

function relativeDays(iso: string | null): string {
  if (!iso) return "Never"
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d <= 0) return "today"
  if (d === 1) return "1 day ago"
  if (d < 30) return `${d} days ago`
  const months = Math.round(d / 30)
  return months === 1 ? "1 month ago" : `${months} months ago`
}

export function StartupCard({ data }: { data: StartupCardData }) {
  const tone = healthTone(data.health_score)

  return (
    <Link href={`/team/portfolio/${data.id}`}>
      <Card
        size="sm"
        className="h-full cursor-pointer transition hover:ring-foreground/30"
      >
        <div className="flex items-start gap-3 px-3">
          {data.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo_url}
              alt={data.name}
              className={`size-11 shrink-0 rounded-lg ring-1 ring-border ${tone.bg}`}
            />
          ) : (
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${tone.bg} ${tone.text}`}
            >
              {data.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight">
                  {data.name}
                </h3>
                <p className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                  {data.founder_avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.founder_avatar_url}
                      alt=""
                      className="size-4 rounded-full bg-muted"
                    />
                  ) : null}
                  {data.founder_name ?? "—"}
                </p>
              </div>
              {data.health_score !== null ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${tone.bg} ${tone.text}`}
                >
                  {data.health_score}
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Badge variant="outline" className="h-4 text-[10px] capitalize">
                {data.sector}
              </Badge>
              <Badge variant="outline" className="h-4 text-[10px] capitalize">
                {data.stage.replace("_", " ")}
              </Badge>
              {data.cohort ? (
                <Badge variant="outline" className="h-4 text-[10px]">
                  {data.cohort}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-border/60 px-3 pt-3">
          <Stat
            icon={UserGroupIcon}
            label="Team"
            value={data.team_size != null ? String(data.team_size) : "—"}
          />
          <Stat
            icon={Calendar01Icon}
            label="Submitted"
            value={relativeDays(data.last_submission_at)}
          />
          <Stat
            icon={Award01Icon}
            label="Tier"
            value={data.tier}
            valueClassName="capitalize"
          />
        </div>
      </Card>
    </Link>
  )
}

function Stat({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof Calendar01Icon
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-3" />
        {label}
      </span>
      <span
        className={`truncate text-xs font-medium ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  )
}
