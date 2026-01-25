import supabase from "@/services/api.service";
import { createClient } from "@/lib/supabase/server";
import { readFromSupabase } from "@/lib/supabase/service";
import { Role } from "@/types/roles";

export const getHighestRoleLevelRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .gte("role_level", 9)
    .lte("role_level", 12)
    .order("role_level", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return data || [];
};

export const getRoleByLevel = async (level: number): Promise<Role | null> => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .eq("role_level", level)
    .single();

  if (error) {
    console.error("Error fetching role:", error);
    return null;
  }
  return data || null;
};

export const getRoleForCurrentUser = async (): Promise<Role | null> => {
  // Get the authenticated user using server-side client (must use regular client for auth)
  const supabaseServer = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (userError || !user) {
    console.error("Error fetching current user:", userError);
    return null;
  }

  // Get administrator record for this user
  // Use readFromSupabase which automatically uses admin client if available (bypasses RLS)
  try {
    const adminData = await readFromSupabase<{
      id: string;
      role_id: number | null;
      username: string | null;
      status: string | null;
    }>(
      async (client) => {
        const { data, error } = await client
          .from("administrators")
          .select("role_id, id, username, status")
          .eq("id", user.id)
          .maybeSingle();

        // PGRST116 = no rows found - this is expected and not an error
        if (error && error.code !== "PGRST116") {
          throw error;
        }

        return { data, error: null };
      },
      { retries: 1 }
    );

    if (!adminData) {
      console.warn(
        `No administrator record found for user ${user.id} (${user.email})`
      );
      return null;
    }
    // If no role_id, return null
    if (!adminData.role_id) {
      console.warn(
        `Administrator record exists but has no role_id for user ${user.id}`
      );
      return null;
    }

    // Get the role by ID (role_id is the ID in the roles table, not the level)
    // First try to get active role
    const roleData = await readFromSupabase<Role>(
      async (client) => {
        const { data, error } = await client
          .from("roles")
          .select("*")
          .eq("id", adminData.role_id!)
          .eq("is_active", true)
          .maybeSingle();

        // PGRST116 = no rows found - this is expected and not an error
        if (error && error.code !== "PGRST116") {
          throw error;
        }

        return { data, error: null };
      },
      { retries: 1 }
    );

    // If not found with is_active filter, check if role exists but is inactive
    if (!roleData) {
      const inactiveRole = await readFromSupabase<Role>(
        async (client) => {
          const { data, error } = await client
            .from("roles")
            .select("*")
            .eq("id", adminData.role_id!)
            .maybeSingle();

          // PGRST116 = no rows found
          if (error && error.code !== "PGRST116") {
            throw error;
          }

          return { data, error: null };
        },
        { retries: 1 }
      );

      if (inactiveRole) {
        console.warn(
          `Role with id ${adminData.role_id} exists but is inactive (is_active: ${inactiveRole.is_active})`
        );
        // Still return the role even if inactive, so the user can see what role they have
        // The requireRole function will still check role_level
        return inactiveRole;
      } else {
        console.error(
          `Role with id ${adminData.role_id} does not exist in the roles table`
        );
        return null;
      }
    }

    return roleData;
  } catch (error) {
    console.error("Error in getRoleForCurrentUser:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
};
