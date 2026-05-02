"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const PORTFOLIO_TREND = [
  { month: "May", revenue: 1820, target: 1700 },
  { month: "Jun", revenue: 1980, target: 1850 },
  { month: "Jul", revenue: 2120, target: 2000 },
  { month: "Aug", revenue: 2310, target: 2150 },
  { month: "Sep", revenue: 2480, target: 2300 },
  { month: "Oct", revenue: 2640, target: 2450 },
  { month: "Nov", revenue: 2810, target: 2600 },
  { month: "Dec", revenue: 2950, target: 2750 },
  { month: "Jan", revenue: 3120, target: 2900 },
  { month: "Feb", revenue: 3280, target: 3050 },
  { month: "Mar", revenue: 3520, target: 3200 },
  { month: "Apr", revenue: 3810, target: 3400 },
]

export function PortfolioTrendChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={PORTFOLIO_TREND} margin={{ top: 6, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tgt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
          <YAxis tickLine={false} axisLine={false} fontSize={10} tickFormatter={(v) => `${v / 1000}M`} />
          <Area
            type="monotone"
            dataKey="target"
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            fill="url(#tgt)"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#rev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const COHORT_VINTAGES = Array.from({ length: 18 }).map((_, i) => {
  const m = i + 1
  return {
    month: `M${m}`,
    "2023": Math.round(8 + m * 1.4 + Math.sin(m * 0.6) * 2),
    "2024": Math.round(6 + m * 2.1 + Math.cos(m * 0.4) * 2),
    "2025": m <= 9 ? Math.round(4 + m * 3.2 + Math.sin(m * 0.5) * 1.5) : null,
  }
})

export function CohortVintageChart() {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={COHORT_VINTAGES} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} interval={1} />
          <YAxis tickLine={false} axisLine={false} fontSize={10} tickFormatter={(v) => `${v}K`} />
          <Line
            type="monotone"
            dataKey="2023"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="2024"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="2025"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const SECTOR_DATA = [
  { sector: "FinTech", revenue: 980, growth: 142 },
  { sector: "HealthTech", revenue: 720, growth: 96 },
  { sector: "ClimateTech", revenue: 610, growth: 184 },
  { sector: "AI / SaaS", revenue: 540, growth: 211 },
  { sector: "Logistics", revenue: 420, growth: 58 },
  { sector: "EdTech", revenue: 280, growth: 73 },
  { sector: "Mobility", revenue: 260, growth: 41 },
]

export function SectorPerformanceChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={SECTOR_DATA}
          layout="vertical"
          margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
          <YAxis
            dataKey="sector"
            type="category"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            width={84}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {SECTOR_DATA.map((_, i) => (
              <Cell
                key={i}
                fill={`var(--chart-${(i % 5) + 1})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const HEALTH_DIST = [
  { name: "Healthy", value: 38, fill: "var(--chart-1)" },
  { name: "Stable", value: 24, fill: "var(--chart-3)" },
  { name: "Watch", value: 11, fill: "var(--chart-4)" },
  { name: "At-risk", value: 6, fill: "var(--destructive)" },
]

export function HealthDistributionChart() {
  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={HEALTH_DIST}
            dataKey="value"
            nameKey="name"
            innerRadius={32}
            outerRadius={56}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {HEALTH_DIST.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export const HEALTH_LEGEND = HEALTH_DIST
