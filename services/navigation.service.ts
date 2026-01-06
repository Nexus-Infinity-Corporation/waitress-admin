import type { NavigationItem } from "@/types/dashboard"

export async function getNavigationItems(): Promise<NavigationItem[]> {
  return [
    { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { title: "Employees", href: "/employees", icon: "Users" },
    { title: "Restaurant Clients", href: "/clients", icon: "Building2" },
    { title: "Products", href: "/products", icon: "Package" },
    { title: "Warehouse", href: "/warehouse", icon: "Warehouse" },
    { title: "Orders", href: "/orders", icon: "ShoppingCart" },
    { title: "Analytics", href: "/analytics", icon: "BarChart3" },
  ]
}
