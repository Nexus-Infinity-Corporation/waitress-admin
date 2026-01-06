import { HorizontalHeader } from "@/components/dashboard/horizontal-header"
import { GradientMetricCard } from "@/components/dashboard/gradient-metric-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { MonthlyOrdersChart } from "@/components/dashboard/monthly-orders-chart"
import {
  Users,
  Building2,
  Package,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import { getRestaurantMetrics } from "@/services/dashboard.service"

const iconMap: Record<string, LucideIcon> = {
  green: Users,
  red: Building2,
  blue: Package,
  purple: AlertTriangle,
}

export default async function Dashboard() {
  const metrics = await getRestaurantMetrics()

  const dashboardMetrics = [
    {
      title: "Total Employees",
      value: metrics.totalEmployees.toString(),
      description: "Active staff members",
      gradient: "green" as const,
    },
    {
      title: "Active Clients",
      value: metrics.activeClients.toString(),
      description: "Restaurant clients",
      gradient: "red" as const,
    },
    {
      title: "Total Products",
      value: metrics.totalProducts.toString(),
      description: "Menu items",
      gradient: "blue" as const,
    },
    {
      title: "Low Stock Items",
      value: metrics.lowStockItems.toString(),
      description: "Need restocking",
      gradient: "purple" as const,
    },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardMetrics.map((metric) => {
              const Icon = iconMap[metric.gradient]
              return (
                <GradientMetricCard
                  key={metric.title}
                  {...metric}
                  icon={Icon}
                />
              )
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart />
            <MonthlyOrdersChart />
          </div>

          {/* Bottom Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <p className="text-sm text-muted-foreground">
                Total Revenue: {metrics.totalRevenue}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Monthly Orders: {metrics.monthlyOrders}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Add new employee
                </p>
                <p className="text-sm text-muted-foreground">
                  • Register new client
                </p>
                <p className="text-sm text-muted-foreground">
                  • Add product to menu
                </p>
                <p className="text-sm text-muted-foreground">
                  • Restock warehouse
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
