import { redirect } from "next/navigation"

import { FounderSidebar } from "@/components/founder/founder-sidebar"
import { HeaderTitle } from "@/components/header-title"
import { NotificationBell } from "@/components/notifications/notification-bell"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { FOUNDER_HOME } from "@/lib/auth/role"
import { createClient } from "@/lib/supabase/server"

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims) {
    redirect(`/auth/login?next=${FOUNDER_HOME}`)
  }

  const email = String(claims.email ?? claims.sub ?? "Founder")

  return (
    <SidebarProvider>
      <FounderSidebar email={email} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <HeaderTitle />
          <div className="ml-auto">
            <NotificationBell variant="header" />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
