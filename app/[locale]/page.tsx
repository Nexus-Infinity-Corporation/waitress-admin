import { Suspense } from "react";
import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { GradientMetricCard } from "@/components/dashboard/gradient-metric-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { MonthlyOrdersChart } from "@/components/dashboard/monthly-orders-chart";
import {
  Users,
  Building2,
  Package,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { getRestaurantMetrics } from "./dashboard/services/dashboard.service";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { NavigationClient } from "@/components/dashboard/navigation-client";
import { getNavigationItems } from "@/services/navigation.service";

const iconMap: Record<string, LucideIcon> = {
  green: Users,
  red: Building2,
  blue: Package,
  purple: AlertTriangle,
};

async function DashboardContent() {
  const metrics = await getRestaurantMetrics();
  const t = await getTranslations("dashboard");

  const dashboardMetrics = [
    {
      title: t("totalEmployees"),
      value: metrics.totalEmployees.toString(),
      description: t("activeStaffMembers"),
      gradient: "green" as const,
    },
    {
      title: t("activeClients"),
      value: metrics.activeClients.toString(),
      description: t("restaurantClients"),
      gradient: "red" as const,
    },
    {
      title: t("totalProducts"),
      value: metrics.totalProducts.toString(),
      description: t("menuItems"),
      gradient: "blue" as const,
    },
    {
      title: t("lowStockItems"),
      value: metrics.lowStockItems.toString(),
      description: t("needRestocking"),
      gradient: "purple" as const,
    },
  ];

  return (
    <>
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = iconMap[metric.gradient];
          return (
            <div
              key={metric.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GradientMetricCard {...metric} icon={Icon} />
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-in fade-in slide-in-from-left-4 duration-1000 ease-in-out animate-delay-200">
          <SalesChart />
        </div>
        <div className="animate-in fade-in slide-in-from-right-4 duration-1000 ease-in-out animate-delay-300">
          <MonthlyOrdersChart />
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 transition-all duration-1000 ease-in-out hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-400">
          <h3 className="text-lg font-semibold mb-4 transition-colors duration-1000 ease-in-out">
            {t("recentOrders")}
          </h3>
          <p className="text-sm text-muted-foreground transition-colors duration-1000 ease-in-out">
            {t("totalRevenue")}: {metrics.totalRevenue}
          </p>
          <p className="text-sm text-muted-foreground mt-2 transition-colors duration-1000 ease-in-out">
            {t("monthlyOrders")}: {metrics.monthlyOrders}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 transition-all duration-1000 ease-in-out hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold transition-colors duration-1000 ease-in-out">
              {t("quickActions")}
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground transition-colors duration-1000 ease-in-out hover:text-foreground">
              • {t("addNewEmployee")}
            </p>
            <p className="text-sm text-muted-foreground transition-colors duration-1000 ease-in-out hover:text-foreground">
              • {t("registerNewClient")}
            </p>
            <p className="text-sm text-muted-foreground transition-colors duration-1000 ease-in-out hover:text-foreground">
              • {t("addProductToMenu")}
            </p>
            <p className="text-sm text-muted-foreground transition-colors duration-1000 ease-in-out hover:text-foreground">
              • {t("restockWarehouse")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function Dashboard() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/");
  const navItems = await getNavigationItems();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex flex-1 flex-row overflow-hidden">
        <NavigationClient items={navItems} />
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
          <div className="mx-auto max-w-7xl space-y-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardContent />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
