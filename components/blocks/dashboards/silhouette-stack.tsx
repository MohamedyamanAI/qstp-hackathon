"use client"

import { Card } from "@/components/ui/card"

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

export function SilhouetteStack() {
  return (
    <Card className="bg-card p-8 md:p-12">
      <h3 className="cn-font-heading mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
        Visual Identity Research
      </h3>

      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
        <div className="text-center md:text-right">
          <p className="cn-font-heading text-5xl font-bold tracking-tight md:text-6xl">
            30<span className="text-3xl align-top">%</span>
          </p>
          <p className="mx-auto mt-3 max-w-[240px] text-xs leading-relaxed text-muted-foreground md:mx-0 md:ml-auto">
            Research shows that applying clear and consistent visual identity
            principles significantly improves audience recognition and brand
            trust for 30% of projects.
          </p>
        </div>

        <div className="relative mx-auto h-48 w-44">
          {[
            { x: -36, scale: 0.85, color: "var(--chart-1)", opacity: 0.55 },
            { x: -18, scale: 0.92, color: "var(--chart-3)", opacity: 0.7 },
            { x: 0, scale: 1, color: "var(--chart-3)", opacity: 1 },
            { x: 18, scale: 0.92, color: "var(--chart-1)", opacity: 0.85 },
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

        <div className="text-center md:text-left">
          <p className="cn-font-heading text-5xl font-bold tracking-tight md:text-6xl">
            66<span className="text-3xl align-top">%</span>
          </p>
          <p className="mx-auto mt-3 max-w-[240px] text-xs leading-relaxed text-muted-foreground md:mx-0">
            A well-developed brand identity achieves positive results in 66% of
            cases — ensuring higher engagement and satisfaction among both
            clients and creative teams.
          </p>
        </div>
      </div>
    </Card>
  )
}
