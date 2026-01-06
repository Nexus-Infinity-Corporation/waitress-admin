import { HorizontalHeader } from "@/components/dashboard/horizontal-header"
import { GradientMetricCard } from "@/components/dashboard/gradient-metric-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { MonthlyOrdersChart } from "@/components/dashboard/monthly-orders-chart"
import {
  ShoppingCart,
  Users,
  Wallet,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { getMetrics } from "@/services/dashboard.service"

const iconMap: Record<string, LucideIcon> = {
  green: ShoppingCart,
  red: Users,
  blue: Wallet,
  purple: TrendingUp,
}

export default async function Dashboard() {
  const metrics = await getMetrics()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
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
              <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">New Users</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs rounded bg-muted text-muted-foreground">
                    Monthly
                  </button>
                  <button className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground">
                    Weekly
                  </button>
                  <button className="px-3 py-1 text-xs rounded bg-muted text-muted-foreground">
                    Daily
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
