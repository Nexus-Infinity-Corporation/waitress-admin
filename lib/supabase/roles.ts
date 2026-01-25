import supabase from "@/services/api.service";
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

export const getRoleForCurrentUser = async (
  userId: string
): Promise<Role | null> => {
  const { data, error } = await supabase
    .from("administrators")
    .select("role_id")
    .eq("id", userId)
    .single();

  const role = data?.role_id ? await getRoleByLevel(data.role_id) : null;
  if (error) {
    console.error("Error fetching role by user administrator:", error);
  }
  return role;
};
