"use client"

import {
  Analytics02Icon,
  Building01Icon,
  Calendar01Icon,
  HeartCheckIcon,
  InboxIcon,
  Logout03Icon,
  Note01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { signOut } from "@/app/auth/actions"
import { PwaInstallButton } from "@/components/pwa-install-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { href: "/team/today", label: "Today", icon: Calendar01Icon },
  { href: "/team/portfolio", label: "Portfolio", icon: Building01Icon },
  { href: "/team/submissions", label: "Submissions", icon: InboxIcon },
  { href: "/team/health", label: "Health Monitor", icon: HeartCheckIcon },
  { href: "/team/insights", label: "Insights", icon: Analytics02Icon },
  { href: "/team/reports", label: "Reports", icon: Note01Icon },
]

const FOOTER_ITEMS = [
  { href: "/team/settings", label: "Settings", icon: Settings01Icon },
]

export function TeamSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            Q
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">QSTP</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Incubation Team
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FOOTER_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={email}>
              <HugeiconsIcon icon={UserIcon} />
              <span className="truncate">{email}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <PwaInstallButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOut} className="contents">
              <SidebarMenuButton type="submit" tooltip="Sign out">
                <HugeiconsIcon icon={Logout03Icon} />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
