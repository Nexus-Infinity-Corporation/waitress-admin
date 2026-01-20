import { createClient } from "@/lib/supabase/server";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";

export async function getMockAdministrators(): Promise<Administrator[]> {
  return [
    {
      id: "ADM-001",
      user_id: "USR-001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234-567-8901",
      role: "Admin",
      status: "active",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-002",
      user_id: "USR-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 234-567-8902",
      role: "Admin",
      status: "active",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-003",
      user_id: "USR-003",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+1 234-567-8903",
      role: "Admin",
      status: "active",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-004",
      user_id: "USR-004",
      name: "Bob Brown",
      email: "bob.brown@example.com",
      phone: "+1 234-567-8904",
      role: "Admin",
      status: "active",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
    {
      id: "ADM-005",
      user_id: "USR-005",
      name: "Charlie Davis",
      email: "charlie.davis@example.com",
      phone: "+1 234-567-8905",
      role: "Admin",
      status: "active",
      is_active: true,
      created_at: "2023-01-10",
      updated_at: "2023-01-10",
    },
  ];
}

export async function getMockAdministratorById(
  id: string
): Promise<Administrator | null> {
  const administrators = await getAdministrators();
  return (
    administrators.find((administrator) => administrator.id === id) || null
  );
}

export async function getAdministrators(): Promise<Administrator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("administrators").select("*");
  if (error) {
    throw new Error(`Failed to fetch administrators: ${error?.message}`);
  }
  return data as Administrator[];
}

export async function getAdministratorById(
  id: string
): Promise<Administrator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("administrators")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(`Failed to fetch administrator: ${error?.message}`);
  }
  return data as Administrator | null;
}

export async function createAdministrator(
  administrator: Omit<Administrator, "id">
): Promise<Administrator> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("administrators")
    .insert(administrator)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to create administrator: ${error?.message}`);
  }
  return data as Administrator;
}
