import {
  AnalyticsUpIcon,
  BookmarkAdd02Icon,
  Calendar01Icon,
  Download01Icon,
  FilterIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { InsightsChartRow } from "@/components/team/insights/insights-chart-row"
import { PortfolioEditorial } from "@/components/team/insights/portfolio-editorial"
import { PortfolioGlobeOverview } from "@/components/team/insights/portfolio-globe-overview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/require"

export default async function TeamInsightsPage() {
  await requireRole("team")

  return (
    <div className="flex flex-col gap-12">
      {/* Header strip */}
      <div className="-mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <HugeiconsIcon icon={AnalyticsUpIcon} className="size-5" />
            </span>
            <div>
              <h1 className="cn-font-heading text-xl font-semibold tracking-tight">
                Cross-portfolio insights
              </h1>
              <p className="text-xs text-muted-foreground">
                Strategic view across all 79 active startups, refreshed
                continuously.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-border/70 bg-background"
          >
            <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
            Last 12 months
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-3" />
            Updated 2h ago
          </Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
            Filters
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-8 text-xs">
            <HugeiconsIcon icon={BookmarkAdd02Icon} className="size-3.5" />
            Save view
          </Button>
        </div>
      </div>

      <PortfolioGlobeOverview />
      <InsightsChartRow />
      <PortfolioEditorial />
    </div>
  )
}
