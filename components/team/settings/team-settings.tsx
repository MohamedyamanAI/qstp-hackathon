"use client"

import {
  Building01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  SmartPhone01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useActionState } from "react"

import {
  type ActionState,
  updateTeamPreferences,
  updateTeamProfile,
} from "@/app/team/settings/actions"
import { PushSubscribeButton } from "@/components/notifications/push-subscribe-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type TeamSettingsData = {
  profile: {
    full_name: string
    email: string
    avatar_url: string | null
    language_preference: "en" | "ar"
    preferences: {
      department?: string
      theme?: string
      alert_severity?: string
      working_hours_only?: boolean
      notifications?: { email?: boolean; push?: boolean; whatsapp?: boolean }
    }
  }
  assignments: {
    id: string
    startup_id: string
    name: string
    sector: string
    health_score: number | null
    assigned_at: string
    logo_url: string | null
  }[]
}

export function TeamSettings({ data }: { data: TeamSettingsData }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList variant="line" className="h-auto flex-wrap justify-start">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="assignments">
          Portfolio
          <Badge variant="secondary" className="ms-1 h-4 px-1.5 text-[10px]">
            {data.assignments.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab data={data} />
      </TabsContent>
      <TabsContent value="assignments">
        <AssignmentsTab data={data} />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab data={data} />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  )
}

function ProfileTab({ data }: { data: TeamSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateTeamProfile,
    undefined
  )
  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            What founders see when you comment or send a message.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 border-b border-border/60 pb-4">
          {data.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.profile.avatar_url}
              alt=""
              className="size-16 rounded-full bg-muted ring-1 ring-border"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {(data.profile.full_name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-base font-medium">
              {data.profile.full_name || "Unnamed"}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.profile.email}
            </div>
          </div>
        </CardContent>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="full_name" label="Full name" required>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={data.profile.full_name}
              required
            />
          </Field>
          <Field id="email" label="Email">
            <Input
              id="email"
              value={data.profile.email}
              disabled
              className="opacity-70"
            />
          </Field>
          <Field id="avatar_url" label="Avatar URL">
            <Input
              id="avatar_url"
              name="avatar_url"
              defaultValue={data.profile.avatar_url ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field id="department" label="Department">
            <Input
              id="department"
              name="department"
              defaultValue={data.profile.preferences.department ?? ""}
              placeholder="Incubation, Comms, Investment…"
            />
          </Field>
          <Field id="language_preference" label="Language">
            <Select
              name="language_preference"
              defaultValue={data.profile.language_preference}
            >
              <SelectTrigger id="language_preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function AssignmentsTab({ data }: { data: TeamSettingsData }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Portfolio assignments</CardTitle>
            <CardDescription>
              Startups you oversee. Filters across the workspace narrow to these
              by default.
            </CardDescription>
          </div>
          <Badge variant="secondary">{data.assignments.length} startups</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.assignments.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-8 text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon
                icon={Building01Icon}
                className="size-5 text-muted-foreground"
              />
            </div>
            <p className="text-sm font-medium">No assignments yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your admin can assign startups to your portfolio.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {data.assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
              >
                {a.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.logo_url}
                    alt=""
                    className="size-9 shrink-0 rounded-md ring-1 ring-border"
                  />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {a.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.sector}
                  </div>
                </div>
                {a.health_score !== null ? (
                  <HealthChip score={a.health_score} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function HealthChip({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "bg-destructive/10 text-destructive"
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums ${tone}`}
    >
      {score}
    </span>
  )
}

function NotificationsTab({ data }: { data: TeamSettingsData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateTeamPreferences,
    undefined
  )
  const prefs = data.profile.preferences
  const notifs = prefs.notifications ?? {}

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            How you want to be reached for portfolio activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ChannelRow
            id="notif_email"
            label="Email"
            desc="New submissions, mentions, and at-risk alerts."
            icon={Mail01Icon}
            defaultOn={notifs.email !== false}
          />
          <Separator />
          <ChannelRow
            id="notif_push"
            label="Push"
            desc="Real-time alerts in the browser."
            icon={SmartPhone01Icon}
            defaultOn={notifs.push !== false}
          />
          <div className="ms-12 -mt-1 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Browser permission:
            </span>
            <PushSubscribeButton />
          </div>
          <Separator />
          <ChannelRow
            id="notif_whatsapp"
            label="WhatsApp"
            desc="Critical at-risk alerts only."
            icon={WhatsappIcon}
            defaultOn={!!notifs.whatsapp}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Filters & display</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="alert_severity" label="Alert severity">
            <Select
              name="alert_severity"
              defaultValue={prefs.alert_severity ?? "all"}
            >
              <SelectTrigger id="alert_severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All alerts</SelectItem>
                <SelectItem value="warning">Warning + critical</SelectItem>
                <SelectItem value="critical">Critical only</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="theme" label="Theme">
            <Select name="theme" defaultValue={prefs.theme ?? "system"}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2.5 md:col-span-2">
            <div>
              <div className="text-sm font-medium">
                Pause outside working hours
              </div>
              <p className="text-xs text-muted-foreground">
                Mute non-critical alerts on weekends and after 7pm.
              </p>
            </div>
            <Switch
              id="working_hours_only"
              name="working_hours_only"
              defaultChecked={!!prefs.working_hours_only}
            />
          </div>
        </CardContent>
      </Card>
      <SubmitRow state={state} pending={pending} />
    </form>
  )
}

function ChannelRow({
  id,
  label,
  desc,
  icon,
  defaultOn,
}: {
  id: string
  label: string
  desc: string
  icon: typeof Mail01Icon
  defaultOn: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2"
    >
      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} name={id} defaultChecked={defaultOn} />
    </label>
  )
}

function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Reset your password through the standard flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/auth/forgot-password">Send password reset email</a>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Sign out from the sidebar to end this session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">This device</Badge>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBanner({ state }: { state: ActionState }) {
  if (!state) return null
  if (state.error) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        {state.error}
      </p>
    )
  }
  if (state.ok) {
    return (
      <p className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
        Saved.
      </p>
    )
  }
  return null
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        <span>{label}</span>
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function SubmitRow({
  state,
  pending,
}: {
  state: ActionState
  pending: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <StatusBanner state={state} />
      <Button type="submit" disabled={pending} className="ml-auto">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  )
}
