import type { Product } from "@/types/restaurant"

export async function getProducts(): Promise<Product[]> {
  // In a real app, this would fetch from an API
  return [
    {
      id: "PROD-001",
      name: "Margherita Pizza",
      category: "Pizza",
      description: "Classic pizza with tomato, mozzarella, and basil",
      price: "$12.99",
      cost: "$4.50",
      sku: "PIZ-MAR-001",
      status: "Available",
    },
    {
      id: "PROD-002",
      name: "Caesar Salad",
      category: "Salad",
      description: "Fresh romaine lettuce with Caesar dressing",
      price: "$8.99",
      cost: "$3.20",
      sku: "SAL-CAE-001",
      status: "Available",
    },
    {
      id: "PROD-003",
      name: "Grilled Salmon",
      category: "Main Course",
      description: "Fresh Atlantic salmon with vegetables",
      price: "$24.99",
      cost: "$12.00",
      sku: "MAIN-SAL-001",
      status: "Available",
    },
    {
      id: "PROD-004",
      name: "Chocolate Cake",
      category: "Dessert",
      description: "Rich chocolate layer cake",
      price: "$6.99",
      cost: "$2.50",
      sku: "DES-CHO-001",
      status: "Out of Stock",
    },
    {
      id: "PROD-005",
      name: "Italian Pasta",
      category: "Pasta",
      description: "Homemade pasta with marinara sauce",
      price: "$14.99",
      cost: "$5.00",
      sku: "PAS-ITA-001",
      status: "Available",
    },
    {
      id: "PROD-006",
      name: "Beef Burger",
      category: "Burger",
      description: "Premium beef burger with fries",
      price: "$11.99",
      cost: "$4.80",
      sku: "BUR-BEE-001",
      status: "Available",
    },
  ]
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((product) => product.id === id) || null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((product) => product.category === category)
}

