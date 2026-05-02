"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type Status =
  | "loading"
  | "unsupported"
  | "blocked"
  | "missing-key"
  | "subscribed"
  | "unsubscribed"

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function PushSubscribeButton() {
  const [status, setStatus] = useState<Status>("loading")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported")
      return
    }
    if (!publicKey) {
      setStatus("missing-key")
      return
    }
    if (Notification.permission === "denied") {
      setStatus("blocked")
      return
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setStatus(sub ? "subscribed" : "unsubscribed")
      })
      .catch(() => setStatus("unsubscribed"))
  }, [publicKey])

  async function handleSubscribe() {
    setPending(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "unsubscribed")
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
          .buffer as ArrayBuffer,
      })

      const json = sub.toJSON() as {
        endpoint?: string
        keys?: { p256dh?: string; auth?: string }
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to register subscription")
      }
      setStatus("subscribed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscribe failed")
    } finally {
      setPending(false)
    }
  }

  async function handleUnsubscribe() {
    setPending(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus("unsubscribed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsubscribe failed")
    } finally {
      setPending(false)
    }
  }

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        Checking…
      </Button>
    )
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        This browser does not support push notifications.
      </p>
    )
  }

  if (status === "missing-key") {
    return (
      <p className="text-sm text-muted-foreground">
        Push is not configured. Set <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>.
      </p>
    )
  }

  if (status === "blocked") {
    return (
      <p className="text-sm text-muted-foreground">
        Notifications are blocked for this site. Re-enable them in your browser
        settings.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {status === "subscribed" ? (
        <Button
          variant="outline"
          onClick={handleUnsubscribe}
          disabled={pending}
        >
          {pending ? "Unsubscribing…" : "Disable push notifications"}
        </Button>
      ) : (
        <Button onClick={handleSubscribe} disabled={pending}>
          {pending ? "Subscribing…" : "Enable push notifications"}
        </Button>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
