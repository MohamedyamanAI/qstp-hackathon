"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  BulbIcon,
  User03Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const ENERGY_BULLETS = [
  "Hydropower",
  "Thermoelectric cooling",
  "Power plant operations",
  "Fuel extraction & refining",
  "Fuel production",
]

const WATER_BULLETS = ["Extraction", "Treatment", "Transportation"]

// 12 cols × 5 rows = 60 figures @ 100M each → 6B sample population.
const POP_ROWS = 5
const POP_COLS = 12
const POP_TOTAL = POP_ROWS * POP_COLS
const ELECTRICITY_LIT = 25
const WATER_LIT = 28

function DropletIcon({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M12 2.5c3.5 4.5 6.5 8.2 6.5 12a6.5 6.5 0 1 1-13 0c0-3.8 3-7.5 6.5-12Z" />
      <path d="M8.5 18.5 A4.5 4.5 0 0 1 13 14 L13 18.5 A4.5 4.5 0 0 1 8.5 18.5Z" fill="white" opacity="0.4" />
    </svg>
  )
}

function PeopleRow({
  count,
  highlightVar,
}: {
  count: number
  highlightVar: string
}) {
  return (
    <div className="grid grid-cols-12 gap-1">
      {Array.from({ length: POP_TOTAL }).map((_, i) => {
        const lit = i < count
        return (
          <HugeiconsIcon
            key={i}
            icon={User03Icon}
            className="size-3.5"
            style={{
              color: lit ? `var(${highlightVar})` : "var(--muted-foreground)",
              opacity: lit ? 1 : 0.35,
            }}
            strokeWidth={2}
          />
        )
      })}
    </div>
  )
}

export function InterdependenceInfographic() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-10 p-6 md:p-10">
        {/* — Section 1 — Interdependence — */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,180px)_1fr] md:gap-12">
          <div className="flex flex-col gap-3">
            <h3 className="cn-font-heading text-3xl leading-[0.95] font-light tracking-tight">
              thirsty
              <br />
              <span className="font-bold">energy</span>
            </h3>
            <Separator className="w-12" />
            <p className="text-sm text-muted-foreground">
              energy and water&apos;s{" "}
              <span className="font-semibold text-foreground">
                interdependence
              </span>
            </p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden md:block"
            >
              <div className="absolute top-1/2 left-[32%] -translate-x-1/2 -translate-y-1/2">
                <RadialStack colorVar="--chart-3" />
              </div>
              <div className="absolute top-1/2 left-[68%] -translate-x-1/2 -translate-y-1/2">
                <RadialStack colorVar="--chart-1" />
              </div>
            </div>

            <div className="relative flex flex-col gap-2 md:pr-6">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                energy needs
              </p>
              <p className="cn-font-heading text-xl font-semibold">water</p>
              <p className="text-xs leading-snug text-muted-foreground">
                Energy production processes require water.
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {ENERGY_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: "var(--chart-3)" }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex flex-col gap-2 md:pl-6">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                water needs
              </p>
              <p className="cn-font-heading text-xl font-semibold">energy</p>
              <p className="text-xs leading-snug text-muted-foreground">
                Water production, processing, distribution and end-use require
                energy.
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {WATER_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: "var(--chart-1)" }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Separator />

        {/* — Section 2 — Global challenge — */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,180px)_1fr] md:gap-12">
          <div className="flex flex-col gap-3">
            <h3 className="cn-font-heading text-3xl leading-[0.95] font-light tracking-tight">
              the
              <br />
              global
              <br />
              <span className="font-bold">challenge</span>
            </h3>
            <Separator className="w-12" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="tracking-wide uppercase">legend</span>
              <span className="ml-2 inline-flex items-center gap-1">
                <HugeiconsIcon
                  icon={User03Icon}
                  className="size-3.5 text-foreground"
                  strokeWidth={2}
                />
                = 100M
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              of the{" "}
              <span className="font-semibold text-foreground">
                7 billion people
              </span>{" "}
              on Earth today,
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className="cn-font-heading text-2xl font-semibold">
                  <span style={{ color: "var(--chart-1)" }}>2.5 Billion</span>
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  have unreliable or no access to electricity
                </p>
                <PeopleRow count={ELECTRICITY_LIT} highlightVar="--chart-1" />
              </div>
              <div className="flex flex-col gap-3">
                <p className="cn-font-heading text-2xl font-semibold">
                  <span style={{ color: "var(--chart-3)" }}>2.8 Billion</span>
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  live in areas of high water stress
                </p>
                <PeopleRow count={WATER_LIT} highlightVar="--chart-3" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Source: IEA &amp; WWAP, illustrative.
            </p>
          </div>
        </section>

        <Separator />

        {/* — Section 3 — 2035 forecast — */}
        <section className="grid gap-8 md:grid-cols-2">
          <ForecastTile
            label="By 2035, energy consumption will increase by"
            percent={35}
            colorVar="--chart-1"
            renderIcon={({ size, color }) => (
              <HugeiconsIcon
                icon={BulbIcon}
                className={size === "lg" ? "size-36" : "size-16 opacity-60"}
                style={{ color }}
                strokeWidth={1.6}
              />
            )}
          />
          <ForecastTile
            label="which will increase water consumption by"
            percent={85}
            colorVar="--chart-3"
            renderIcon={({ size, color }) => (
              <DropletIcon
                className={size === "lg" ? "size-36" : "size-16 opacity-60"}
                style={{ color }}
              />
            )}
          />
        </section>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <ArrowRightDashed />
          <span>
            increasing pressure on{" "}
            <span className="font-semibold text-foreground">
              finite water resources
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function RadialStack({ colorVar }: { colorVar: string }) {
  return (
    <div className="relative size-[260px] opacity-90">
      {[1, 0.78, 0.6, 0.44, 0.3, 0.18].map((scale, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 260 * scale,
            height: 260 * scale,
            background: `var(${colorVar})`,
            opacity: 0.12 + i * 0.04,
            mixBlendMode: "multiply",
          }}
        />
      ))}
    </div>
  )
}

function ForecastTile({
  label,
  percent,
  colorVar,
  renderIcon,
}: {
  label: string
  percent: number
  colorVar: string
  renderIcon: (args: { size: "sm" | "lg"; color: string }) => React.ReactNode
}) {
  const color = `var(${colorVar})`
  return (
    <div className="flex flex-col gap-4">
      <p className="mt-4 max-w-[260px] text-sm leading-snug">
        {label}{" "}
        <span
          className="cn-font-heading block text-3xl font-bold"
          style={{ color }}
        >
          {percent}%
        </span>
      </p>
      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">2010</span>
          {renderIcon({ size: "sm", color })}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">2035</span>
          <div className="relative">
            {renderIcon({ size: "lg", color })}
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded text-[10px] font-semibold text-background"
              style={{
                background: color,
                padding: "2px 4px",
              }}
            >
              +{percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowRightDashed() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="block h-px w-10 border-t border-dashed border-current" />
      <HugeiconsIcon icon={ArrowRight02Icon} className="size-3" />
    </span>
  )
}
