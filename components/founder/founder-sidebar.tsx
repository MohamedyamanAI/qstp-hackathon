"use client"

import {
  Award01Icon,
  Folder02Icon,
  IdeaIcon,
  InboxUploadIcon,
  Logout03Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { signOut } from "@/app/auth/actions"
import { NotificationBell } from "@/components/notifications/notification-bell"
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

} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { href: "/founder/data-room", label: "Data Room", icon: Folder02Icon },
  { href: "/founder/submit", label: "Submit", icon: InboxUploadIcon },
  { href: "/founder/opportunities", label: "Opportunities", icon: IdeaIcon },
  { href: "/founder/rewards", label: "Rewards", icon: Award01Icon },
]

const FOOTER_ITEMS = [
  { href: "/founder/settings", label: "Settings", icon: Settings01Icon },
]

export function FounderSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <img
            src="/logo.png"
            alt="QSTP"
            className="size-7 shrink-0 rounded-md object-contain group-data-[collapsible=icon]:size-12"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">QSTP</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Founder
            </span>
          </div>
        </div>
      </SidebarHeader>
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
              <NotificationBell />
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
