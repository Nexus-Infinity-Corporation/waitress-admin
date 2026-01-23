import { readFromSupabase, writeToSupabase } from "@/lib/supabase/service";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";

export async function getMockAdministrators(): Promise<Administrator[]> {
  return [
    {
      id: "ADM-001",
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

/**
 * Database row type from administrators table
 */
interface DatabaseAdministrator {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  phone: string;
  role_id?: number;
  role?: string;
  status: "active" | "inactive" | "suspended";
  is_active?: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Transforms database administrator row to Administrator type
 */
function transformAdministrator(dbRow: DatabaseAdministrator): Administrator {
  return {
    id: dbRow.id,
    name: dbRow.name || dbRow.username || "Unknown",
    email: dbRow.email || "",
    phone: dbRow.phone || "",
    role:
      dbRow.role || (dbRow.role_id ? `Role ${dbRow.role_id}` : "administrator"),
    status: dbRow.status || "active",
    is_active: dbRow.is_active ?? dbRow.status === "active",
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at || dbRow.created_at,
  };
}

export async function getAdministrators(): Promise<Administrator[]> {
  // Use centralized service with automatic admin client selection and retry logic
  const data = await readFromSupabase<DatabaseAdministrator[]>(
    async (client) => {
      // Get administrators data
      const { data: adminData, error } = await client
        .from("administrators")
        .select("*");

      if (error) {
        return { data: null, error };
      }

      // Get user IDs to fetch email and name from users table
      const adminIds = (adminData || []).map((admin) => admin.id);

      if (adminIds.length === 0) {
        return { data: [], error: null };
      }

      // Fetch user data for email and name
      const { data: usersData, error: usersError } = await client
        .from("users")
        .select("id, email, first_name, last_name")
        .in("id", adminIds);

      // Create a map of user data by ID
      const usersMap = new Map(
        (usersData || []).map((user) => [
          user.id,
          {
            email: user.email || "",
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              user.email ||
              "",
          },
        ])
      );

      // Merge administrator data with user data
      const merged = (adminData || []).map((admin: DatabaseAdministrator) => {
        const userInfo = usersMap.get(admin.id);
        return {
          ...admin,
          email: userInfo?.email || admin.email || "",
          name: userInfo?.name || admin.username || admin.name || "Unknown",
        };
      });

      return { data: merged, error: usersError };
    },
    { retries: 3 } // Additional retries for administrators
  );

  // Transform database rows to Administrator type
  return (data || []).map(transformAdministrator);
}

export async function getAdministratorById(
  id: string
): Promise<Administrator | null> {
  // Use centralized service with automatic admin client selection and retry logic
  const data = await readFromSupabase<DatabaseAdministrator>(
    async (client) => {
      // Get administrator data
      const { data: adminData, error } = await client
        .from("administrators")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !adminData) {
        return { data: null, error };
      }

      // Fetch user data for email and name
      const { data: userData, error: userError } = await client
        .from("users")
        .select("id, email, first_name, last_name")
        .eq("id", id)
        .single();

      // Merge administrator data with user data
      const merged = {
        ...adminData,
        email: userData?.email || adminData.email || "",
        name: userData
          ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
            userData.email ||
            adminData.username ||
            adminData.name ||
            "Unknown"
          : adminData.username || adminData.name || "Unknown",
      };

      return { data: merged, error: userError };
    },
    { retries: 3 } // Additional retries for administrators
  );

  return data ? transformAdministrator(data) : null;
}

export async function createAdministrator(
  administrator: Omit<Administrator, "id">
): Promise<Administrator> {
  // Use centralized service with automatic admin client selection
  return await writeToSupabase<Administrator>(async (client) => {
    return await client
      .from("administrators")
      .insert(administrator)
      .select()
      .single();
  });
}
