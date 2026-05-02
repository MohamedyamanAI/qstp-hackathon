"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  ClaudeIcon,
  DiscordIcon,
  DropboxIcon,
  FacebookIcon,
  FigmaIcon,
  GoogleDriveIcon,
  GoogleGeminiIcon,
  Linkedin02Icon,
  Mail01Icon,
  NewTwitterIcon,
  Notion02Icon,
  Search01Icon,
  SlackIcon,
  SpotifyIcon,
  WhatsappIcon,
  YoutubeIcon,
  ZoomIcon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const TABS = ["All", "Communication", "Productivity", "Sales", "Social"] as const

type Brand = {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  color: string
  category: (typeof TABS)[number]
}

// Authentic brand colors.
const BRANDS = {
  slack: { color: "#4A154B", icon: SlackIcon },
  notion: { color: "#000000", icon: Notion02Icon },
  drive: { color: "#1FA463", icon: GoogleDriveIcon },
  gmail: { color: "#EA4335", icon: Mail01Icon },
  linkedin: { color: "#0A66C2", icon: Linkedin02Icon },
  twitter: { color: "#000000", icon: NewTwitterIcon },
  whatsapp: { color: "#25D366", icon: WhatsappIcon },
  facebook: { color: "#1877F2", icon: FacebookIcon },
  claude: { color: "#D97757", icon: ClaudeIcon },
  gemini: { color: "#1C69FF", icon: GoogleGeminiIcon },
  dropbox: { color: "#0061FF", icon: DropboxIcon },
  discord: { color: "#5865F2", icon: DiscordIcon },
  figma: { color: "#F24E1E", icon: FigmaIcon },
  zoom: { color: "#0B5CFF", icon: ZoomIcon },
  calendar: { color: "#1FA463", icon: Calendar01Icon },
  youtube: { color: "#FF0000", icon: YoutubeIcon },
  spotify: { color: "#1DB954", icon: SpotifyIcon },
} as const

const INTEGRATIONS: Brand[] = [
  {
    name: "Slack",
    description:
      "Send signal-based notifications, share contact context, and trigger workflows from any channel.",
    icon: BRANDS.slack.icon,
    color: BRANDS.slack.color,
    category: "Communication",
  },
  {
    name: "Notion",
    description:
      "Two-way sync of contacts, accounts, and notes between your Notion databases and the workspace.",
    icon: BRANDS.notion.icon,
    color: BRANDS.notion.color,
    category: "Productivity",
  },
  {
    name: "Google Drive",
    description:
      "Surface relevant docs and decks alongside every contact and meeting in your pipeline.",
    icon: BRANDS.drive.icon,
    color: BRANDS.drive.color,
    category: "Productivity",
  },
  {
    name: "Gmail",
    description:
      "Auto-create contacts from people you've emailed, log threads, and schedule outreach inline.",
    icon: BRANDS.gmail.icon,
    color: BRANDS.gmail.color,
    category: "Communication",
  },
  {
    name: "LinkedIn",
    description:
      "Sync profiles, capture posts, and pull high-signal updates straight into each contact's feed.",
    icon: BRANDS.linkedin.icon,
    color: BRANDS.linkedin.color,
    category: "Social",
  },
  {
    name: "X (Twitter)",
    description:
      "Watch mentions, replies, and DMs against the people you care about — straight from your inbox.",
    icon: BRANDS.twitter.icon,
    color: BRANDS.twitter.color,
    category: "Social",
  },
  {
    name: "WhatsApp",
    description:
      "Conversations as first-class records — message history, reactions, and contact data in one view.",
    icon: BRANDS.whatsapp.icon,
    color: BRANDS.whatsapp.color,
    category: "Communication",
  },
  {
    name: "Claude",
    description:
      "Use bio, location, and notes from your contacts as context for Claude prompts and workflows.",
    icon: BRANDS.claude.icon,
    color: BRANDS.claude.color,
    category: "Productivity",
  },
]

// Floating cluster — picked for visual variety in brand color hue + identity.
const FLOATERS = [
  { brand: BRANDS.gmail, x: 14, y: 36 },
  { brand: BRANDS.facebook, x: 22, y: 22 },
  { brand: BRANDS.notion, x: 30, y: 38 },
  { brand: BRANDS.slack, x: 38, y: 22 },
  { brand: BRANDS.claude, x: 46, y: 36 },
  { brand: BRANDS.linkedin, x: 54, y: 22 },
  { brand: BRANDS.twitter, x: 62, y: 36 },
  { brand: BRANDS.whatsapp, x: 70, y: 22 },
  { brand: BRANDS.figma, x: 78, y: 36 },
  { brand: BRANDS.spotify, x: 86, y: 22 },
  { brand: BRANDS.zoom, x: 18, y: 52 },
  { brand: BRANDS.discord, x: 82, y: 52 },
  { brand: BRANDS.gemini, x: 50, y: 52 },
  { brand: BRANDS.youtube, x: 34, y: 52 },
  { brand: BRANDS.calendar, x: 66, y: 52 },
  { brand: BRANDS.drive, x: 26, y: 64 },
  { brand: BRANDS.dropbox, x: 74, y: 64 },
] as const

export function IntegrationsCatalog() {
  return (
    <Card className="overflow-hidden bg-foreground p-0 text-background">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <span className="cn-font-heading text-base font-semibold tracking-wider">
          clay
        </span>
        <nav className="hidden items-center gap-5 rounded-full bg-background/8 px-5 py-1.5 text-[10px] tracking-[0.18em] uppercase md:flex">
          <span>Features</span>
          <span>Solutions</span>
          <span>Pricing</span>
          <span>Resources</span>
          <span>Company</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[10px] tracking-[0.18em] text-background uppercase"
          >
            Sign in
          </button>
          <button
            type="button"
            className="rounded-full bg-background px-3 py-1.5 text-[10px] tracking-[0.18em] text-foreground uppercase"
          >
            Get started
          </button>
        </div>
      </div>

      <div className="px-6 pb-10 text-center md:px-12">
        <h3 className="cn-font-heading mt-2 text-3xl font-light tracking-tight md:text-5xl">
          Integrations catalog
        </h3>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-background/65 md:text-sm">
          Explore a whole catalog of apps that seamlessly integrate with our
          system — bring your entire network to all your favorite tools.
        </p>

        {/* Floating brand-icon cluster */}
        <div className="relative mx-auto mt-10 h-56 w-full max-w-3xl">
          {FLOATERS.map((f, i) => (
            <BrandTile
              key={i}
              icon={f.brand.icon}
              color={f.brand.color}
              x={f.x}
              y={f.y}
            />
          ))}
          {/* surface line / ground */}
          <div
            className="absolute right-0 bottom-2 left-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklch, var(--background) 30%, transparent), transparent)",
            }}
          />
        </div>

        {/* Tabs + search */}
        <div className="mt-8 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TABS.map((t, i) => (
              <span
                key={t}
                className={
                  "rounded-full px-3 py-1 text-[10px] tracking-[0.18em] uppercase " +
                  (i === 0
                    ? "bg-background text-foreground"
                    : "border text-background/70")
                }
                style={
                  i === 0
                    ? undefined
                    : {
                        borderColor:
                          "color-mix(in oklch, var(--background) 18%, transparent)",
                      }
                }
              >
                {t}
              </span>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-background/60"
            />
            <Input
              readOnly
              placeholder="Search"
              className="h-9 border-background/15 bg-background/8 ps-9 text-xs text-background placeholder:text-background/50"
            />
          </div>
        </div>

        {/* Integration cards */}
        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((it) => (
            <div
              key={it.name}
              className="flex flex-col gap-2 rounded-xl border p-3"
              style={{
                borderColor:
                  "color-mix(in oklch, var(--background) 12%, transparent)",
                background:
                  "color-mix(in oklch, var(--background) 4%, var(--foreground))",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid size-9 place-items-center rounded-lg"
                  style={{
                    background: `color-mix(in oklch, ${it.color} 22%, var(--foreground))`,
                    border: `1px solid color-mix(in oklch, ${it.color} 35%, transparent)`,
                    color: it.color,
                  }}
                >
                  <HugeiconsIcon icon={it.icon} className="size-5" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{it.name}</span>
                  <span className="text-[9px] tracking-[0.18em] text-background/50 uppercase">
                    {it.category}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-background/65">
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function BrandTile({
  icon,
  color,
  x,
  y,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  color: string
  x: number
  y: number
}) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className="grid size-12 place-items-center rounded-2xl shadow-lg backdrop-blur-sm"
        style={{
          background: `color-mix(in oklch, ${color} 90%, var(--foreground))`,
          border: `1px solid color-mix(in oklch, ${color} 60%, transparent)`,
          color: pickIconColor(color),
        }}
      >
        <HugeiconsIcon icon={icon} className="size-6" strokeWidth={1.6} />
      </span>
      {/* reflection */}
      <span
        aria-hidden
        className="absolute top-[120%] left-1/2 size-12 rounded-2xl opacity-30 blur-sm"
        style={{
          background: `color-mix(in oklch, ${color} 90%, var(--foreground))`,
          transform: "translateX(-50%) translateY(20%) scaleY(-0.65)",
        }}
      />
    </span>
  )
}

// White icon over saturated brand tile reads better than the brand color over itself.
function pickIconColor(brand: string) {
  // Use white/near-white over all true-brand fills.
  void brand
  return "rgba(255,255,255,0.95)"
}
