import supabase from "@/services/api.service";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";

export async function getMockAdministrators(): Promise<Administrator[]> {
  return [
    {
      id: "ADM-001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234-567-8901",
      role: "Admin",
      status: "Active",
      registrationDate: "2023-01-10",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 234-567-8902",
      role: "Admin",
      status: "Active",
      registrationDate: "2023-01-11",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-003",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+1 234-567-8903",
      role: "Admin",
      status: "Active",
      registrationDate: "2023-01-12",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-004",
      name: "Bob Brown",
      email: "bob.brown@example.com",
      phone: "+1 234-567-8904",
      role: "Admin",
      status: "Active",
      registrationDate: "2023-01-13",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-005",
      name: "Charlie Davis",
      email: "charlie.davis@example.com",
      phone: "+1 234-567-8905",
      role: "Admin",
      status: "Active",
      registrationDate: "2023-01-14",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
  ];
}

export async function getMockAdministratorById(
  id: string
): Promise<Administrator | null> {
  const administrators = await getMockAdministrators();
  return (
    administrators.find((administrator) => administrator.id === id) || null
  );
}

export async function getAdministrators(): Promise<Administrator[]> {
  const { data, error } = await supabase.from("administrators").select("*");
  if (error) {
    return getMockAdministrators();
    throw new Error(`Failed to fetch administrators: ${error?.message}`);
  }
  return data as Administrator[];
}

export async function getAdministratorById(
  id: string
): Promise<Administrator | null> {
  const { data, error } = await supabase
    .from("administrators")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return getMockAdministratorById(id);
    throw new Error(`Failed to fetch administrator: ${error?.message}`);
  }
  return data as Administrator;
}
