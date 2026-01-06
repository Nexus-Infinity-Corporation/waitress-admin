"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Grid3x3,
  BarChart3,
  Box,
  Lock,
  FileText,
  FileCheck,
  Grid,
  Users,
  Building2,
  Package,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "@/types/dashboard"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingCart,
  Grid3x3,
  BarChart3,
  Box,
  Lock,
  FileText,
  FileCheck,
  Grid,
  Users,
  Building2,
  Package,
  Warehouse,
}

interface NavigationClientProps {
  items: NavigationItem[]
}

export function NavigationClient({ items }: NavigationClientProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-12 items-center gap-1 border-t border-border px-6 overflow-x-auto">
      {items.map((item) => {
        const Icon = iconMap[item.icon]
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}

