"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Mail,
  MessageSquare,
  Folder,
  Users,
  CheckSquare,
  FileText,
  AlertCircle,
  User,
  Clock,
  HelpCircle,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "eCommerce",
    icon: ShoppingCart,
    href: "/ecommerce",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
];

const appsItems = [
  {
    title: "Email",
    icon: Mail,
    href: "/email",
  },
  {
    title: "Chat Box",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    title: "File Manager",
    icon: Folder,
    href: "/files",
  },
  {
    title: "Contacts",
    icon: Users,
    href: "/contacts",
  },
  {
    title: "Todo",
    icon: CheckSquare,
    href: "/todo",
  },
  {
    title: "Invoice",
    icon: FileText,
    href: "/invoice",
  },
];

const pagesItems = [
  {
    title: "Error",
    icon: AlertCircle,
    children: [
      { title: "404 Error", href: "/404" },
      { title: "500 Error", href: "/500" },
      { title: "Coming Soon", href: "/coming-soon" },
      { title: "Blank Page", href: "/blank" },
    ],
  },
  {
    title: "User Profile",
    icon: User,
    href: "/profile",
  },
  {
    title: "Timeline",
    icon: Clock,
    href: "/timeline",
  },
  {
    title: "FAQ",
    icon: HelpCircle,
    href: "/faq",
  },
  {
    title: "Pricing",
    icon: DollarSign,
    href: "/pricing",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Dashtrans</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Apps & Pages
          </p>
          <div className="space-y-1">
            {appsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pages
          </p>
          <div className="space-y-1">
            {pagesItems.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                return (
                  <div key={item.title} className="space-y-1">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                      <Icon className="h-5 w-5" />
                      {item.title}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </div>
                    <div className="ml-8 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            pathname === child.href
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
