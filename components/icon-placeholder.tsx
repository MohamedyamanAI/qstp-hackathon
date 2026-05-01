"use client"

import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as HugeIcons from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

type Props = {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
} & Omit<React.ComponentProps<"svg">, "ref">

const cache = new Map<string, IconSvgElement | null>()

function resolveHugeIcon(name?: string): IconSvgElement | null {
  if (!name) return null
  if (cache.has(name)) return cache.get(name) ?? null

  const candidates = [
    name,
    `${name}Icon`,
    name.replace(/Icon$/, ""),
    name.charAt(0).toUpperCase() + name.slice(1),
    `${name.charAt(0).toUpperCase() + name.slice(1)}Icon`,
  ]

  for (const key of candidates) {
    const icon = (HugeIcons as Record<string, unknown>)[key]
    if (icon && Array.isArray(icon)) {
      cache.set(name, icon as IconSvgElement)
      return icon as IconSvgElement
    }
  }

  cache.set(name, null)
  return null
}

export function IconPlaceholder({ hugeicons, className, ...props }: Props) {
  const icon = resolveHugeIcon(hugeicons)

  if (!icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("size-4", className)}
        {...props}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  const { lucide: _l, tabler: _t, phosphor: _p, remixicon: _r, ...rest } = props
  void _l; void _t; void _p; void _r;
  return (
    <HugeiconsIcon
      {...(rest as React.ComponentProps<typeof HugeiconsIcon>)}
      icon={icon}
      className={cn("size-4", className)}
    />
  )
}
