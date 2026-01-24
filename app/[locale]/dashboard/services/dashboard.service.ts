import type {
  MetricData,
  Order,
  SalesDataPoint,
  MonthlyOrderDataPoint,
  CountryData,
  SocialTrafficData,
  BrowserStatsData,
} from "@/types/dashboard";
import type { RestaurantMetrics } from "@/shared/types/restaurant";
import { getCachedEmployees } from "@/app/[locale]/employees/services/employees.service";
import { getClients } from "@/app/[locale]/customers/services/clients.service";
import { getProducts } from "@/app/[locale]/products/services/products.service";
import { getLowStockItems } from "@/app/[locale]/warehouse/services/warehouse.service";

export async function getMetrics(): Promise<MetricData[]> {
  // In a real app, this would fetch from an API
  return [
    {
      title: "Total Orders",
      value: "986",
      description: "+2.6% Since Last Week",
      gradient: "green",
    },
    {
      title: "Customers",
      value: "485",
      description: "+2.6% Since Last Week",
      gradient: "red",
    },
    {
      title: "Total Revenue",
      value: "$24K",
      description: "+2.6% Since Last Week",
      gradient: "blue",
    },
    {
      title: "Total Growth",
      value: "22%",
      description: "+2.6% Since Last Week",
      gradient: "purple",
    },
  ];
}

export async function getRestaurantMetrics(): Promise<RestaurantMetrics> {
  const employees = await getCachedEmployees();
  const clients = await getClients();
  const products = await getProducts();
  const lowStockItems = await getLowStockItems();

  return {
    totalEmployees: employees.length,
    activeClients: clients.filter((c) => c.status === "Active").length,
    totalProducts: products.length,
    lowStockItems: lowStockItems.length,
    totalRevenue: "$45,230",
    monthlyOrders: 342,
  };
}

export async function getOrders(): Promise<Order[]> {
  // In a real app, this would fetch from an API
  return [
    {
      id: "OS-000354",
      company: "Gaspur Antunes",
      status: "FULFILLED",
      statusColor: "success",
      total: "$485.20",
      date: "June 10, 2020",
    },
    {
      id: "OS-000355",
      company: "Gaspur Antunes",
      status: "CONFIRMED",
      statusColor: "default",
      total: "$320.50",
      date: "June 11, 2020",
    },
    {
      id: "OS-000356",
      company: "Gaspur Antunes",
      status: "PARTIALLY SHIPPED",
      statusColor: "warning",
      total: "$750.00",
      date: "June 12, 2020",
    },
    {
      id: "OS-000357",
      company: "Gaspur Antunes",
      status: "FULFILLED",
      statusColor: "success",
      total: "$125.80",
      date: "June 13, 2020",
    },
    {
      id: "OS-000358",
      company: "Gaspur Antunes",
      status: "CONFIRMED",
      statusColor: "default",
      total: "$890.40",
      date: "June 14, 2020",
    },
    {
      id: "OS-000359",
      company: "Gaspur Antunes",
      status: "PARTIALLY SHIPPED",
      statusColor: "warning",
      total: "$245.60",
      date: "June 15, 2020",
    },
  ];
}

export async function getSalesData(): Promise<SalesDataPoint[]> {
  return [
    { day: "Mo", value1: 45, value2: 35 },
    { day: "Tu", value1: 52, value2: 40 },
    { day: "We", value1: 48, value2: 38 },
    { day: "Th", value1: 61, value2: 45 },
    { day: "Fr", value1: 95, value2: 85 },
    { day: "Sa", value1: 75, value2: 65 },
    { day: "Su", value1: 65, value2: 55 },
  ];
}

export async function getMonthlyOrdersData(): Promise<MonthlyOrderDataPoint[]> {
  return [
    { month: "Jan", orders: 8 },
    { month: "Feb", orders: 7 },
    { month: "Mar", orders: 14 },
    { month: "Apr", orders: 11 },
    { month: "May", orders: 9 },
    { month: "Jun", orders: 12 },
  ];
}

export async function getCountriesData(): Promise<CountryData[]> {
  return [
    { name: "India", visits: 647 },
    { name: "United States", visits: 435 },
    { name: "Vietnam", visits: 287 },
    { name: "Australia", visits: 432 },
    { name: "Angola", visits: 345 },
    { name: "Aland Islands", visits: 134 },
    { name: "Argentina", visits: 147 },
    { name: "Belgium", visits: 210 },
  ];
}

export async function getSocialTrafficData(): Promise<SocialTrafficData[]> {
  return [
    { platform: "Facebook", visits: 46, percentage: 33 },
    { platform: "YouTube", visits: 12, percentage: 17 },
    { platform: "Linkedin", visits: 29, percentage: 21 },
    { platform: "Twitter", visits: 34, percentage: 23 },
    { platform: "Dribbble", visits: 28, percentage: 19 },
  ];
}

export async function getBrowserStatsData(): Promise<BrowserStatsData[]> {
  return [
    { name: "Chrome", percentage: 45, color: "bg-blue-500" },
    { name: "Firefox", percentage: 30, color: "bg-orange-500" },
    { name: "Safari", percentage: 15, color: "bg-blue-400" },
    { name: "Edge", percentage: 10, color: "bg-blue-600" },
  ];
}
