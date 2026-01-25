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
  type LucideIcon,
  Building,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  Building,
  GitBranch,
};

interface NavigationClientProps {
  items: NavigationItem[];
}

export function NavigationClient({ items }: NavigationClientProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-64 border-r border-border bg-card p-4 overflow-y-auto">
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-1000 ease-in-out whitespace-nowrap hover:scale-105",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {Icon && (
                <Icon className="h-4 w-4 transition-transform duration-1000 ease-in-out group-hover:scale-110" />
              )}
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
