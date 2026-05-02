"use client"

import Link from "next/link"
import dynamic from "next/dynamic"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PreviewExample = dynamic(() => import("@/components/blocks/preview"), {
  ssr: false,
})
const Preview02Example = dynamic(
  () => import("@/components/blocks/preview-02"),
  { ssr: false }
)
const InterdependenceInfographic = dynamic(
  () =>
    import(
      "@/components/blocks/dashboards/interdependence-infographic"
    ).then((m) => m.InterdependenceInfographic),
  { ssr: false }
)
const GeneralStatistics = dynamic(
  () =>
    import("@/components/blocks/dashboards/general-statistics").then(
      (m) => m.GeneralStatistics
    ),
  { ssr: false }
)
const GlobeStatistics = dynamic(
  () =>
    import("@/components/blocks/dashboards/globe-statistics").then(
      (m) => m.GlobeStatistics
    ),
  { ssr: false }
)
const DotGridComparison = dynamic(
  () =>
    import("@/components/blocks/dashboards/dot-grid-comparison").then(
      (m) => m.DotGridComparison
    ),
  { ssr: false }
)
const SilhouetteStack = dynamic(
  () =>
    import("@/components/blocks/dashboards/silhouette-stack").then(
      (m) => m.SilhouetteStack
    ),
  { ssr: false }
)
const PersonalizationDashboard = dynamic(
  () =>
    import("@/components/blocks/dashboards/personalization-dashboard").then(
      (m) => m.PersonalizationDashboard
    ),
  { ssr: false }
)
const CohortFunnel = dynamic(
  () =>
    import("@/components/blocks/dashboards/cohort-funnel").then(
      (m) => m.CohortFunnel
    ),
  { ssr: false }
)
const ProblemSolutionRadial = dynamic(
  () =>
    import("@/components/blocks/dashboards/problem-solution-radial").then(
      (m) => m.ProblemSolutionRadial
    ),
  { ssr: false }
)
const IntegrationsCatalog = dynamic(
  () =>
    import("@/components/blocks/dashboards/integrations-catalog").then(
      (m) => m.IntegrationsCatalog
    ),
  { ssr: false }
)
const PictogramComparison = dynamic(
  () =>
    import("@/components/blocks/dashboards/pictogram-comparison").then(
      (m) => m.PictogramComparison
    ),
  { ssr: false }
)
const EcoCirclesGrid = dynamic(
  () =>
    import("@/components/blocks/dashboards/eco-circles-grid").then(
      (m) => m.EcoCirclesGrid
    ),
  { ssr: false }
)

const COMPONENTS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "menubar",
  "native-select",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
] as const

const GROUPS: { title: string; description: string; items: readonly string[] }[] = [
  {
    title: "Forms & Inputs",
    description: "Capture user input with consistent validation states.",
    items: [
      "input",
      "input-group",
      "input-otp",
      "textarea",
      "select",
      "native-select",
      "combobox",
      "checkbox",
      "radio-group",
      "switch",
      "slider",
      "toggle",
      "toggle-group",
      "field",
      "label",
      "calendar",
    ],
  },
  {
    title: "Buttons & Actions",
    description: "Triggers, command surfaces and keyboard hints.",
    items: ["button", "button-group", "kbd", "command"],
  },
  {
    title: "Data Display",
    description: "Surfaces for content, status and identity.",
    items: ["card", "table", "badge", "avatar", "item", "chart", "progress"],
  },
  {
    title: "Navigation",
    description: "Move between sections and surfaces.",
    items: [
      "breadcrumb",
      "navigation-menu",
      "menubar",
      "tabs",
      "pagination",
      "sidebar",
    ],
  },
  {
    title: "Overlays",
    description: "Floating layers above the page.",
    items: [
      "dialog",
      "alert-dialog",
      "sheet",
      "drawer",
      "popover",
      "tooltip",
      "hover-card",
      "context-menu",
      "dropdown-menu",
    ],
  },
  {
    title: "Feedback",
    description: "Communicate state changes and progress.",
    items: ["alert", "sonner", "skeleton", "spinner", "empty"],
  },
  {
    title: "Layout",
    description: "Structure and rhythm of the page.",
    items: [
      "accordion",
      "collapsible",
      "aspect-ratio",
      "resizable",
      "scroll-area",
      "separator",
    ],
  },
  {
    title: "Media",
    description: "Galleries and visual containers.",
    items: ["carousel"],
  },
]

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="cn-font-heading text-lg font-semibold tracking-tight">
              Design System
            </h1>
            <p className="text-xs text-muted-foreground">
              Mira · Olive · Lime · Hugeicons · Inter
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{COMPONENTS.length} components</Badge>
            <Badge>65 compounds</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="cn-font-heading text-2xl font-semibold tracking-tight">
              Components
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Every shadcn primitive installed in this project, grouped by
              purpose. Each one is a copy-pasted, locally owned component you
              can edit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {GROUPS.map((group) => (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle>{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((name) => (
                      <li key={name}>
                        <Link
                          href={`https://ui.shadcn.com/docs/components/${name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block"
                        >
                          <Badge
                            variant="outline"
                            className="font-mono text-[11px]"
                          >
                            {name}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Full inventory</CardTitle>
              <CardDescription>
                All {COMPONENTS.length} components available under{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  @/components/ui/*
                </code>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {COMPONENTS.map((name) => (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="font-mono text-[11px]"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="cn-font-heading text-2xl font-semibold tracking-tight">
              Compound components — Preview 1
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              The default preview gallery from the Mira preset — 30 cards
              composed from the primitives above. Scroll horizontally to see
              the entire 7-column grid.
            </p>
          </div>
        </section>
      </main>

      <section className="border-t">
        <PreviewExample />
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-16 pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="cn-font-heading text-2xl font-semibold tracking-tight">
            Compound components — Preview 2
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            The second preview gallery — 35 cards covering finance, settings,
            navigation and IoT patterns.
          </p>
        </div>
      </main>

      <section className="border-t">
        <Preview02Example />
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-16 pb-20">
        <div className="flex flex-col gap-2">
          <h2 className="cn-font-heading text-2xl font-semibold tracking-tight">
            Dashboards & infographics
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Composed examples that pair the design system with realistic data —
            an analytics dashboard, a globe-style overview, and an editorial
            infographic. All three reuse the Mira tokens (olive base, lime
            primary, chart-1…5) so they re-skin with the rest of the system.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              General statistics — map view
            </h3>
            <Badge variant="outline">Inspired by Orion</Badge>
          </div>
          <GeneralStatistics />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              General statistics — globe view
            </h3>
            <Badge variant="outline">Glass surface</Badge>
          </div>
          <GlobeStatistics />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Resource interdependence — editorial
            </h3>
            <Badge variant="outline">Long-form infographic</Badge>
          </div>
          <InterdependenceInfographic />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Stat callout — dot-grid breakdown
            </h3>
            <Badge variant="outline">Editorial card</Badge>
          </div>
          <DotGridComparison />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Side-by-side stats — silhouette stack
            </h3>
            <Badge variant="outline">Comparison</Badge>
          </div>
          <SilhouetteStack />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Personalization metrics — multi-cell board
            </h3>
            <Badge variant="outline">Marketing dashboard</Badge>
          </div>
          <PersonalizationDashboard />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Cohort funnel — Millions → 1
            </h3>
            <Badge variant="outline">Segmentation diagram</Badge>
          </div>
          <CohortFunnel />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Problems &amp; solutions — radial flow
            </h3>
            <Badge variant="outline">Concept slide</Badge>
          </div>
          <ProblemSolutionRadial />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Integrations catalog — landing
            </h3>
            <Badge variant="outline">Marketing page</Badge>
          </div>
          <IntegrationsCatalog />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Pictogram comparison — 58 / 42
            </h3>
            <Badge variant="outline">Presentation slide</Badge>
          </div>
          <PictogramComparison />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="cn-font-heading text-lg font-medium">
              Sustainability stats — overlapping circles
            </h3>
            <Badge variant="outline">Editorial poster</Badge>
          </div>
          <EcoCirclesGrid />
        </div>
      </main>
    </div>
  )
}
