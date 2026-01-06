export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: "Manager" | "Waiter" | "Chef" | "Cashier" | "Admin"
  status: "Active" | "Inactive" | "On Leave"
  hireDate: string
  salary?: string
  avatar?: string
}

export interface RestaurantClient {
  id: string
  name: string
  email: string
  phone: string
  restaurantName: string
  address: string
  city: string
  status: "Active" | "Inactive" | "Suspended"
  registrationDate: string
  totalOrders: number
  totalSpent: string
}

export interface Product {
  id: string
  name: string
  category: string
  description?: string
  price: string
  cost: string
  sku: string
  status: "Available" | "Out of Stock" | "Discontinued"
  image?: string
  restaurantId?: string
}

export interface WarehouseItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  location: string
  minStock: number
  maxStock: number
  lastRestocked: string
  supplier?: string
  expiryDate?: string
}

export interface RestaurantMetrics {
  totalEmployees: number
  activeClients: number
  totalProducts: number
  lowStockItems: number
  totalRevenue: string
  monthlyOrders: number
}

