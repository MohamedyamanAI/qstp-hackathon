export type NotificationChannel = "in_app" | "email" | "push"

export type NotificationPayload = {
  type: string
  title: string
  message: string
  action_url?: string
  data?: Record<string, unknown>
}

export type ChannelPreferences = {
  email: boolean
  push: boolean
}

export function readChannelPreferences(
  preferences: unknown
): ChannelPreferences {
  if (
    !preferences ||
    typeof preferences !== "object" ||
    Array.isArray(preferences)
  ) {
    return { email: true, push: true }
  }
  const p = preferences as Record<string, unknown>
  const n = p.notifications
  if (!n || typeof n !== "object" || Array.isArray(n)) {
    return { email: true, push: true }
  }
  const obj = n as Record<string, unknown>
  return {
    email: obj.email !== false,
    push: obj.push !== false,
  }
}
