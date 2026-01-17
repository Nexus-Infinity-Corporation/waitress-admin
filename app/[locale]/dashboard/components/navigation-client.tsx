"use client";

import { Link, usePathname } from "@/i18n/routing";
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
  GitBranch,
  Building,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { NavigationItem } from "@/types/dashboard";

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
  GitBranch,
  Building,
};

interface NavigationClientProps {
  items: NavigationItem[];
}

export function NavigationClient({ items }: NavigationClientProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-12 gap-1 sticky top-0 bg-background border-t border-border px-6">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 mx-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
