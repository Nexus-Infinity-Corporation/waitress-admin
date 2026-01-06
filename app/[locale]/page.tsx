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
import { getTranslations } from 'next-intl/server'

const iconMap: Record<string, LucideIcon> = {
  green: Users,
  red: Building2,
  blue: Package,
  purple: AlertTriangle,
}

export default async function Dashboard() {
  const metrics = await getRestaurantMetrics()
  const t = await getTranslations('dashboard')

  const dashboardMetrics = [
    {
      title: t('totalEmployees'),
      value: metrics.totalEmployees.toString(),
      description: t('activeStaffMembers'),
      gradient: "green" as const,
    },
    {
      title: t('activeClients'),
      value: metrics.activeClients.toString(),
      description: t('restaurantClients'),
      gradient: "red" as const,
    },
    {
      title: t('totalProducts'),
      value: metrics.totalProducts.toString(),
      description: t('menuItems'),
      gradient: "blue" as const,
    },
    {
      title: t('lowStockItems'),
      value: metrics.lowStockItems.toString(),
      description: t('needRestocking'),
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
              <h3 className="text-lg font-semibold mb-4">{t('recentOrders')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('totalRevenue')}: {metrics.totalRevenue}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('monthlyOrders')}: {metrics.monthlyOrders}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('quickActions')}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • {t('addNewEmployee')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('registerNewClient')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('addProductToMenu')}
                </p>
                <p className="text-sm text-muted-foreground">
                  • {t('restockWarehouse')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
