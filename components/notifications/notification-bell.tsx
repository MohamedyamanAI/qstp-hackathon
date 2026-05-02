"use client"

import { Notification03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Module-level so two bell instances (sidebar + header) don't double-toast.
const toastedIds = new Set<string>()
let seeded = false

type NotificationContent = {
  title?: string
  message?: string
  action_url?: string
}

type NotificationItem = {
  id: string
  type: string
  content: NotificationContent | null
  read_at: string | null
  created_at: string
}

type Payload = { items: NotificationItem[]; unread: number }

const POLL_INTERVAL_MS = 60_000

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime()
  const diff = Date.now() - t
  const m = Math.round(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return `${d}d`
}

export function NotificationBell({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "header"
}) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const aborter = useRef<AbortController | null>(null)
  const router = useRouter()

  const refresh = useCallback(async () => {
    aborter.current?.abort()
    const ctrl = new AbortController()
    aborter.current = ctrl
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", {
        signal: ctrl.signal,
        cache: "no-store",
      })
      if (!res.ok) return
      const body = (await res.json()) as Payload

      if (!seeded) {
        // First load across all bell instances: seed so we don't toast for
        // already-existing notifications.
        seeded = true
        body.items.forEach((i) => toastedIds.add(i.id))
      } else {
        for (const item of body.items) {
          if (item.read_at) continue
          if (toastedIds.has(item.id)) continue
          toastedIds.add(item.id)
          const c = item.content ?? {}
          toast(c.title ?? "New notification", {
            description: c.message,
            action: c.action_url
              ? {
                  label: "Open",
                  onClick: () => router.push(c.action_url!),
                }
              : undefined,
          })
        }
      }

      setItems(body.items)
      setUnread(body.unread)
    } catch {
      // swallow — retry on next poll
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  async function markAllRead() {
    if (unread === 0) return
    setItems((prev) =>
      prev.map((i) =>
        i.read_at ? i : { ...i, read_at: new Date().toISOString() }
      )
    )
    setUnread(0)
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    })
  }

  async function handleClick(item: NotificationItem) {
    if (!item.read_at) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, read_at: new Date().toISOString() }
            : i
        )
      )
      setUnread((u) => Math.max(0, u - 1))
      void fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [item.id] }),
      })
    }

    const target = item.content?.action_url
    if (target) {
      setOpen(false)
      router.push(target)
    }
  }

  const popover = (
    <PopoverContent
      side={variant === "header" ? "bottom" : "right"}
      align="end"
      className="w-80 p-0"
      sideOffset={8}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-sm font-medium">Notifications</span>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>
      <ul className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {loading ? "Loading…" : "Nothing here yet."}
          </li>
        ) : (
          items.map((item) => {
            const c = item.content ?? {}
            const unreadDot = !item.read_at
            return (
              <li
                key={item.id}
                className="border-b border-border/40 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => handleClick(item)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-accent"
                >
                  <span
                    className={`mt-1.5 inline-block size-1.5 shrink-0 rounded-full ${
                      unreadDot ? "bg-primary" : "bg-transparent"
                    }`}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.title ?? item.type}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    {c.message ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {c.message}
                      </p>
                    ) : null}
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </PopoverContent>
  )

  if (variant === "header") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Notifications"
          >
            <HugeiconsIcon icon={Notification03Icon} className="size-4" />
            {unread > 0 ? (
              <Badge
                variant="default"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
              >
                {unread > 99 ? "99+" : unread}
              </Badge>
            ) : null}
          </button>
        </PopoverTrigger>
        {popover}
      </Popover>
    )
  }

  return (
    <SidebarMenuItem>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton tooltip="Notifications">
            <HugeiconsIcon icon={Notification03Icon} />
            <span>Notifications</span>
            {unread > 0 ? (
              <Badge
                variant="default"
                className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]"
              >
                {unread > 99 ? "99+" : unread}
              </Badge>
            ) : null}
          </SidebarMenuButton>
        </PopoverTrigger>
        {popover}
      </Popover>
    </SidebarMenuItem>
  )
}
