import { cache } from "react";
import type { Employee } from "@/shared/types/restaurant";
import { createClient } from "@/lib/supabase/server";
import type {
  DatabaseUser,
  DatabaseEmployeeRole,
  DatabaseEmployeeAssignment,
  DatabaseRole,
  DatabaseBusiness,
  DatabaseBranch,
} from "../types/employees";

/**
 * Maps database employee data to the Employee interface
 */
function mapEmployeeToInterface(
  user: DatabaseUser,
  employeeRole: DatabaseEmployeeRole | null,
  employeeAssignment: DatabaseEmployeeAssignment | null,
  role: DatabaseRole | null,
  business: DatabaseBusiness | null,
  branch: DatabaseBranch | null
): Employee {
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    user.email ||
    "Unknown";

  // Determine role from employee_role, role table, or employee_assignment
  let roleName = "Employee";
  if (role?.display_name) {
    roleName = role.display_name;
  } else if (role?.name) {
    roleName = role.name;
  } else if (employeeRole?.role) {
    roleName =
      employeeRole.role.charAt(0).toUpperCase() + employeeRole.role.slice(1);
  } else if (employeeRole?.position) {
    roleName = employeeRole.position;
  }

  // Determine status based on is_active flags
  let status: "Active" | "Inactive" | "On Leave" = "Active";
  if (!user.is_active) {
    status = "Inactive";
  } else if (
    employeeAssignment &&
    employeeAssignment.end_date &&
    new Date(employeeAssignment.end_date) < new Date()
  ) {
    status = "On Leave";
  } else if (employeeRole && !employeeRole.is_active) {
    status = "Inactive";
  } else if (employeeAssignment && employeeAssignment.is_active === false) {
    status = "Inactive";
  }

  // Calculate salary from hourly rate if available
  let salary: string | undefined;
  if (employeeAssignment?.hourly_rate) {
    // Assuming 40 hours/week * 4 weeks = 160 hours/month
    const monthlySalary = employeeAssignment.hourly_rate * 160;
    salary = `$${monthlySalary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Use start_date from assignment or created_at from user
  const hireDate = employeeAssignment?.start_date
    ? new Date(employeeAssignment.start_date).toISOString().split("T")[0]
    : new Date(user.created_at).toISOString().split("T")[0];

  return {
    id: user.id,
    name: fullName,
    email: user.email || "",
    phone: user.phone,
    role: roleName,
    status,
    hireDate,
    salary,
    avatar: user.photo_url || undefined,
    position: employeeRole?.position || employeeAssignment?.notes || null,
    businessId:
      business?.id ||
      employeeRole?.business_id ||
      employeeAssignment?.business_id ||
      null,
    businessName: business?.name || null,
    branchId:
      branch?.id ||
      employeeRole?.branch_id ||
      employeeAssignment?.branch_id ||
      null,
    branchName: branch?.name || null,
    hourlyRate: employeeAssignment?.hourly_rate || null,
  };
}

/**
 * Fetches all employees from the database
 * Joins with employee_roles, employee_assignments, roles, business, and branches
 */
export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();

  try {
    // First, get all user IDs that have employee_roles or employee_assignments
    // This identifies employees (since user_type column doesn't exist)
    const [employeeRolesCheck, employeeAssignmentsCheck] = await Promise.all([
      supabase.from("employee_roles").select("user_id").eq("is_active", true),
      supabase
        .from("employee_assignments")
        .select("user_id")
        .eq("is_active", true),
    ]);

    const employeeRoleUserIds =
      employeeRolesCheck.data?.map((er) => er.user_id) || [];
    const employeeAssignmentUserIds =
      employeeAssignmentsCheck.data?.map((ea) => ea.user_id) || [];

    // Get unique user IDs that have employee records
    const userIds = [
      ...new Set([...employeeRoleUserIds, ...employeeAssignmentUserIds]),
    ];

    if (userIds.length === 0) {
      return [];
    }

    // Fetch users, employee roles, and assignments in parallel
    const [usersResult, employeeRolesResult, employeeAssignmentsResult] =
      await Promise.all([
        supabase
          .from("users")
          .select("*")
          .in("id", userIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("employee_roles")
          .select("*")
          .in("user_id", userIds)
          .eq("is_active", true),
        supabase
          .from("employee_assignments")
          .select("*")
          .in("user_id", userIds)
          .eq("is_active", true),
      ]);

    const { data: users, error: usersError } = usersResult;

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Failed to fetch employees: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return [];
    }

    const employeeRoles: DatabaseEmployeeRole[] =
      employeeRolesResult.data || [];
    const employeeAssignments: DatabaseEmployeeAssignment[] =
      employeeAssignmentsResult.data || [];

    if (employeeRolesResult.error) {
      console.error(
        "Error fetching employee roles:",
        employeeRolesResult.error
      );
    }

    if (employeeAssignmentsResult.error) {
      console.error(
        "Error fetching employee assignments:",
        employeeAssignmentsResult.error
      );
    }

    // Get unique IDs for related data
    const roleIds = [
      ...new Set(
        employeeAssignments
          .map((a) => a.role_id)
          .filter((id): id is number => id !== null)
      ),
    ];

    const businessIds = [
      ...new Set(
        [
          ...employeeRoles.map((r) => r.business_id),
          ...employeeAssignments.map((a) => a.business_id),
        ].filter((id): id is string => id !== null)
      ),
    ];

    const branchIds = [
      ...new Set(
        [
          ...employeeRoles.map((r) => r.branch_id),
          ...employeeAssignments.map((a) => a.branch_id),
        ].filter((id): id is string => id !== null)
      ),
    ];

    // Fetch all related data in parallel
    const [rolesResult, businessesResult, branchesResult] = await Promise.all([
      roleIds.length > 0
        ? supabase.from("roles").select("*").in("id", roleIds)
        : Promise.resolve({ data: [], error: null }),
      businessIds.length > 0
        ? supabase.from("business").select("*").in("id", businessIds)
        : Promise.resolve({ data: [], error: null }),
      branchIds.length > 0
        ? supabase.from("branches").select("*").in("id", branchIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const roles: DatabaseRole[] = rolesResult.data || [];
    const businesses: DatabaseBusiness[] = businessesResult.data || [];
    const branches: DatabaseBranch[] = branchesResult.data || [];

    if (rolesResult.error) {
      console.error("Error fetching roles:", rolesResult.error);
    }
    if (businessesResult.error) {
      console.error("Error fetching businesses:", businessesResult.error);
    }
    if (branchesResult.error) {
      console.error("Error fetching branches:", branchesResult.error);
    }

    // Map users to employees with related data
    const employees: Employee[] = users.map((user) => {
      const employeeRole =
        (employeeRoles || []).find((er) => er.user_id === user.id) || null;
      const employeeAssignment =
        (employeeAssignments || []).find((ea) => ea.user_id === user.id) ||
        null;
      const role = employeeAssignment?.role_id
        ? roles.find((r) => r.id === employeeAssignment.role_id) || null
        : null;
      const businessId =
        employeeRole?.business_id || employeeAssignment?.business_id || null;
      const business = businessId
        ? businesses.find((b) => b.id === businessId) || null
        : null;
      const branchId =
        employeeRole?.branch_id || employeeAssignment?.branch_id || null;
      const branch = branchId
        ? branches.find((br) => br.id === branchId) || null
        : null;

      return mapEmployeeToInterface(
        user as DatabaseUser,
        employeeRole as DatabaseEmployeeRole | null,
        employeeAssignment as DatabaseEmployeeAssignment | null,
        role as DatabaseRole | null,
        business as DatabaseBusiness | null,
        branch as DatabaseBranch | null
      );
    });

    return employees;
  } catch (error) {
    console.error("Error in getEmployees:", error);
    throw error;
  }
}

/**
 * Fetches a single employee by ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  const supabase = await createClient();

  try {
    // Check if user has employee records (employee_roles or employee_assignments)
    // This identifies employees (since user_type column doesn't exist)
    const [employeeRoleCheck, employeeAssignmentCheck] = await Promise.all([
      supabase
        .from("employee_roles")
        .select("user_id")
        .eq("user_id", id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("employee_assignments")
        .select("user_id")
        .eq("user_id", id)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    // If user has no employee records, they're not an employee
    if (!employeeRoleCheck.data && !employeeAssignmentCheck.data) {
      return null;
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return null;
    }

    // Get employee role
    const { data: employeeRole } = await supabase
      .from("employee_roles")
      .select("*")
      .eq("user_id", id)
      .eq("is_active", true)
      .maybeSingle();

    // Get employee assignment
    const { data: employeeAssignment } = await supabase
      .from("employee_assignments")
      .select("*")
      .eq("user_id", id)
      .eq("is_active", true)
      .maybeSingle();

    // Get role if assignment has role_id
    let role: DatabaseRole | null = null;
    if (employeeAssignment?.role_id) {
      const { data: roleData } = await supabase
        .from("roles")
        .select("*")
        .eq("id", employeeAssignment.role_id)
        .single();
      role = roleData as DatabaseRole | null;
    }

    // Get business
    let business: DatabaseBusiness | null = null;
    const businessId =
      employeeRole?.business_id || employeeAssignment?.business_id;
    if (businessId) {
      const { data: businessData } = await supabase
        .from("business")
        .select("*")
        .eq("id", businessId)
        .single();
      business = businessData as DatabaseBusiness | null;
    }

    // Get branch
    let branch: DatabaseBranch | null = null;
    const branchId = employeeRole?.branch_id || employeeAssignment?.branch_id;
    if (branchId) {
      const { data: branchData } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();
      branch = branchData as DatabaseBranch | null;
    }

    return mapEmployeeToInterface(
      user as DatabaseUser,
      employeeRole as DatabaseEmployeeRole | null,
      employeeAssignment as DatabaseEmployeeAssignment | null,
      role,
      business,
      branch
    );
  } catch (error) {
    console.error("Error in getEmployeeById:", error);
    return null;
  }
}

/**
 * Cached version of getEmployees
 * Uses React's cache() to deduplicate requests within the same render cycle
 * This prevents multiple duplicate requests to Supabase during page load
 *
 * Cache is automatically cleared between requests, preventing stale data
 */
export const getCachedEmployees = cache(getEmployees);

/**
 * Cached version of getEmployeeById
 * Uses React's cache() to deduplicate requests within the same render cycle
 * This prevents multiple duplicate requests to Supabase for the same employee
 */
export const getCachedEmployeeById = cache(getEmployeeById);
