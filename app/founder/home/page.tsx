"use client"

import * as React from "react"
import {
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Fire02Icon,
  Rocket01Icon,
  Share05Icon,
  SparklesIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const FEED = [
  {
    type: "feedback",
    title: "Team feedback on your October submission",
    body: "Strong revenue growth. Consider adding customer retention metrics next month.",
    time: "2h ago",
    color: "--chart-1",
  },
  {
    type: "opportunity",
    title: "New match: MoCI Innovation Grant",
    body: "92% fit — up to QAR 500,000 for innovative tech in healthtech or fintech.",
    time: "5h ago",
    color: "--chart-3",
  },
  {
    type: "distribution",
    title: "Investor update opened by 9 of 12 recipients",
    body: "majed@waha.vc spent 11 minutes on your data room. High intent signal.",
    time: "Yesterday",
    color: "--chart-5",
  },
] as const

/* ── KPI Visualization Data ── */

const KPI_TABS = [
  { key: "users", label: "Users" },
  { key: "revenue", label: "Revenue" },
  { key: "burn", label: "Burn" },
  { key: "runway", label: "Runway" },
  { key: "growth", label: "Growth" },
] as const

const REVENUE_MONTHS = [
  { m: "Jun", v: 92 },
  { m: "Jul", v: 110 },
  { m: "Aug", v: 124 },
  { m: "Sep", v: 138 },
  { m: "Oct", v: 151 },
  { m: "Nov", v: 158 },
  { m: "Dec", v: 170 },
  { m: "Jan", v: 184 },
]

const BURN_MONTHS = [
  { m: "Jun", v: 95 },
  { m: "Jul", v: 88 },
  { m: "Aug", v: 84 },
  { m: "Sep", v: 81 },
  { m: "Oct", v: 76 },
  { m: "Nov", v: 74 },
  { m: "Dec", v: 71 },
  { m: "Jan", v: 68 },
]

const RUNWAY_SEGMENTS = [
  { label: "Engineering", pct: 60, color: "--chart-1" },
  { label: "Go-to-market", pct: 25, color: "--chart-3" },
  { label: "Operations", pct: 15, color: "--chart-5" },
]

const GROWTH_WEEKS = [
  { w: "W1", v: 8.2 },
  { w: "W2", v: 11.4 },
  { w: "W3", v: 9.8 },
  { w: "W4", v: 14.1 },
  { w: "W5", v: 12.6 },
  { w: "W6", v: 16.3 },
  { w: "W7", v: 13.9 },
  { w: "W8", v: 18.7 },
]

export default function FounderHomePage() {
  const [activeKpi, setActiveKpi] =
    React.useState<(typeof KPI_TABS)[number]["key"]>("users")

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex items-end justify-between gap-4">
        <h1 className="cn-font-heading text-lg font-semibold tracking-tight">
          KPIs
        </h1>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-3 py-1"
            style={{
              background:
                "color-mix(in oklch, var(--chart-1) 15%, var(--card))",
              color: "var(--chart-1)",
              borderColor: "transparent",
            }}
          >
            <HugeiconsIcon icon={Fire02Icon} className="size-3.5" />
            8-month streak
          </Badge>
          <Button size="sm" className="gap-2">
            <HugeiconsIcon icon={Share05Icon} className="size-4" />
            Share Investor Link
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <HugeiconsIcon icon={Rocket01Icon} className="size-4" />
            Submit Now
          </Button>
        </div>
      </div>

      {/* Main grid: left feed + stats, right KPI viz */}
      <div className="grid grid-cols-[1fr_1fr] items-stretch gap-6">
        {/* Left: Big KPI visualization */}
        <div className="flex flex-col gap-4">
          {/* KPI switcher tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            {KPI_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKpi(tab.key)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeKpi === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeKpi === "revenue" && <RevenueViz />}
          {activeKpi === "users" && <UsersViz />}
          {activeKpi === "burn" && <BurnViz />}
          {activeKpi === "runway" && <RunwayViz />}
          {activeKpi === "growth" && <GrowthViz />}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Score + Quick action */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            {/* Founder score */}
            <div className="flex items-center gap-4 rounded-xl border bg-card/70 px-5 py-6 backdrop-blur">
              <div className="relative grid size-16 shrink-0 place-items-center">
                <svg viewBox="0 0 64 64" className="-rotate-90" style={{ width: 64, height: 64 }}>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="var(--chart-1)" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(84 / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                  />
                </svg>
                <span className="absolute cn-font-heading text-lg font-bold tabular-nums">84</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Health Score</span>
                <span className="text-[11px] text-muted-foreground">Top 18% in your QSTP cohort</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="gap-1 border-transparent text-[9px]"
                    style={{
                      background: "color-mix(in oklch, var(--chart-1) 12%, transparent)",
                      color: "var(--chart-1)",
                    }}
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} className="size-2.5" />
                    +6 pts
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-transparent text-[9px]">
                    <HugeiconsIcon icon={Fire02Icon} className="size-2.5" />
                    8-mo streak
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick action: Submit */}
            <button
              type="button"
              className="group flex w-28 flex-col items-center justify-center gap-2 rounded-xl border bg-primary/5 p-4 text-center transition hover:bg-primary/10 hover:ring-1 hover:ring-primary/30"
            >
              <span
                className="grid size-10 place-items-center rounded-lg transition group-hover:scale-110"
                style={{
                  background: "color-mix(in oklch, var(--chart-1) 20%, var(--card))",
                  color: "var(--chart-1)",
                }}
              >
                <HugeiconsIcon icon={Rocket01Icon} className="size-5" />
              </span>
              <span className="text-[11px] font-medium leading-tight">
                Submit this month&apos;s update
              </span>
            </button>
          </div>

          {/* Row 2: Wins + Points wallet */}
          <div className="grid flex-1 grid-cols-2 gap-3">
            {/* This week's wins */}
            <div className="flex flex-col gap-3 rounded-xl border bg-card/70 p-5 backdrop-blur">
              <div className="flex items-center gap-2">
                <span
                  className="grid size-8 place-items-center rounded-lg"
                  style={{
                    background: "color-mix(in oklch, var(--chart-1) 18%, var(--card))",
                    color: "var(--chart-1)",
                  }}
                >
                  <HugeiconsIcon icon={StarIcon} className="size-4" />
                </span>
                <span className="text-sm font-semibold">This week&apos;s wins</span>
              </div>
              <Separator />
              {FEED.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md"
                    style={{
                      background: `color-mix(in oklch, var(${item.color}) 15%, var(--card))`,
                      color: `var(${item.color})`,
                    }}
                  >
                    <HugeiconsIcon
                      icon={
                        item.type === "feedback"
                          ? CheckmarkCircle02Icon
                          : item.type === "opportunity"
                            ? StarIcon
                            : ArrowUpRight01Icon
                      }
                      className="size-3"
                    />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium leading-snug">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  Next submission in 12 days
                </span>
                <Progress value={68} className="ml-auto h-1 w-16" />
              </div>
            </div>

            {/* Points wallet */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border">
              {/* Blurred green background */}
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 30% 40%, hsl(90 30% 55%), hsl(100 25% 35%) 50%, hsl(110 20% 25%) 100%)",
                }}
              />
              <div className="absolute inset-0 backdrop-blur-sm" />
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                <span
                  className="grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur"
                >
                  <HugeiconsIcon icon={SparklesIcon} className="size-6 text-white" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="cn-font-heading text-3xl font-bold tabular-nums text-white">
                    1,240
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    Points Wallet
                  </span>
                </div>
                <Separator className="w-16 bg-white/20" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-white/70">
                    340 pts to Trailblazer
                  </span>
                  <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[68%] rounded-full bg-white/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Revenue: Mountain area chart ── */
function RevenueViz() {
  const data = REVENUE_MONTHS
  const max = Math.max(...data.map((d) => d.v))
  const w = 400
  const h = 360
  const padX = 30
  const padY = 20
  const plotW = w - padX * 2
  const plotH = h - padY * 2
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * plotW,
    y: padY + plotH - (d.v / max) * plotH,
  }))
  const line = points.map((p) => `${p.x},${p.y}`).join(" ")
  const area = `${padX},${padY + plotH} ${line} ${padX + plotW},${padY + plotH}`

  return (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-card/70 p-5 backdrop-blur flex flex-col">
        <div className="flex items-end gap-3 mb-3">
          <span className="cn-font-heading text-4xl font-semibold tabular-nums">
            $184k
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">MRR</span>
          <Badge
            variant="outline"
            className="mb-1.5 ml-auto gap-1 border-transparent text-xs"
            style={{
              background:
                "color-mix(in oklch, var(--chart-1) 12%, transparent)",
              color: "var(--chart-1)",
            }}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
            +12% MoM
          </Badge>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="min-h-0 flex-1 w-full">
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop
                offset="100%"
                stopColor="var(--chart-1)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={padX + plotW}
              y1={padY + plotH * (1 - f)}
              y2={padY + plotH * (1 - f)}
              stroke="var(--border)"
              strokeWidth={0.5}
            />
          ))}
          <polygon points={area} fill="url(#rev-grad)" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={3.5} fill="var(--chart-1)" />
              <circle cx={p.x} cy={p.y} r={1.5} fill="var(--card)" />
              <text
                x={p.x}
                y={padY + plotH + 14}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 9 }}
              >
                {data[i].m}
              </text>
            </g>
          ))}
          {/* Value label on last point */}
          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 10}
            textAnchor="middle"
            className="fill-foreground"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            ${data[data.length - 1].v}k
          </text>
        </svg>
        <p className="mt-2 text-[10px] text-muted-foreground">
          ARR run-rate $2.2M · Compounding ~12% month over month
        </p>
      </div>
    </>
  )
}

/* ── Users: Rising bar chart with connecting line ── */
function UsersViz() {
  return (
    <>
      <div className="flex aspect-[4/3] flex-col overflow-hidden rounded-xl border bg-card/70 backdrop-blur">
        <div className="grid flex-1 items-center gap-4 px-6 pt-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Left stat */}
          <div className="text-center md:text-right">
            <p className="cn-font-heading text-5xl font-bold tracking-tight">
              4.6<span className="text-2xl align-top">k</span>
            </p>
            <p className="mx-auto mt-3 max-w-[180px] text-xs leading-relaxed text-muted-foreground md:mx-0 md:ml-auto">
              Active users growing at 21% month over month with strong retention
              across all segments.
            </p>
          </div>

          {/* Center: silhouette stack */}
          <div className="relative mx-auto h-48 w-44">
            {[
              { x: -32, scale: 0.82, color: "var(--chart-1)", opacity: 0.45 },
              { x: -16, scale: 0.9, color: "var(--chart-3)", opacity: 0.65 },
              { x: 0, scale: 1, color: "var(--chart-1)", opacity: 1 },
              { x: 16, scale: 0.9, color: "var(--chart-3)", opacity: 0.75 },
            ].map((s, i) => (
              <PersonSilhouette
                key={i}
                className="absolute top-0 left-1/2 h-48"
                style={{
                  color: s.color,
                  opacity: s.opacity,
                  transform: `translateX(calc(-50% + ${s.x}px)) scale(${s.scale})`,
                  transformOrigin: "bottom center",
                }}
              />
            ))}
          </div>

          {/* Right stat */}
          <div className="text-center md:text-left">
            <p className="cn-font-heading text-5xl font-bold tracking-tight">
              62
            </p>
            <p className="mx-auto mt-3 max-w-[180px] text-xs leading-relaxed text-muted-foreground md:mx-0">
              Paying customers across enterprise and mid-market segments with
              118% net retention.
            </p>
          </div>
        </div>
        <p className="px-6 pb-3 pt-1 text-[10px] text-muted-foreground">
          5.6x growth since June &middot; Net retention 118%
        </p>
      </div>
    </>
  )
}

function PersonSilhouette({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 100 200"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      <circle cx="50" cy="32" r="20" />
      <path d="M18 200 C18 130, 36 92, 50 92 C64 92, 82 130, 82 200 Z" />
    </svg>
  )
}

/* ── Burn: Declining area chart (good = going down) ── */
function BurnViz() {
  const data = BURN_MONTHS
  const max = 100
  const w = 400
  const h = 360
  const padX = 30
  const padY = 20
  const plotW = w - padX * 2
  const plotH = h - padY * 2
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * plotW,
    y: padY + plotH - (d.v / max) * plotH,
  }))
  const line = points.map((p) => `${p.x},${p.y}`).join(" ")
  const area = `${padX},${padY + plotH} ${line} ${padX + plotW},${padY + plotH}`

  return (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-card/70 p-5 backdrop-blur flex flex-col">
        <div className="flex items-end gap-3 mb-3">
          <span className="cn-font-heading text-4xl font-semibold tabular-nums">
            $68k
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">
            /month burn
          </span>
          <Badge
            variant="outline"
            className="mb-1.5 ml-auto gap-1 border-transparent text-xs"
            style={{
              background:
                "color-mix(in oklch, var(--chart-1) 12%, transparent)",
              color: "var(--chart-1)",
            }}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
            -28% since Jun
          </Badge>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="min-h-0 flex-1 w-full">
          <defs>
            <linearGradient id="burn-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.3} />
              <stop
                offset="100%"
                stopColor="var(--chart-5)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={padX + plotW}
              y1={padY + plotH * (1 - f)}
              y2={padY + plotH * (1 - f)}
              stroke="var(--border)"
              strokeWidth={0.5}
            />
          ))}
          <polygon points={area} fill="url(#burn-grad)" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--chart-5)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={3} fill="var(--chart-5)" />
              <text
                x={p.x}
                y={padY + plotH + 14}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 9 }}
              >
                {data[i].m}
              </text>
            </g>
          ))}
          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 10}
            textAnchor="middle"
            className="fill-foreground"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            ${data[data.length - 1].v}k
          </text>
        </svg>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Burn down 28% from peak · Efficiency improving each quarter
        </p>
      </div>
    </>
  )
}

/* ── Runway: Donut + breakdown ── */
function RunwayViz() {
  const size = 220
  const sw = 20
  const r = (size - sw) / 2
  const C = 2 * Math.PI * r
  let offset = 0

  return (
    <>
      <div className="flex aspect-[4/3] flex-col rounded-xl border bg-card/70 p-6 backdrop-blur">
        <div className="flex items-end gap-3 mb-4">
          <span className="cn-font-heading text-4xl font-semibold tabular-nums">
            17.2
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">
            months runway
          </span>
          <Badge
            variant="outline"
            className="mb-1.5 ml-auto gap-1 border-transparent text-xs"
            style={{
              background:
                "color-mix(in oklch, var(--chart-1) 12%, transparent)",
              color: "var(--chart-1)",
            }}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
            +2.1 mo QoQ
          </Badge>
        </div>
        <div className="flex flex-1 items-center gap-8">
        {/* Donut */}
        <div
          className="relative grid shrink-0 place-items-center"
          style={{ width: size, height: size }}
        >
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            style={{ width: size, height: size }}
          >
            {RUNWAY_SEGMENTS.map((seg) => {
              const dash = (seg.pct / 100) * C
              const thisOffset = offset
              offset += dash
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={`var(${seg.color})`}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  strokeDasharray={`${dash - 4} ${C - dash + 4}`}
                  strokeDashoffset={-thisOffset}
                />
              )
            })}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="cn-font-heading text-2xl font-semibold tabular-nums">
              $343k
            </span>
            <span className="text-[10px] text-muted-foreground">balance</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-3">
          {RUNWAY_SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: `var(${seg.color})` }}
                  />
                  <span className="text-xs">{seg.label}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums">
                  {seg.pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${seg.pct}%`,
                    background: `var(${seg.color})`,
                  }}
                />
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly burn</span>
            <span className="font-semibold">$68k</span>
          </div>
        </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          At current burn rate, runway extends to Jul 2027
        </p>
      </div>
    </>
  )
}

/* ── Growth: Dot chart with trend line ── */
function GrowthViz() {
  const data = GROWTH_WEEKS
  const max = Math.max(...data.map((d) => d.v))
  const w = 400
  const h = 360
  const padX = 30
  const padY = 20
  const plotW = w - padX * 2
  const plotH = h - padY * 2
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * plotW,
    y: padY + plotH - (d.v / max) * plotH,
  }))
  // Trend line (first to last)
  const trendY1 =
    padY + plotH - (data[0].v / max) * plotH
  const trendY2 =
    padY + plotH - (data[data.length - 1].v / max) * plotH

  return (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-card/70 p-5 backdrop-blur flex flex-col">
        <div className="flex items-end gap-3 mb-3">
          <span className="cn-font-heading text-4xl font-semibold tabular-nums">
            18.7%
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">
            WoW growth
          </span>
          <Badge
            variant="outline"
            className="mb-1.5 ml-auto gap-1 border-transparent text-xs"
            style={{
              background:
                "color-mix(in oklch, var(--chart-3) 12%, transparent)",
              color: "var(--chart-3)",
            }}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
            accelerating
          </Badge>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="min-h-0 flex-1 w-full">
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={padX + plotW}
              y1={padY + plotH * (1 - f)}
              y2={padY + plotH * (1 - f)}
              stroke="var(--border)"
              strokeWidth={0.5}
            />
          ))}
          {/* Trend line */}
          <line
            x1={points[0].x}
            y1={trendY1}
            x2={points[points.length - 1].x}
            y2={trendY2}
            stroke="var(--chart-3)"
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={0.5}
          />
          {/* Bars + dots */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - 16}
                y={p.y}
                width={32}
                height={padY + plotH - p.y}
                rx={4}
                fill={
                  i === data.length - 1
                    ? "var(--chart-3)"
                    : "color-mix(in oklch, var(--chart-3) 20%, var(--card))"
                }
              />
              <circle cx={p.x} cy={p.y} r={4} fill="var(--chart-3)" />
              <circle cx={p.x} cy={p.y} r={2} fill="var(--card)" />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                style={{ fontSize: 9, fontWeight: 600 }}
                className="fill-foreground"
              >
                {data[i].v}%
              </text>
              <text
                x={p.x}
                y={padY + plotH + 14}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 9 }}
              >
                {data[i].w}
              </text>
            </g>
          ))}
        </svg>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Avg. 13.1% WoW over 8 weeks · Trending above cohort median
        </p>
      </div>
    </>
  )
}
