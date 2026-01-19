/**
 * Database types for employees
 * These types match the Supabase database schema
 */

export interface DatabaseUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  user_type: "customer" | "employee";
  subscription_tier: "free" | "premium" | null;
  subscription_id: string | null;
  photo_url: string | null;
  address: string | null;
  age: number | null;
}

export interface DatabaseEmployeeRole {
  id: string;
  created_at: string;
  user_id: string | null;
  role: "staff" | "admin" | "regular" | null;
  business_id: string | null;
  is_active: boolean;
  branch_id: string | null;
  updated_at: string | null;
  position: string | null;
}

export interface DatabaseEmployeeAssignment {
  id: number;
  created_at: string;
  updated_at: string | null;
  is_active: boolean | null;
  user_id: string | null;
  role_id: number | null;
  business_id: string | null;
  branch_id: string | null;
  start_date: string | null;
  end_date: string | null;
  hourly_rate: number | null;
  notes: string | null;
}

export interface DatabaseRole {
  id: number;
  created_at: string;
  updated_at: string | null;
  name: string | null;
  display_name: string | null;
  description: string | null;
  business_id: string | null;
  role_level: number | null;
  is_active: boolean | null;
  branch_id: string | null;
}

export interface DatabaseBusiness {
  id: string;
  created_at: string;
  is_active: boolean;
  name: string | null;
  description: string | null;
  logo_url: string | null;
  category_id: number | null;
  updated_at: string | null;
}

export interface DatabaseBranch {
  id: string;
  created_at: string;
  business_id: string | null;
  name: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  opening_hours: Record<string, unknown> | null;
  is_active: boolean;
  updated_at: string | null;
  address: string | null;
}

/**
 * Employee with joined data from related tables
 */
export interface EmployeeWithRelations {
  user: DatabaseUser;
  employee_role: DatabaseEmployeeRole | null;
  employee_assignment: DatabaseEmployeeAssignment | null;
  role: DatabaseRole | null;
  business: DatabaseBusiness | null;
  branch: DatabaseBranch | null;
}
