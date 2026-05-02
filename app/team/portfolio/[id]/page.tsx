import {
  ArrowLeft01Icon,
  Building01Icon,
  Calendar01Icon,
  Mail01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/require"
import type { Json } from "@/lib/supabase/database.types"

type Params = Promise<{ id: string }>

type ExtendedProfile = {
  legal_name_en?: string
  cr_number?: string
  incorporation_date?: string
  registered_address?: string
  tax_regime?: string
  auditor_name?: string
  logo_url?: string
  cap_table?: { name?: string; ownership_percentage?: number }[]
}

type Metrics = {
  revenue_this_month?: number
  mrr?: number
  customers_reached?: number
  biggest_win?: string
  [k: string]: Json | undefined
}

function fmt(date: string | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function num(value: number | undefined | null, prefix = "") {
  if (value === undefined || value === null) return "—"
  return `${prefix}${Number(value).toLocaleString()}`
}

export default async function StartupDetailPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const { supabase } = await requireRole("team")

  const { data: startup } = await supabase
    .from("startups")
    .select(
      "id, name, sector, stage, cohort, team_size, health_score, tier, points_balance, created_at, extended_profile, connected_integrations, founder:profiles!startups_founder_id_fkey(id, full_name, email, avatar_url)"
    )
    .eq("id", id)
    .maybeSingle()

  if (!startup) notFound()

  const { data: submissions } = await supabase
    .from("kpi_submissions")
    .select("id, status, submitted_at, period_start, period_end, metrics")
    .eq("startup_id", id)
    .order("period_end", { ascending: false })
    .limit(12)

  const ext = (startup.extended_profile as ExtendedProfile) ?? {}
  const integrations =
    (startup.connected_integrations as Record<string, boolean>) ?? {}
  const submitted = (submissions ?? []).filter(
    (s) => s.status === "submitted"
  )
  const lastSub = submitted[0]
  const lastMetrics = (lastSub?.metrics as Metrics) ?? {}

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 h-7">
          <Link href="/team/portfolio">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            Back to portfolio
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {ext.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ext.logo_url}
                  alt={startup.name}
                  className="size-14 rounded-lg ring-1 ring-border"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                  {startup.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {startup.name}
                </h1>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {startup.sector}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {startup.stage.replace("_", " ")}
                  </Badge>
                  {startup.cohort ? (
                    <Badge variant="outline">{startup.cohort}</Badge>
                  ) : null}
                  <Badge variant="outline" className="capitalize">
                    Tier · {startup.tier}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Joined QSTP {fmt(startup.created_at)} ·{" "}
                  {startup.team_size ?? 0} team members
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Health</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {startup.health_score ?? "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                  Send message
                </Button>
                <Button size="sm">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                  Schedule meeting
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 md:grid-cols-4">
            <Stat label="Last MRR" value={num(lastMetrics.mrr, "$")} />
            <Stat
              label="Last revenue"
              value={num(lastMetrics.revenue_this_month, "$")}
            />
            <Stat
              label="Customers"
              value={num(lastMetrics.customers_reached)}
            />
            <Stat label="Points" value={num(startup.points_balance)} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            <Badge variant="secondary" className="ms-1 h-4 px-1.5 text-[10px]">
              {submitted.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cap-table">Cap table</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    className="size-4 text-muted-foreground"
                  />
                  Founder
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                {startup.founder?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={startup.founder.avatar_url}
                    alt=""
                    className="size-10 rounded-full bg-muted ring-1 ring-border"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {(startup.founder?.full_name ?? "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">
                    {startup.founder?.full_name ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {startup.founder?.email}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Building01Icon}
                    className="size-4 text-muted-foreground"
                  />
                  Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-xs">
                <KV label="Legal name" value={ext.legal_name_en ?? "—"} />
                <KV label="CR / QFC" value={ext.cr_number ?? "—"} />
                <KV
                  label="Incorporation"
                  value={
                    ext.incorporation_date
                      ? fmt(ext.incorporation_date)
                      : "—"
                  }
                />
                <KV
                  label="Address"
                  value={ext.registered_address ?? "—"}
                />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Data sources currently connected.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {Object.entries(integrations).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No integrations connected yet.
                  </p>
                ) : (
                  Object.entries(integrations).map(([key, on]) => (
                    <Badge
                      key={key}
                      variant={on ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {on ? "✓" : "○"} {key.replace("_", " ")}
                    </Badge>
                  ))
                )}
              </CardContent>
            </Card>
            {lastMetrics.biggest_win ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Latest win</CardTitle>
                  <CardDescription>
                    From {fmt(lastSub?.submitted_at ?? null)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    “{String(lastMetrics.biggest_win)}”
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submission history</CardTitle>
              <CardDescription>
                The most recent {submitted.length} submitted reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                  No submitted reports yet.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {submitted.map((s, idx) => {
                    const m = (s.metrics as Metrics) ?? {}
                    return (
                      <li key={s.id}>
                        <div className="flex items-start justify-between gap-3 py-2.5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {submitted.length - idx}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {s.period_start} → {s.period_end}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Submitted {fmt(s.submitted_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="tabular-nums text-muted-foreground">
                              MRR <b className="text-foreground">{num(m.mrr, "$")}</b>
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              Rev{" "}
                              <b className="text-foreground">
                                {num(m.revenue_this_month, "$")}
                              </b>
                            </span>
                          </div>
                        </div>
                        {idx < submitted.length - 1 ? <Separator /> : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cap-table">
          <Card>
            <CardHeader>
              <CardTitle>Cap table</CardTitle>
              <CardDescription>From the founder&apos;s settings.</CardDescription>
            </CardHeader>
            <CardContent>
              {!ext.cap_table || ext.cap_table.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                  Founder hasn&apos;t added shareholders yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {ext.cap_table.map((sh, idx) => (
                    <li
                      key={`${sh.name}-${idx}`}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2"
                    >
                      <span className="text-sm font-medium">
                        {sh.name ?? "—"}
                      </span>
                      <span className="text-sm tabular-nums">
                        {Number(sh.ownership_percentage ?? 0).toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs md:grid-cols-2">
              <KV label="Tax regime" value={ext.tax_regime ?? "—"} />
              <KV label="Auditor" value={ext.auditor_name ?? "—"} />
              <KV label="CR / QFC #" value={ext.cr_number ?? "—"} />
              <KV
                label="Incorporated"
                value={
                  ext.incorporation_date ? fmt(ext.incorporation_date) : "—"
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}
