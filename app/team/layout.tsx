import { redirect } from "next/navigation"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { TeamSidebar } from "@/components/team/team-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims) {
    redirect("/auth/login?next=/team/today")
  }

  const email = String(claims.email ?? claims.sub ?? "Team")

  return (
    <SidebarProvider>
      <TeamSidebar email={email} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            Incubation Team
          </span>
          <div className="ml-auto">
            <NotificationBell variant="header" />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
