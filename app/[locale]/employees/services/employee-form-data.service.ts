import { createClient } from "@/lib/supabase/server";

export interface BusinessOption {
  id: string;
  name: string;
}

export interface BranchOption {
  id: string;
  name: string;
  businessId: string;
}

/**
 * Fetches all active businesses for dropdown selection
 */
export async function getBusinesses(): Promise<BusinessOption[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("business")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching businesses:", error);
      return [];
    }

    return (data || []).map((business) => ({
      id: business.id,
      name: business.name || "Unnamed Business",
    }));
  } catch (error) {
    console.error("Error in getBusinesses:", error);
    return [];
  }
}

/**
 * Fetches branches for a specific business
 */
export async function getBranchesByBusiness(
  businessId: string
): Promise<BranchOption[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, business_id")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching branches:", error);
      return [];
    }

    return (data || []).map((branch) => ({
      id: branch.id,
      name: branch.name || "Unnamed Branch",
      businessId: branch.business_id || businessId,
    }));
  } catch (error) {
    console.error("Error in getBranchesByBusiness:", error);
    return [];
  }
}

/**
 * Fetches all active branches
 */
export async function getBranches(): Promise<BranchOption[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, business_id")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching branches:", error);
      return [];
    }

    return (data || []).map((branch) => ({
      id: branch.id,
      name: branch.name || "Unnamed Branch",
      businessId: branch.business_id || "",
    }));
  } catch (error) {
    console.error("Error in getBranches:", error);
    return [];
  }
}
