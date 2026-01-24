import { readFromSupabase, writeToSupabase } from "@/lib/supabase/service";
import {
  Administrator,
  DatabaseAdministrator,
} from "@/app/[locale]/administrators/types/administrator";

export async function getMockAdministratorById(
  id: string
): Promise<Administrator | null> {
  const administrators = await getAdministrators();
  return (
    administrators.find((administrator) => administrator.id === id) || null
  );
}

/**
 * Extended database administrator with joined user and role data
 */
interface ExtendedAdministrator extends DatabaseAdministrator {
  // Fields from users table (joined)
  email?: string;
  first_name?: string;
  last_name?: string;
  users_is_active?: boolean;
  // Fields from roles table (joined)
  role_name?: string;
}

/**
 * Transforms database administrator row to Administrator UI type
 */
function transformAdministrator(dbRow: ExtendedAdministrator): Administrator {
  // Compute full name from first_name + last_name or fall back to username
  const name =
    dbRow.first_name || dbRow.last_name
      ? `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim()
      : dbRow.username || dbRow.email || "Unknown";

  return {
    id: dbRow.id,
    name,
    email: dbRow.email || "",
    phone: dbRow.phone || "",
    role:
      dbRow.role_name ||
      (dbRow.role_id ? `Role ${dbRow.role_id}` : "Administrator"),
    status: (dbRow.status as "active" | "inactive" | "suspended") || "active",
    is_active: dbRow.users_is_active ?? dbRow.status === "active",
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at || dbRow.created_at,
    username: dbRow.username || undefined,
  };
}

export async function getAdministrators(): Promise<Administrator[]> {
  // Use centralized service with automatic admin client selection and retry logic
  // NOTE: We use manual joins instead of Supabase join syntax because:
  // - administrators.id = users.id (same UUID) but no formal FK relationship declared
  // - This prevents us from using users:id join syntax in Supabase
  const data = await readFromSupabase<ExtendedAdministrator[]>(
    async (client) => {
      // Get administrators data first
      const { data: adminData, error: adminError } = await client
        .from("administrators")
        .select("*");

      if (adminError) {
        return { data: null, error: adminError };
      }

      if (!adminData || adminData.length === 0) {
        return { data: [], error: null };
      }

      // Get admin IDs for fetching related data
      const adminIds = adminData.map((admin) => admin.id);
      const roleIds = adminData
        .map((admin) => admin.role_id)
        .filter((roleId): roleId is number => roleId !== null);

      // Fetch users data (same IDs as administrators)
      const { data: usersData, error: usersError } = await client
        .from("users")
        .select("id, email, first_name, last_name, is_active")
        .in("id", adminIds);

      // Fetch roles data if there are role IDs
      let rolesData: Pick<Role, "id" | "name" | "display_name">[] = [];
      if (roleIds.length > 0) {
        const { data: fetchedRoles, error: rolesError } = await client
          .from("roles")
          .select("id, name, display_name")
          .in("id", roleIds);

        if (!rolesError && fetchedRoles) {
          rolesData = fetchedRoles;
        }
      }

      // Create lookup maps
      const usersMap = new Map(
        (usersData || []).map((user) => [user.id, user])
      );
      const rolesMap = new Map(rolesData.map((role) => [role.id, role]));

      // Merge administrator data with users and roles data
      const mergedData: ExtendedAdministrator[] = adminData.map((admin) => {
        const user = usersMap.get(admin.id);
        const role = admin.role_id ? rolesMap.get(admin.role_id) : null;

        return {
          ...admin,
          email: user?.email,
          first_name: user?.first_name,
          last_name: user?.last_name,
          users_is_active: user?.is_active,
          role_name: role?.display_name || role?.name,
        };
      });

      return { data: mergedData, error: usersError };
    },
    { retries: 3 } // Additional retries for administrators
  );

  // Transform database rows to Administrator UI type
  return (data || []).map(transformAdministrator);
}

export async function getAdministratorById(
  id: string
): Promise<Administrator | null> {
  // Use centralized service with automatic admin client selection and retry logic
  // NOTE: We use manual joins instead of Supabase join syntax because:
  // - administrators.id = users.id (same UUID) but no formal FK relationship declared
  // - This prevents us from using users:id join syntax in Supabase
  const data = await readFromSupabase<ExtendedAdministrator>(
    async (client) => {
      // Get administrator data first
      const { data: adminData, error: adminError } = await client
        .from("administrators")
        .select("*")
        .eq("id", id)
        .single();

      if (adminError || !adminData) {
        return { data: null, error: adminError };
      }

      // Fetch user data (same ID as administrator)
      const { data: userData, error: userError } = await client
        .from("users")
        .select("id, email, first_name, last_name, is_active")
        .eq("id", id)
        .single();

      // Fetch role data if administrator has a role_id
      let roleData = null;
      if (adminData.role_id) {
        const { data: fetchedRole, error: roleError } = await client
          .from("roles")
          .select("id, name, display_name")
          .eq("id", adminData.role_id)
          .single();

        if (!roleError && fetchedRole) {
          roleData = fetchedRole;
        }
      }

      // Merge administrator data with user and role data
      const mergedData: ExtendedAdministrator = {
        ...adminData,
        email: userData?.email,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        users_is_active: userData?.is_active,
        role_name: roleData?.display_name || roleData?.name,
      };

      return { data: mergedData, error: userError };
    },
    { retries: 3 } // Additional retries for administrators
  );

  return data ? transformAdministrator(data) : null;
}

export async function createAdministrator(
  administratorData: Omit<DatabaseAdministrator, "id" | "created_at">
): Promise<DatabaseAdministrator> {
  // Use centralized service with automatic admin client selection
  return await writeToSupabase<DatabaseAdministrator>(async (client) => {
    return await client
      .from("administrators")
      .insert(administratorData)
      .select()
      .single();
  });
}

/**
 * Role-related interfaces and functions
 */
export interface Role {
  id: number;
  created_at: string;
  updated_at: string | null;
  name: string;
  display_name: string | null;
  description: string | null;
  role_level: number | null;
  is_active: boolean | null;
}

/**
 * Get all active roles
 */
export async function getRoles(): Promise<Role[]> {
  const data = await readFromSupabase<Role[]>(
    async (client) => {
      const { data: rolesData, error } = await client
        .from("roles")
        .select("*")
        .eq("is_active", true)
        .order("role_level", { ascending: true });

      return { data: rolesData, error };
    },
    { retries: 3 }
  );

  return data || [];
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  const data = await readFromSupabase<Role>(
    async (client) => {
      const { data: roleData, error } = await client
        .from("roles")
        .select("*")
        .eq("name", name)
        .eq("is_active", true)
        .single();

      return { data: roleData, error };
    },
    { retries: 3 }
  );

  return data || null;
}

/**
 * Get role by ID
 */
export async function getRoleById(id: number): Promise<Role | null> {
  const data = await readFromSupabase<Role>(
    async (client) => {
      const { data: roleData, error } = await client
        .from("roles")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      return { data: roleData, error };
    },
    { retries: 3 }
  );

  return data || null;
}

/**
 * Check if administrator record exists by user ID
 */
export async function getAdministratorByUserId(
  userId: string
): Promise<DatabaseAdministrator | null> {
  const data = await readFromSupabase<DatabaseAdministrator>(
    async (client) => {
      const { data: adminData, error } = await client
        .from("administrators")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw error;
      }

      return { data: adminData, error: null };
    },
    { retries: 3 }
  );

  return data || null;
}

/**
 * Update existing administrator record
 */
export async function updateAdministrator(
  userId: string,
  updateData: Partial<Omit<DatabaseAdministrator, "id" | "created_at">>
): Promise<DatabaseAdministrator | null> {
  const data = await writeToSupabase<DatabaseAdministrator>(async (client) => {
    return await client
      .from("administrators")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();
  });

  return data || null;
}
