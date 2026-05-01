"use client"

import {
  DashboardSquare01Icon,
  Home01Icon,
  Logout03Icon,
  PaintBoardIcon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { signOut } from "@/app/auth/actions"
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
  { href: "/dashboard", label: "Overview", icon: Home01Icon },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: DashboardSquare01Icon,
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
]

const RESOURCE_ITEMS = [
  { href: "/design-system", label: "Design system", icon: PaintBoardIcon },
]

export function AppSidebar({
  email,
}: {
  email: string
}) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            Q
          </div>
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            QSTP
          </span>
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
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {RESOURCE_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
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
