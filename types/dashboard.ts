export interface MetricData {
  title: string
  value: string
  description: string
  gradient: "green" | "red" | "blue" | "purple"
}

export interface Order {
  id: string
  company: string
  status: "FULFILLED" | "CONFIRMED" | "PARTIALLY SHIPPED"
  statusColor: "success" | "default" | "warning"
  total: string
  date: string
}

export interface SalesDataPoint {
  day: string
  value1: number
  value2: number
}

export interface MonthlyOrderDataPoint {
  month: string
  orders: number
}

export interface CountryData {
  name: string
  visits: number
}

export interface SocialTrafficData {
  platform: string
  visits: number
  percentage: number
}

export interface BrowserStatsData {
  name: string
  percentage: number
  color: string
}

export interface NavigationItem {
  title: string
  href: string
  icon: string
}

