import type { Employee } from "@/shared/types/restaurant";

export async function getEmployees(): Promise<Employee[]> {
  // In a real app, this would fetch from an API
  return [
    {
      id: "EMP-001",
      name: "John Smith",
      email: "john.smith@restaurant.com",
      phone: "+1 234-567-8900",
      role: "Manager",
      status: "Active",
      hireDate: "2023-01-15",
      salary: "$5,000",
    },
    {
      id: "EMP-002",
      name: "Sarah Johnson",
      email: "sarah.j@restaurant.com",
      phone: "+1 234-567-8901",
      role: "Waiter",
      status: "Active",
      hireDate: "2023-03-20",
      salary: "$2,500",
    },
    {
      id: "EMP-003",
      name: "Michael Chen",
      email: "michael.c@restaurant.com",
      phone: "+1 234-567-8902",
      role: "Chef",
      status: "Active",
      hireDate: "2022-11-10",
      salary: "$4,000",
    },
    {
      id: "EMP-004",
      name: "Emily Davis",
      email: "emily.d@restaurant.com",
      phone: "+1 234-567-8903",
      role: "Cashier",
      status: "Active",
      hireDate: "2023-05-01",
      salary: "$2,200",
    },
    {
      id: "EMP-005",
      name: "David Wilson",
      email: "david.w@restaurant.com",
      phone: "+1 234-567-8904",
      role: "Waiter",
      status: "On Leave",
      hireDate: "2022-08-15",
      salary: "$2,500",
    },
  ];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await getEmployees();
  return employees.find((emp) => emp.id === id) || null;
}
