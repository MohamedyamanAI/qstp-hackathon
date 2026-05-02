"use client"

import { Bar, BarChart, Cell, ResponsiveContainer } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  Building03Icon,
  ChartIcon,
  DollarCircleIcon,
  Notification03Icon,
  Search01Icon,
  Settings02Icon,
  ShoppingBag03Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const NAV = ["Statistics", "Overview", "Dashboard", "Analytics"] as const
const ACTIVE = "Overview"

const KPIS = [
  {
    label: "Total earning",
    value: "540,549",
    icon: DollarCircleIcon,
    color: "var(--chart-3)",
  },
  {
    label: "Sales",
    value: "1,205,677",
    icon: ChartIcon,
    color: "var(--chart-1)",
  },
  {
    label: "Purchase",
    value: "48,430,039",
    icon: ShoppingBag03Icon,
    color: "var(--chart-5)",
  },
] as const

const PINS = [
  { city: "Berlin", value: "76,541,106", x: 60, y: 22, icon: Building03Icon },
  { city: "Chicago", value: "98,320,300", x: 22, y: 32, icon: Building03Icon },
  { city: "Manaus", value: "12,320,300", x: 32, y: 65, icon: Building03Icon },
  { city: "Giza", value: "10,547,980", x: 56, y: 44, icon: Building03Icon },
  { city: "Shanghai", value: "239,570,110", x: 80, y: 36, icon: Building03Icon },
  { city: "Queensland", value: "6,097,321", x: 86, y: 70, icon: Building03Icon },
] as const

// Sales bar chart — alternating segments to mimic the multi-color strip.
const SALES_BARS = Array.from({ length: 56 }).map((_, i) => {
  const noise = Math.sin(i * 0.7) + Math.cos(i * 0.31)
  const value = 28 + noise * 12 + (i > 14 && i < 26 ? 18 : 0)
  let band: 1 | 2 | 3 = 1
  if (i >= 9 && i < 21) band = 2
  else if (i >= 21) band = 3
  return { i, value, band }
})

function BandColor(band: 1 | 2 | 3) {
  if (band === 1) return "var(--chart-1)"
  if (band === 2) return "var(--destructive)"
  return "var(--chart-3)"
}

export function GeneralStatistics() {
  return (
    <Card className="overflow-hidden p-0">
      {/* Top bar */}
      <div className="flex items-center gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block size-5 rounded-full"
            style={{
              background:
                "conic-gradient(from 200deg, var(--chart-1), var(--chart-3), var(--chart-5), var(--chart-1))",
            }}
          />
          <span className="cn-font-heading text-sm font-semibold tracking-wide">
            ORION
          </span>
        </div>
        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              readOnly
              placeholder=""
              className="h-8 bg-muted/50 pe-8 text-xs"
            />
          </div>
        </div>
        <nav className="ms-auto hidden items-center gap-5 text-xs md:flex">
          {NAV.map((n) => (
            <span
              key={n}
              className={
                n === ACTIVE
                  ? "border-b-2 border-primary pb-1 font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {n}
            </span>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <HugeiconsIcon icon={UserIcon} className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <HugeiconsIcon icon={Settings02Icon} className="size-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
        {/* Left: KPIs */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="cn-font-heading text-2xl font-light tracking-tight">
              General statistics
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">All users</span>
              <span className="inline-flex items-center gap-0.5 tracking-wide uppercase">
                detail
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className="size-2.5"
                  strokeWidth={2.5}
                />
              </span>
            </div>
            <p className="cn-font-heading mt-1 text-4xl font-semibold tracking-tight tabular-nums">
              2,431,340
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {KPIS.map((k) => (
              <div key={k.label} className="flex items-center gap-3">
                <span
                  className="grid size-9 place-items-center rounded-xl"
                  style={{
                    background: `color-mix(in oklch, ${k.color} 18%, var(--card))`,
                    color: k.color,
                  }}
                >
                  <HugeiconsIcon icon={k.icon} className="size-4.5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground">
                    {k.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {k.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Map */}
        <div className="relative aspect-[2.1/1] w-full overflow-hidden rounded-2xl bg-muted/40">
          <HexMap />
          {PINS.map((p) => (
            <Pin key={p.city} {...p} />
          ))}
        </div>
      </div>

      {/* Donuts row */}
      <div className="grid gap-4 border-t px-6 py-5 md:grid-cols-[260px_1fr] md:gap-6">
        <div className="flex items-center gap-6">
          <DonutBadge
            percent={27}
            value="92,980"
            label="Active users"
            colorVar="--chart-5"
          />
          <DonutBadge
            percent={67}
            value="22,652"
            label="New users"
            colorVar="--chart-3"
          />
        </div>

        <div className="flex flex-col gap-2 rounded-xl border bg-card/60 p-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Sales Figures</span>
            <HugeiconsIcon icon={Notification03Icon} className="size-3.5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="cn-font-heading text-lg font-semibold tabular-nums">
              $10,430
            </span>
            <div className="h-10 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SALES_BARS}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap={2}
                >
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {SALES_BARS.map((b) => (
                      <Cell
                        key={b.i}
                        fill={BandColor(b.band)}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="-mt-1 flex h-1 overflow-hidden rounded-full">
            <span
              className="h-full"
              style={{ width: "16%", background: "var(--chart-1)" }}
            />
            <span
              className="h-full"
              style={{ width: "22%", background: "var(--destructive)" }}
            />
            <span
              className="h-full flex-1"
              style={{ background: "var(--chart-3)", opacity: 0.7 }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function HexMap() {
  // Generate a wide grid of small hex dots.
  const COLS = 60
  const ROWS = 22
  const SIZE = 6
  const W = COLS * (SIZE * 1.5) + SIZE * 2
  const H = ROWS * (SIZE * 1.732) + SIZE * 2

  // Simple landmass hot-zones (rough world layout).
  const HOTSPOTS = [
    { cx: 0.18, cy: 0.32, r: 0.1, density: 0.55 },
    { cx: 0.22, cy: 0.55, r: 0.12, density: 0.4 },
    { cx: 0.45, cy: 0.32, r: 0.07, density: 0.6 },
    { cx: 0.5, cy: 0.55, r: 0.1, density: 0.55 },
    { cx: 0.6, cy: 0.4, r: 0.08, density: 0.7 },
    { cx: 0.78, cy: 0.4, r: 0.12, density: 0.65 },
    { cx: 0.86, cy: 0.7, r: 0.07, density: 0.5 },
  ]

  const cells: { x: number; y: number; alpha: number; hot: number }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = SIZE + c * SIZE * 1.5
      const y = SIZE + r * SIZE * 1.732 + (c % 2 === 0 ? 0 : SIZE * 0.866)
      const nx = x / W
      const ny = y / H
      let intensity = 0
      for (const h of HOTSPOTS) {
        const d = Math.hypot(nx - h.cx, ny - h.cy)
        if (d < h.r) intensity = Math.max(intensity, (1 - d / h.r) * h.density)
      }
      if (intensity < 0.05) continue
      const hot = intensity > 0.45 ? 1 : 0
      cells.push({ x, y, alpha: 0.35 + intensity * 0.55, hot })
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      {cells.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={SIZE * 0.55}
          fill={
            c.hot ? "var(--destructive)" : "var(--chart-5)"
          }
          opacity={c.alpha}
        />
      ))}
    </svg>
  )
}

function Pin({
  city,
  value,
  x,
  y,
  icon,
}: {
  city: string
  value: string
  x: number
  y: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
}) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-full items-center gap-2 rounded-lg border bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className="grid size-6 place-items-center rounded-md"
        style={{
          background: "color-mix(in oklch, var(--chart-3) 25%, var(--card))",
          color: "var(--chart-3)",
        }}
      >
        <HugeiconsIcon icon={icon} className="size-3.5" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] text-muted-foreground">{city}</span>
        <span className="text-[11px] font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  )
}

function DonutBadge({
  percent,
  value,
  label,
  colorVar,
}: {
  percent: number
  value: string
  label: string
  colorVar: string
}) {
  const C = 2 * Math.PI * 16
  const dash = (percent / 100) * C
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-12 place-items-center">
        <svg viewBox="0 0 40 40" className="-rotate-90 size-12">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={`var(${colorVar})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
          />
        </svg>
        <span className="absolute text-[10px] font-semibold tabular-nums">
          {percent}%
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

