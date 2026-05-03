"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  Coins01Icon,
  OfficeIcon,
  Rocket01Icon,
  User03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Separator } from "@/components/ui/separator"

const FOUNDERS_NEED_QATAR = [
  "Sovereign anchor customers",
  "Talent pipeline from QU & HBKU",
  "Capital from QSTP & QIA",
  "Free-zone & regulatory sandbox",
  "Gateway to GCC + MENA demand",
]

const QATAR_NEEDS_FOUNDERS = [
  "High-skill jobs for nationals",
  "IP creation in strategic sectors",
  "Knowledge-economy GDP share",
]

const POP_COLS = 20
const POP_ROWS = 4
const POP_RENDERED = 79
const HEALTHY_LIT = 62
const QATARI_LED = 30
const MALE_FOUNDERS = 45
const FEMALE_FOUNDERS = 34

const MALE_COLOR = "#3b82f6"
const FEMALE_COLOR = "#ec4899"

function StartupGrid({
  count,
  highlightVar,
}: {
  count: number
  highlightVar: string
}) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${POP_COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: POP_COLS * POP_ROWS }).map((_, i) => {
        if (i >= POP_RENDERED) return <span key={i} aria-hidden />
        const lit = i < count
        return (
          <HugeiconsIcon
            key={i}
            icon={OfficeIcon}
            className="size-3.5 animate-in fade-in zoom-in-50 duration-300"
            style={{
              color: lit ? `var(${highlightVar})` : "var(--muted-foreground)",
              opacity: lit ? 1 : 0.4,
              animationDelay: `${i * 12}ms`,
              animationFillMode: "both",
            }}
            strokeWidth={1.4}
          />
        )
      })}
    </div>
  )
}

function GenderGrid() {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${POP_COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: POP_COLS * POP_ROWS }).map((_, i) => {
        if (i >= POP_RENDERED) return <span key={i} aria-hidden />
        const isMale = i < MALE_FOUNDERS
        return (
          <HugeiconsIcon
            key={i}
            icon={User03Icon}
            className="size-3.5 animate-in fade-in zoom-in-50 duration-300"
            style={{
              color: isMale ? MALE_COLOR : FEMALE_COLOR,
              animationDelay: `${i * 12}ms`,
              animationFillMode: "both",
            }}
            strokeWidth={1.6}
          />
        )
      })}
    </div>
  )
}

export function PortfolioEditorial() {
  return (
    <div className="flex flex-col gap-10 py-2">
      {/* — Section 1 — Founders ↔ Qatar — */}
      <section
        className="grid animate-in gap-8 fade-in slide-in-from-bottom-2 duration-700 md:grid-cols-[minmax(0,200px)_1fr] md:gap-12"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex flex-col gap-3">
          <h3 className="cn-font-heading text-3xl leading-[0.95] font-light tracking-tight">
            diversified
            <br />
            <span className="font-bold">economy</span>
          </h3>
          <Separator className="w-12" />
          <p className="text-sm text-muted-foreground">
            QSTP founders and Qatar&apos;s{" "}
            <span className="font-semibold text-foreground">
              flywheel
            </span>{" "}
            beyond hydrocarbons
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
              founders need
            </p>
            <p className="cn-font-heading text-xl font-semibold">Qatar</p>
            <p className="text-xs leading-snug text-muted-foreground">
              The ecosystem QSTP convenes is what lets early-stage founders
              compound.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {FOUNDERS_NEED_QATAR.map((b, i) => (
                <li
                  key={b}
                  className="flex animate-in items-center gap-2 fade-in slide-in-from-left-2 duration-500"
                  style={{
                    animationDelay: `${200 + i * 80}ms`,
                    animationFillMode: "both",
                  }}
                >
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
              Qatar needs
            </p>
            <p className="cn-font-heading text-xl font-semibold">founders</p>
            <p className="text-xs leading-snug text-muted-foreground">
              National Vision 2030 depends on a deep, technical, exporting
              private sector.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {QATAR_NEEDS_FOUNDERS.map((b, i) => (
                <li
                  key={b}
                  className="flex animate-in items-center gap-2 fade-in slide-in-from-right-2 duration-500"
                  style={{
                    animationDelay: `${260 + i * 80}ms`,
                    animationFillMode: "both",
                  }}
                >
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

      {/* — Section 2 — Portfolio today — */}
      <section
        className="grid animate-in gap-8 fade-in slide-in-from-bottom-2 duration-700 md:grid-cols-[minmax(0,200px)_1fr] md:gap-12"
        style={{ animationDelay: "120ms", animationFillMode: "both" }}
      >
        <div className="flex flex-col gap-3">
          <h3 className="cn-font-heading text-3xl leading-[0.95] font-light tracking-tight">
            the
            <br />
            portfolio
            <br />
            <span className="font-bold">today</span>
          </h3>
          <Separator className="w-12" />
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span className="tracking-wide uppercase">legend</span>
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={OfficeIcon}
                className="size-3.5 text-foreground"
                strokeWidth={1.4}
              />
              = 1 startup
            </span>
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={User03Icon}
                className="size-3.5"
                style={{ color: MALE_COLOR }}
                strokeWidth={1.6}
              />
              <HugeiconsIcon
                icon={User03Icon}
                className="-ml-1 size-3.5"
                style={{ color: FEMALE_COLOR }}
                strokeWidth={1.6}
              />
              = 1 founder
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            of the{" "}
            <span className="font-semibold text-foreground">
              79 active startups
            </span>{" "}
            currently in QSTP programs,
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="cn-font-heading text-2xl font-semibold">
                <span style={{ color: "var(--chart-1)" }}>62 healthy</span>
              </p>
              <p className="text-sm leading-snug text-muted-foreground">
                hitting milestones on time, MRR climbing, no risk flags tripped
              </p>
              <StartupGrid count={HEALTHY_LIT} highlightVar="--chart-1" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="cn-font-heading text-2xl font-semibold">
                <span style={{ color: "var(--chart-3)" }}>30 Qatari-led</span>
              </p>
              <p className="text-sm leading-snug text-muted-foreground">
                founders holding Qatari nationality — the highest share in the
                region
              </p>
              <StartupGrid count={QATARI_LED} highlightVar="--chart-3" />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="cn-font-heading text-2xl font-semibold">
                <span style={{ color: MALE_COLOR }}>{MALE_FOUNDERS} male</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span style={{ color: FEMALE_COLOR }}>
                  {FEMALE_FOUNDERS} female
                </span>
              </p>
              <span className="text-xs tabular-nums text-muted-foreground">
                57% / 43%
              </span>
            </div>
            <p className="text-sm leading-snug text-muted-foreground">
              founder gender mix — among the highest female-founder share in
              MENA accelerators
            </p>
            <GenderGrid />
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full"
                style={{
                  width: `${(MALE_FOUNDERS / POP_RENDERED) * 100}%`,
                  background: MALE_COLOR,
                }}
              />
              <span
                className="block h-full"
                style={{
                  width: `${(FEMALE_FOUNDERS / POP_RENDERED) * 100}%`,
                  background: FEMALE_COLOR,
                }}
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Source: Founder submissions and KYC, refreshed continuously.
          </p>
        </div>
      </section>

      <Separator />

      {/* — Section 3 — 2030 forecast — */}
      <section
        className="grid animate-in gap-8 fade-in slide-in-from-bottom-2 duration-700 md:grid-cols-[minmax(0,200px)_1fr] md:gap-12"
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        <div className="flex flex-col gap-3">
          <h3 className="cn-font-heading text-3xl leading-[0.95] font-light tracking-tight">
            by
            <br />
            <span className="font-bold">2030</span>
          </h3>
          <Separator className="w-12" />
          <p className="text-sm text-muted-foreground">
            On current trajectory, two compounding outcomes for{" "}
            <span className="font-semibold text-foreground">
              National Vision 2030
            </span>
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <ForecastTile
            label="knowledge-economy revenue from QSTP alumni will grow by"
            percent={85}
            colorVar="--chart-1"
            renderIcon={({ size, color }) => (
              <HugeiconsIcon
                icon={Rocket01Icon}
                className={size === "lg" ? "size-36" : "size-16 opacity-60"}
                style={{ color }}
                strokeWidth={1.6}
              />
            )}
          />
          <ForecastTile
            label="Qatari nationals in deep-tech roles will grow by"
            percent={45}
            colorVar="--chart-3"
            renderIcon={({ size, color }) => (
              <HugeiconsIcon
                icon={UserGroupIcon}
                className={size === "lg" ? "size-36" : "size-16 opacity-60"}
                style={{ color }}
                strokeWidth={1.6}
              />
            )}
          />
        </div>
      </section>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <ArrowRightDashed />
        <span>
          $48.2M raised, 47 patents filed, 1,284 jobs created — and{" "}
          <span className="font-semibold text-foreground">compounding</span>{" "}
          <HugeiconsIcon
            icon={Coins01Icon}
            className="ml-1 inline size-3 align-[-2px] text-foreground"
          />
        </span>
      </div>
    </div>
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

function useCountUp(to: number, duration = 1400, delay = 0) {
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration, delay])
  return val
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
  const counted = useCountUp(percent, 1400, 250)
  return (
    <div className="flex flex-col gap-4">
      <p className="mt-4 max-w-[280px] text-sm leading-snug">
        {label}{" "}
        <span
          className="cn-font-heading block text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {counted}%
        </span>
      </p>
      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">2025</span>
          <div
            className="animate-in fade-in zoom-in-75 duration-700"
            style={{ animationFillMode: "both" }}
          >
            {renderIcon({ size: "sm", color })}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">2030</span>
          <div className="relative">
            <div
              className="animate-in fade-in zoom-in-50 duration-1000"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              {renderIcon({ size: "lg", color })}
            </div>
            <span
              className="absolute top-1/2 left-1/2 animate-in -translate-x-1/2 -translate-y-1/2 rounded fade-in zoom-in-50 duration-500 text-[10px] font-semibold tabular-nums text-background"
              style={{
                background: color,
                padding: "2px 4px",
                animationDelay: "1100ms",
                animationFillMode: "both",
              }}
            >
              +{counted}%
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
