"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

export function RealtimeSubmissionsRefresher() {
  const router = useRouter()
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const scheduleRefresh = () => {
      if (pendingRef.current) clearTimeout(pendingRef.current)
      pendingRef.current = setTimeout(() => {
        router.refresh()
        pendingRef.current = null
      }, 250)
    }

    const channel = supabase
      .channel("team-submissions-refresher")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kpi_submissions" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "report_assignments" },
        scheduleRefresh
      )
      .subscribe()

    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current)
      void supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
