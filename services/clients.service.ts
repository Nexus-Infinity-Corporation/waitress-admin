import type { RestaurantClient } from "@/types/restaurant"

export async function getClients(): Promise<RestaurantClient[]> {
  // In a real app, this would fetch from an API
  return [
    {
      id: "CLI-001",
      name: "Maria Garcia",
      email: "maria@restaurant1.com",
      phone: "+1 234-567-9000",
      restaurantName: "Bella Italia",
      address: "123 Main Street",
      city: "New York",
      status: "Active",
      registrationDate: "2023-01-10",
      totalOrders: 45,
      totalSpent: "$12,450",
    },
    {
      id: "CLI-002",
      name: "Robert Brown",
      email: "robert@restaurant2.com",
      phone: "+1 234-567-9001",
      restaurantName: "Sakura Sushi",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      status: "Active",
      registrationDate: "2023-02-15",
      totalOrders: 32,
      totalSpent: "$8,900",
    },
    {
      id: "CLI-003",
      name: "Jennifer Lee",
      email: "jennifer@restaurant3.com",
      phone: "+1 234-567-9002",
      restaurantName: "Taco Fiesta",
      address: "789 Pine Road",
      city: "Chicago",
      status: "Active",
      registrationDate: "2023-03-20",
      totalOrders: 28,
      totalSpent: "$6,200",
    },
    {
      id: "CLI-004",
      name: "Thomas Anderson",
      email: "thomas@restaurant4.com",
      phone: "+1 234-567-9003",
      restaurantName: "Burger House",
      address: "321 Elm Street",
      city: "Houston",
      status: "Inactive",
      registrationDate: "2022-12-05",
      totalOrders: 15,
      totalSpent: "$3,500",
    },
    {
      id: "CLI-005",
      name: "Lisa Martinez",
      email: "lisa@restaurant5.com",
      phone: "+1 234-567-9004",
      restaurantName: "Pizza Palace",
      address: "654 Maple Drive",
      city: "Miami",
      status: "Active",
      registrationDate: "2023-04-10",
      totalOrders: 52,
      totalSpent: "$15,800",
    },
  ]
}

export async function getClientById(id: string): Promise<RestaurantClient | null> {
  const clients = await getClients()
  return clients.find((client) => client.id === id) || null
}

