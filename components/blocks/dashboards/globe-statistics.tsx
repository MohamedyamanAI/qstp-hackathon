"use client"

import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  ChartIcon,
  CreditCardIcon,
  DashboardSpeed02Icon,
  DollarCircleIcon,
  Leaf01Icon,
  Notification03Icon,
  RefreshIcon,
  Settings02Icon,
  ShoppingBag03Icon,
  SmileIcon,
  Wallet01Icon,
  Wifi02Icon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"

const SIDEBAR = [
  DashboardSpeed02Icon,
  ChartIcon,
  CreditCardIcon,
  Wallet01Icon,
  Settings02Icon,
] as const

const KPIS = [
  { label: "Dynamics", value: "540,549", icon: RefreshIcon, color: "var(--chart-5)" },
  { label: "Sales", value: "1,205,677", icon: ChartIcon, color: "var(--chart-3)" },
] as const

const GLOBE_PINS = [
  { x: 22, y: 26, icon: Leaf01Icon, color: "var(--chart-1)" },
  { x: 38, y: 36, icon: ShoppingBag03Icon, color: "var(--chart-3)" },
  { x: 50, y: 28, icon: DollarCircleIcon, color: "var(--chart-5)" },
  { x: 58, y: 48, icon: SmileIcon, color: "var(--chart-3)" },
  { x: 70, y: 32, icon: Notification03Icon, color: "var(--destructive)" },
  { x: 78, y: 60, icon: Wifi02Icon, color: "var(--chart-1)" },
] as const

const TREND = Array.from({ length: 24 }).map((_, i) => ({
  i,
  v: 30 + Math.sin(i * 0.5) * 12 + Math.cos(i * 0.7) * 8 + i * 0.6,
}))

const ACTIVITY = Array.from({ length: 14 }).map((_, i) => ({
  i,
  a: 18 + Math.sin(i * 0.6) * 10,
  b: 12 + Math.cos(i * 0.4) * 8,
}))

const MONTHLY = Array.from({ length: 18 }).map((_, i) => ({
  i,
  v: 14 + Math.sin(i * 0.8) * 6 + (i > 11 ? 6 : 0),
}))

const TABLE_ROWS = [
  { label: "Travel", a: 760, b: 2540, up: true },
  { label: "Presentation", a: 650, b: 2304, up: true },
  { label: "Finance", a: 598, b: 2140, up: false },
  { label: "Business", a: 612, b: 2140, up: true },
  { label: "Startup", a: 542, b: 1993, up: true },
  { label: "Develop", a: 476, b: 1109, up: false },
  { label: "Product", a: 412, b: 1043, up: true },
] as const

export function GlobeStatistics() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card via-muted/40 to-card p-0">
      <div className="grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col items-center gap-2 border-r bg-background/40 py-5">
          <span
            aria-hidden
            className="block size-6 rounded-full"
            style={{
              background:
                "conic-gradient(from 200deg, var(--chart-1), var(--chart-3), var(--chart-5), var(--chart-1))",
            }}
          />
          <div className="mt-3 flex flex-1 flex-col items-center gap-1">
            {SIDEBAR.map((Ic, i) => (
              <button
                key={i}
                type="button"
                className={
                  "grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent " +
                  (i === 2 ? "bg-accent text-foreground" : "")
                }
              >
                <HugeiconsIcon icon={Ic} className="size-4" />
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <span
              className="grid size-7 place-items-center rounded-full text-[10px] font-semibold text-primary-foreground"
              style={{ background: "var(--chart-5)" }}
            >
              MA
            </span>
            <HugeiconsIcon
              icon={Notification03Icon}
              className="size-4 text-muted-foreground"
            />
          </div>
        </aside>

        {/* Main */}
        <div className="grid grid-cols-12 gap-4 p-5 md:gap-6 md:p-6">
          {/* Left column */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
            <div className="flex flex-col gap-1">
              <h3 className="cn-font-heading text-xl font-light tracking-tight">
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
              <p className="cn-font-heading mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                7,541,390
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {KPIS.map((k) => (
                <div
                  key={k.label}
                  className="flex items-center gap-3 rounded-xl border bg-card/70 px-3 py-2 backdrop-blur"
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
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniStat
                label="Monthly sales"
                value="$34,000"
                delta="+10%"
                up
              />
              <MiniStat
                label="Total earning"
                value="$12,875"
                delta="+10%"
                up
              />
            </div>

            <div className="rounded-xl border bg-card/70 p-3 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    Total activity
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    3,412,875{" "}
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--chart-3)" }}
                    >
                      +10%
                    </span>
                  </p>
                </div>
              </div>
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ACTIVITY} barGap={1} barCategoryGap={3}>
                    <Bar dataKey="a" fill="var(--chart-3)" radius={[2, 2, 0, 0]}>
                      {ACTIVITY.map((d) => (
                        <Cell key={`a-${d.i}`} fill="var(--chart-3)" />
                      ))}
                    </Bar>
                    <Bar dataKey="b" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Center: Globe */}
          <div className="relative col-span-12 lg:col-span-5">
            <Globe />
            {GLOBE_PINS.map((p, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span
                  className="grid size-8 place-items-center rounded-full border bg-card shadow-md"
                  style={{ color: p.color }}
                >
                  <HugeiconsIcon icon={p.icon} className="size-4" />
                </span>
                <span
                  className="absolute top-full left-1/2 -translate-x-1/2 translate-y-0.5 block size-1 rounded-full"
                  style={{ background: p.color }}
                />
              </span>
            ))}

            <div className="absolute bottom-3 left-3 rounded-lg border bg-card/85 p-2 backdrop-blur">
              <p className="text-[10px] text-muted-foreground">Monthly sales</p>
              <p className="text-sm font-semibold tabular-nums">$34,000</p>
              <div className="mt-1 h-6 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY} barCategoryGap={2}>
                    <Bar dataKey="v" radius={[1, 1, 0, 0]}>
                      {MONTHLY.map((d, i) => (
                        <Cell
                          key={d.i}
                          fill={i % 2 ? "var(--chart-3)" : "var(--chart-1)"}
                          opacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-baseline justify-between">
              <h4 className="cn-font-heading text-sm font-semibold">
                Quantity of data
              </h4>
              <span className="text-[10px] text-muted-foreground">
                Sales trend
              </span>
            </div>

            <div className="rounded-xl border bg-card/70 p-3 backdrop-blur">
              <p className="cn-font-heading text-2xl font-semibold tabular-nums">
                64.3<span className="text-base">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Compared to $21,094 last year
              </p>
              <div className="mt-2 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND}>
                    <defs>
                      <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
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
                      fill="url(#trend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-xl border bg-card/70 p-3 backdrop-blur">
              {TABLE_ROWS.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-xs"
                >
                  <span className="truncate text-foreground">{r.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {r.a}
                  </span>
                  <span className="font-medium tabular-nums">{r.b}</span>
                  <HugeiconsIcon
                    icon={r.up ? ArrowUp01Icon : ArrowDown01Icon}
                    className="size-3"
                    style={{
                      color: r.up ? "var(--chart-3)" : "var(--destructive)",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <DonutBadge percent={27} colorVar="--chart-5" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tabular-nums">
                  92,980
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Active users
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DonutBadge percent={67} colorVar="--chart-3" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tabular-nums">
                  22,652
                </span>
                <span className="text-[10px] text-muted-foreground">
                  New users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Globe() {
  return (
    <div className="relative aspect-square w-full">
      {/* outer halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, color-mix(in oklch, var(--chart-3) 15%, transparent) 0%, transparent 60%)",
        }}
      />
      {/* sphere */}
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full border bg-gradient-to-br from-background to-muted shadow-inner"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--foreground) 6%, transparent), transparent 55%), radial-gradient(circle at 75% 80%, color-mix(in oklch, var(--foreground) 8%, transparent), transparent 60%)",
        }}
      />
      {/* dot pattern overlay (continents-ish) */}
      <svg
        className="absolute inset-[6%] size-[88%] rounded-full opacity-50"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <pattern
            id="dots"
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
          <clipPath id="circle-clip">
            <circle cx="50" cy="50" r="49" />
          </clipPath>
        </defs>
        <g clipPath="url(#circle-clip)">
          <rect width="100" height="100" fill="url(#dots)" />
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
      <svg viewBox="0 0 40 40" className="-rotate-90 size-10">
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
        />
      </svg>
      <span className="absolute text-[9px] font-semibold tabular-nums">
        {percent}%
      </span>
    </div>
  )
}
