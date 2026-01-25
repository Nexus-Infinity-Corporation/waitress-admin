import supabase from "@/services/api.service";
import { createClient } from "@/lib/supabase/server";
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
  // Get the authenticated user using server-side client
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
  const { data: adminData, error: adminError } = await supabaseServer
    .from("administrators")
    .select("role_id")
    .eq("id", user.id)
    .single();

  if (adminError) {
    console.error("Error fetching administrator:", adminError);
    return null;
  }

  // If no role_id, return null
  if (!adminData?.role_id) {
    return null;
  }

  // Get the role by ID (role_id is the ID in the roles table, not the level)
  const { data: roleData, error: roleError } = await supabaseServer
    .from("roles")
    .select("*")
    .eq("id", adminData.role_id)
    .eq("is_active", true)
    .single();

  if (roleError) {
    console.error("Error fetching role:", roleError);
    return null;
  }

  return roleData || null;
};
