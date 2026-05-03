"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain03Icon,
  ArrowDown01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  Building01Icon,
  Coins01Icon,
  IdeaIcon,
  Leaf01Icon,
  Rocket01Icon,
  ShoppingBag03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

const KPIS = [
  {
    label: "Jobs created",
    value: "1,284",
    sub: "38% Qatari",
    icon: UserGroupIcon,
    color: "var(--chart-3)",
  },
  {
    label: "Capital raised",
    value: "$48.2M",
    sub: "T12M · 6.4× program",
    icon: Coins01Icon,
    color: "var(--chart-5)",
  },
] as const

type Region = {
  id: string
  x: number
  y: number
  name: string
  count: number
  pct: number
  topSector: string
  topGrowth: string
  qatariShare: number
  mrr: string
  health: number
  icon: typeof Building01Icon
  color: string
}

const QATAR_REGIONS: Region[] = [
  {
    id: "doha",
    x: 52,
    y: 44,
    name: "Doha",
    count: 38,
    pct: 48,
    topSector: "FinTech",
    topGrowth: "+142%",
    qatariShare: 41,
    mrr: "$2.1M",
    health: 82,
    icon: Building01Icon,
    color: "var(--chart-5)",
  },
  {
    id: "rayyan",
    x: 32,
    y: 38,
    name: "Al Rayyan",
    count: 14,
    pct: 18,
    topSector: "AI / SaaS",
    topGrowth: "+211%",
    qatariShare: 36,
    mrr: "$540K",
    health: 79,
    icon: AiBrain03Icon,
    color: "var(--chart-3)",
  },
  {
    id: "lusail",
    x: 62,
    y: 28,
    name: "Lusail",
    count: 11,
    pct: 14,
    topSector: "ClimateTech",
    topGrowth: "+184%",
    qatariShare: 45,
    mrr: "$610K",
    health: 84,
    icon: Leaf01Icon,
    color: "var(--chart-1)",
  },
  {
    id: "wakrah",
    x: 46,
    y: 64,
    name: "Al Wakrah",
    count: 10,
    pct: 13,
    topSector: "Logistics",
    topGrowth: "+58%",
    qatariShare: 71,
    mrr: "$320K",
    health: 74,
    icon: ShoppingBag03Icon,
    color: "var(--chart-3)",
  },
  {
    id: "remote",
    x: 78,
    y: 52,
    name: "Remote / Diaspora",
    count: 6,
    pct: 7,
    topSector: "EdTech",
    topGrowth: "+73%",
    qatariShare: 12,
    mrr: "$240K",
    health: 71,
    icon: Rocket01Icon,
    color: "var(--chart-1)",
  },
]

const VISION_TREND = Array.from({ length: 24 }).map((_, i) => ({
  i,
  v: 22 + Math.sin(i * 0.4) * 6 + i * 1.8,
}))

const MILESTONE_ACTIVITY = Array.from({ length: 14 }).map((_, i) => ({
  i,
  a: 16 + Math.sin(i * 0.6) * 9,
  b: 10 + Math.cos(i * 0.4) * 7,
}))

const REGION_TREND_BARS = Array.from({ length: 18 }).map((_, i) => ({
  i,
  v: 8 + Math.sin(i * 0.7) * 4 + (i > 11 ? 5 : 0),
}))

const SECTOR_ROWS = [
  { label: "FinTech", revenue: 980, growth: 142, up: true, strategic: true },
  { label: "ClimateTech", revenue: 610, growth: 184, up: true, strategic: true },
  { label: "AI / SaaS", revenue: 540, growth: 211, up: true, strategic: true },
  { label: "HealthTech", revenue: 720, growth: 96, up: true, strategic: true },
  { label: "Logistics", revenue: 420, growth: 58, up: false, strategic: false },
  { label: "EdTech", revenue: 280, growth: 73, up: true, strategic: false },
  { label: "Mobility", revenue: 260, growth: 41, up: false, strategic: false },
] as const

export function PortfolioGlobeOverview() {
  const [selectedId, setSelectedId] = React.useState<string>("wakrah")
  const selected =
    QATAR_REGIONS.find((r) => r.id === selectedId) ?? QATAR_REGIONS[0]

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left column */}
      <div
        className="col-span-12 flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-2 duration-700 lg:col-span-4"
        style={{ animationDelay: "60ms", animationFillMode: "both" }}
      >
        <div className="flex flex-col gap-1">
          <h3 className="cn-font-heading text-xl font-light tracking-tight">
            Portfolio impact
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">
              79 active startups
            </span>
            <span className="inline-flex items-center gap-0.5 tracking-wide uppercase">
              detail
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="size-2.5"
                strokeWidth={2.5}
              />
            </span>
          </div>
          <p className="cn-font-heading mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            $3.81M
          </p>
          <p className="text-[10px] text-muted-foreground">
            Aggregate portfolio MRR · +15.6% MoM
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {KPIS.map((k, i) => (
            <div
              key={k.label}
              className="flex animate-in items-center gap-3 rounded-xl border bg-card/70 px-3 py-2 backdrop-blur fade-in slide-in-from-left-2 duration-500"
              style={{
                animationDelay: `${180 + i * 80}ms`,
                animationFillMode: "both",
              }}
            >
              <span
                className="grid size-8 place-items-center rounded-lg"
                style={{
                  background: `color-mix(in oklch, ${k.color} 20%, var(--card))`,
                  color: k.color,
                }}
              >
                <HugeiconsIcon icon={k.icon} className="size-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">
                  {k.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {k.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {k.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="IP filings" value="47 patents" delta="+9 this Q" up />
          <MiniStat label="Avg health" value="78 / 100" delta="+3 pts" up />
        </div>

        <div className="rounded-xl border bg-card/70 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">
                Milestones hit · last 14 weeks
              </p>
              <p className="text-sm font-semibold tabular-nums">
                412{" "}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "var(--chart-3)" }}
                >
                  +12%
                </span>
              </p>
            </div>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MILESTONE_ACTIVITY}
                barGap={1}
                barCategoryGap={3}
              >
                <Bar
                  dataKey="a"
                  fill="var(--chart-3)"
                  radius={[2, 2, 0, 0]}
                  animationDuration={900}
                  animationBegin={200}
                >
                  {MILESTONE_ACTIVITY.map((d) => (
                    <Cell key={`a-${d.i}`} fill="var(--chart-3)" />
                  ))}
                </Bar>
                <Bar
                  dataKey="b"
                  fill="var(--chart-1)"
                  radius={[2, 2, 0, 0]}
                  animationDuration={900}
                  animationBegin={350}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Center: Globe */}
      <div
        className="relative col-span-12 animate-in fade-in zoom-in-95 duration-700 lg:col-span-5"
        style={{ animationFillMode: "both" }}
      >
        <Globe />

        {QATAR_REGIONS.map((r, i) => {
          const isSelected = r.id === selectedId
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-50 outline-none duration-500"
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                animationDelay: `${300 + i * 90}ms`,
                animationFillMode: "both",
              }}
              aria-label={`${r.name}: ${r.count} startups, ${r.pct}% of portfolio`}
              aria-pressed={isSelected}
            >
              {/* outer glow ring (selected only) */}
              {isSelected && (
                <span
                  aria-hidden
                  className="absolute inset-0 -m-3 animate-ping rounded-full"
                  style={{
                    background: r.color,
                    opacity: 0.25,
                  }}
                />
              )}
              {/* slow continuous pulse for all pins */}
              <span
                aria-hidden
                className="qstp-pin-pulse absolute inset-0 -m-1 rounded-full"
                style={{
                  background: r.color,
                  animationDelay: `${i * 200}ms`,
                }}
              />
              <span
                className={
                  "relative grid size-8 place-items-center rounded-full border bg-card shadow-md transition-all duration-200 group-hover:scale-110 group-focus-visible:scale-110 " +
                  (isSelected
                    ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                    : "")
                }
                style={{
                  color: r.color,
                  // @ts-expect-error CSS var
                  "--tw-ring-color": r.color,
                }}
              >
                <HugeiconsIcon icon={r.icon} className="size-4" />
              </span>
              <span
                aria-hidden
                className="absolute top-full left-1/2 block size-1 -translate-x-1/2 translate-y-0.5 rounded-full"
                style={{ background: r.color }}
              />
              {/* hover label */}
              <span
                className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-md border bg-card/95 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-sm backdrop-blur opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ color: r.color }}
              >
                {r.name} · {r.pct}%
              </span>
            </button>
          )
        })}

        {/* Bottom-left detail card — swaps on selection */}
        <div
          key={selected.id}
          className="absolute bottom-3 left-3 max-w-[220px] animate-in rounded-lg border bg-card/90 p-3 backdrop-blur fade-in slide-in-from-bottom-1 duration-300"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-md"
              style={{
                background: `color-mix(in oklch, ${selected.color} 20%, var(--card))`,
                color: selected.color,
              }}
            >
              <HugeiconsIcon icon={selected.icon} className="size-3.5" />
            </span>
            <p className="text-[11px] font-semibold">{selected.name}</p>
          </div>
          <p className="cn-font-heading text-lg font-semibold tabular-nums leading-tight">
            {selected.count} startups
            <span
              className="ml-1 text-[11px] font-medium"
              style={{ color: selected.color }}
            >
              · {selected.pct}%
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            {selected.pct}% of portfolio · {selected.qatariShare}% Qatari-led
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-[10px]">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Top sector</span>
              <span className="font-semibold text-foreground">
                {selected.topSector}
              </span>
              <span style={{ color: "var(--chart-3)" }}>
                {selected.topGrowth} YoY
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">MRR · health</span>
              <span className="font-semibold tabular-nums text-foreground">
                {selected.mrr}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {selected.health} / 100
              </span>
            </div>
          </div>
          <div className="mt-2 h-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGION_TREND_BARS} barCategoryGap={2}>
                <Bar
                  dataKey="v"
                  radius={[1, 1, 0, 0]}
                  animationDuration={600}
                >
                  {REGION_TREND_BARS.map((d, i) => (
                    <Cell
                      key={d.i}
                      fill={i % 2 ? selected.color : "var(--chart-1)"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="absolute top-3 right-3 rounded-lg border bg-card/85 px-2 py-1.5 text-[10px] backdrop-blur">
          <span className="text-muted-foreground">Reach</span>
          <span className="ml-1 font-semibold text-foreground tabular-nums">
            5 regions · 79 startups
          </span>
        </div>
      </div>

      {/* Right column */}
      <div
        className="col-span-12 flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-2 duration-700 lg:col-span-3"
        style={{ animationDelay: "120ms", animationFillMode: "both" }}
      >
        <div className="flex items-baseline justify-between">
          <h4 className="cn-font-heading text-sm font-semibold">
            Vision 2030 alignment
          </h4>
          <span className="text-[10px] text-muted-foreground">
            Strategic sectors
          </span>
        </div>

        <div className="rounded-xl border bg-card/70 p-3 backdrop-blur">
          <p className="cn-font-heading text-2xl font-semibold tabular-nums">
            73<span className="text-base">%</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            of portfolio in FinTech, AI, Climate, Health
          </p>
          <div className="mt-2 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISION_TREND}>
                <defs>
                  <linearGradient
                    id="vision-trend"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--chart-3)"
                  strokeWidth={1.5}
                  fill="url(#vision-trend)"
                  isAnimationActive
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl border bg-card/70 p-3 backdrop-blur">
          <div className="mb-1 grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-[9px] uppercase tracking-wider text-muted-foreground">
            <span>Sector</span>
            <span>MRR (K)</span>
            <span>YoY</span>
            <span />
          </div>
          {SECTOR_ROWS.map((r, i) => (
            <div
              key={r.label}
              className="grid animate-in grid-cols-[1fr_auto_auto_auto] items-center gap-3 fade-in duration-500 text-xs"
              style={{
                animationDelay: `${320 + i * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <span className="flex items-center gap-1.5 truncate text-foreground">
                {r.strategic ? (
                  <HugeiconsIcon
                    icon={IdeaIcon}
                    className="size-3 shrink-0"
                    style={{ color: "var(--chart-3)" }}
                  />
                ) : (
                  <span className="size-3 shrink-0" />
                )}
                {r.label}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {r.revenue}
              </span>
              <span className="font-medium tabular-nums">{r.growth}%</span>
              <HugeiconsIcon
                icon={r.up ? ArrowUp01Icon : ArrowDown01Icon}
                className="size-3"
                style={{
                  color: r.up ? "var(--chart-3)" : "var(--destructive)",
                }}
              />
            </div>
          ))}
          <p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
            <HugeiconsIcon
              icon={IdeaIcon}
              className="size-2.5"
              style={{ color: "var(--chart-3)" }}
            />
            Vision 2030 strategic sector
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DonutBadge percent={38} colorVar="--chart-5" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tabular-nums">487 jobs</span>
            <span className="text-[10px] text-muted-foreground">
              held by Qatari nationals
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DonutBadge percent={92} colorVar="--chart-3" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tabular-nums">On-time</span>
            <span className="text-[10px] text-muted-foreground">
              founder submission rate
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

function Globe() {
  return (
    <div className="relative aspect-square w-full">
      <div
        aria-hidden
        className="absolute inset-0 animate-pulse rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, color-mix(in oklch, var(--chart-3) 15%, transparent) 0%, transparent 60%)",
          animationDuration: "5s",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full border bg-gradient-to-br from-background to-muted shadow-inner"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--foreground) 6%, transparent), transparent 55%), radial-gradient(circle at 75% 80%, color-mix(in oklch, var(--foreground) 8%, transparent), transparent 60%)",
        }}
      />
      <svg
        className="absolute inset-[6%] size-[88%] rounded-full opacity-50"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <pattern
            id="globe-dots"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1.5"
              cy="1.5"
              r="0.5"
              fill="var(--muted-foreground)"
              opacity="0.5"
            />
          </pattern>
          <clipPath id="globe-clip">
            <circle cx="50" cy="50" r="49" />
          </clipPath>
        </defs>
        <g clipPath="url(#globe-clip)">
          <rect width="100" height="100" fill="url(#globe-dots)" />
        </g>
      </svg>
    </div>
  )
}

function MiniStat({
  label,
  value,
  delta,
  up,
}: {
  label: string
  value: string
  delta: string
  up: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border bg-card/70 p-3 backdrop-blur">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span
        className="inline-flex items-center gap-1 text-[10px] font-medium"
        style={{ color: up ? "var(--chart-3)" : "var(--destructive)" }}
      >
        <HugeiconsIcon
          icon={up ? ArrowUp01Icon : ArrowDown01Icon}
          className="size-2.5"
        />
        {delta}
      </span>
    </div>
  )
}

function DonutBadge({
  percent,
  colorVar,
}: {
  percent: number
  colorVar: string
}) {
  const C = 2 * Math.PI * 16
  const dash = (percent / 100) * C
  return (
    <div className="relative grid size-10 place-items-center">
      <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{
            transition: "stroke-dasharray 800ms ease-out",
          }}
        />
      </svg>
      <span className="absolute text-[9px] font-semibold tabular-nums">
        {percent}%
      </span>
    </div>
  )
}
