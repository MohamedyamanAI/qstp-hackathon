import {
  BookmarkAdd02Icon,
  Briefcase01Icon,
  Building01Icon,
  Calendar01Icon,
  CheckmarkSquare01Icon,
  Coins01Icon,
  IdeaIcon,
  Money01Icon,
  Rocket01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { setOpportunityStatus } from "@/app/founder/opportunities/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Database } from "@/lib/supabase/database.types"

type Category = Database["public"]["Enums"]["opportunity_category_enum"]
type Status = Database["public"]["Enums"]["opportunity_status_enum"]

export type OpportunityCardData = {
  id: string
  title: string
  description: string
  source: string
  category: Category
  status: Status
  fit_score: number | null
  deadline: string | null
}

const CATEGORY_META: Record<
  Category,
  { label: string; icon: typeof IdeaIcon; tone: string }
> = {
  grant: {
    label: "Grant",
    icon: Coins01Icon,
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  competition: {
    label: "Competition",
    icon: Rocket01Icon,
    tone: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  investor: {
    label: "Investor",
    icon: Money01Icon,
    tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  customer: {
    label: "Customer",
    icon: Building01Icon,
    tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  talent: {
    label: "Talent",
    icon: UserGroupIcon,
    tone: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
  resource: {
    label: "Resource",
    icon: Briefcase01Icon,
    tone: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
}

function daysUntil(deadline: string | null) {
  if (!deadline) return null
  const ms = new Date(deadline).getTime() - Date.now()
  return Math.ceil(ms / 86400000)
}

export function OpportunityCard({
  data,
  variant = "compact",
}: {
  data: OpportunityCardData
  variant?: "compact" | "headline"
}) {
  const meta = CATEGORY_META[data.category]
  const days = daysUntil(data.deadline)
  const urgent = days !== null && days <= 7
  const isHeadline = variant === "headline"

  return (
    <Card
      size={isHeadline ? "default" : "sm"}
      className={
        isHeadline
          ? "ring-2 ring-primary/40"
          : "transition hover:ring-foreground/30"
      }
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`gap-1 border-transparent ${meta.tone}`}
          >
            <HugeiconsIcon icon={meta.icon} className="size-3" />
            {meta.label}
          </Badge>
          {data.fit_score !== null ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
              {data.fit_score}% fit
            </span>
          ) : null}
        </div>
        <div>
          <h3
            className={
              isHeadline
                ? "text-lg font-semibold tracking-tight"
                : "text-sm font-semibold leading-snug"
            }
          >
            {data.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {data.source}
          </p>
        </div>
        <p
          className={
            isHeadline
              ? "text-sm text-muted-foreground"
              : "line-clamp-2 text-xs text-muted-foreground"
          }
        >
          {data.description}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
            {days === null
              ? "No deadline"
              : days < 0
                ? `Closed ${-days}d ago`
                : days === 0
                  ? "Due today"
                  : `${days}d left`}
          </span>
          {urgent && days !== null && days >= 0 ? (
            <Badge
              variant="outline"
              className="h-4 border-destructive/40 bg-destructive/10 text-[10px] text-destructive"
            >
              Urgent
            </Badge>
          ) : null}
          {data.status === "saved" ? (
            <Badge variant="secondary" className="h-4 text-[10px]">
              Saved
            </Badge>
          ) : null}
          {data.status === "applied" ? (
            <Badge variant="secondary" className="h-4 text-[10px]">
              Applied
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          <form action={setOpportunityStatus} className="flex">
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="status" value="applied" />
            <Button type="submit" size="sm" className="h-7 text-xs">
              Make it Happen
            </Button>
          </form>
          <form action={setOpportunityStatus} className="flex">
            <input type="hidden" name="id" value={data.id} />
            <input
              type="hidden"
              name="status"
              value={data.status === "saved" ? "new" : "saved"}
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            >
              <HugeiconsIcon icon={BookmarkAdd02Icon} className="size-3" />
              {data.status === "saved" ? "Unsave" : "Save"}
            </Button>
          </form>
          <form action={setOpportunityStatus} className="ms-auto flex">
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="status" value="dismissed" />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
            >
              Dismiss
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export const OpportunityIcons = {
  applied: CheckmarkSquare01Icon,
  saved: BookmarkAdd02Icon,
}
