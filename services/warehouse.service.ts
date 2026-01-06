import type { WarehouseItem } from "@/types/restaurant"

export async function getWarehouseItems(): Promise<WarehouseItem[]> {
  // In a real app, this would fetch from an API
  return [
    {
      id: "WH-001",
      productId: "PROD-001",
      productName: "Margherita Pizza",
      quantity: 150,
      unit: "units",
      location: "A-12",
      minStock: 50,
      maxStock: 200,
      lastRestocked: "2024-01-15",
      supplier: "Food Supply Co.",
      expiryDate: "2024-02-15",
    },
    {
      id: "WH-002",
      productId: "PROD-002",
      productName: "Caesar Salad",
      quantity: 25,
      unit: "kg",
      location: "B-05",
      minStock: 30,
      maxStock: 100,
      lastRestocked: "2024-01-10",
      supplier: "Fresh Produce Inc.",
      expiryDate: "2024-01-25",
    },
    {
      id: "WH-003",
      productId: "PROD-003",
      productName: "Grilled Salmon",
      quantity: 8,
      unit: "kg",
      location: "C-08",
      minStock: 10,
      maxStock: 50,
      lastRestocked: "2024-01-12",
      supplier: "Ocean Fresh Ltd.",
      expiryDate: "2024-01-22",
    },
    {
      id: "WH-004",
      productId: "PROD-004",
      productName: "Chocolate Cake",
      quantity: 0,
      unit: "units",
      location: "D-15",
      minStock: 20,
      maxStock: 80,
      lastRestocked: "2024-01-08",
      supplier: "Sweet Treats Co.",
      expiryDate: "2024-01-30",
    },
    {
      id: "WH-005",
      productId: "PROD-005",
      productName: "Italian Pasta",
      quantity: 200,
      unit: "kg",
      location: "A-20",
      minStock: 100,
      maxStock: 300,
      lastRestocked: "2024-01-14",
      supplier: "Pasta Masters",
    },
    {
      id: "WH-006",
      productId: "PROD-006",
      productName: "Beef Burger",
      quantity: 12,
      unit: "kg",
      location: "C-03",
      minStock: 15,
      maxStock: 60,
      lastRestocked: "2024-01-13",
      supplier: "Meat Market Inc.",
      expiryDate: "2024-01-20",
    },
  ]
}

export async function getWarehouseItemById(id: string): Promise<WarehouseItem | null> {
  const items = await getWarehouseItems()
  return items.find((item) => item.id === id) || null
}

export async function getLowStockItems(): Promise<WarehouseItem[]> {
  const items = await getWarehouseItems()
  return items.filter((item) => item.quantity <= item.minStock)
}

