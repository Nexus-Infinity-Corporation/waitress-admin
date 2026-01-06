import type { NavigationItem } from "@/types/dashboard"

export async function getNavigationItems(): Promise<NavigationItem[]> {
  return [
    { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { title: "eCommerce", href: "/ecommerce", icon: "ShoppingCart" },
    { title: "Widgets", href: "/widgets", icon: "Grid3x3" },
    { title: "Application", href: "/application", icon: "Grid" },
    { title: "Charts", href: "/charts", icon: "BarChart3" },
    { title: "Components", href: "/components", icon: "Box" },
    { title: "Authentication", href: "/authentication", icon: "Lock" },
    { title: "Pages", href: "/pages", icon: "FileText" },
    { title: "Forms", href: "/forms", icon: "FileCheck" },
  ]
}

