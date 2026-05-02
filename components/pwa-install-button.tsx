"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useState } from "react"

import { SidebarMenuButton } from "@/components/ui/sidebar"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) {
      setInstalled(true)
      return
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (installed || !promptEvent) return null

  const handleClick = async () => {
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === "accepted") setInstalled(true)
    setPromptEvent(null)
  }

  return (
    <SidebarMenuButton onClick={handleClick} tooltip="Install app">
      <HugeiconsIcon icon={Download04Icon} />
      <span>Install app</span>
    </SidebarMenuButton>
  )
}
