"use server";

import { createClient } from "@/lib/supabase/server";
import { parseCreateEmployeeFormData } from "../schemas/create-employee.schema";
import { revalidatePath } from "next/cache";

export interface CreateEmployeeState {
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Server action to create a new employee
 * Creates user in auth, users table, and optionally employee_role/employee_assignment
 */
export async function createEmployeeAction(
  prevState: CreateEmployeeState | undefined,
  formData: FormData
): Promise<CreateEmployeeState> {
  // Validate form data using Zod schema
  const validation = parseCreateEmployeeFormData(formData);

  // If validation fails, return errors
  if (!validation.success) {
    return { errors: validation.errors };
  }

  // Extract validated data
  const {
    firstName,
    lastName,
    email,
    phone,
    username,
    password,
    role,
    position,
    businessId,
    branchId,
    hourlyRate,
    address,
    age,
  } = validation.data;

  const supabase = await createClient();

  try {
    // Step 1: Create user in Supabase Auth and users table using shared service
    const { createUser } = await import("@/services/users.service");

    let userResult: { userId: string; email: string };
    try {
      userResult = await createUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        username,
        userType: "employee",
        address,
        age,
      });
    } catch (userError) {
      return {
        errors: {
          _form: [
            userError instanceof Error
              ? userError.message
              : "Failed to create user account",
          ],
        },
      };
    }

    const finalUserId = userResult.userId;

    // Step 3: Create employee_role if role or position is provided
    if (role || position || businessId || branchId) {
      const { error: roleError } = await supabase
        .from("employee_roles")
        .insert({
          user_id: finalUserId,
          role: (role as "staff" | "admin" | "regular") || null,
          position: position || null,
          business_id: businessId || null,
          branch_id: branchId || null,
          is_active: true,
        });

      if (roleError) {
        console.error("Error creating employee role:", roleError);
        // Don't fail the entire operation if role creation fails
        // The user is still created, just without role assignment
      }
    }

    // Step 4: Create employee_assignment if hourlyRate or other assignment data is provided
    if (hourlyRate || businessId || branchId) {
      // Get role_id if we need to link to a role
      let roleId: number | null = null;
      if (role || position) {
        // Try to find existing role or create one
        const { data: existingRole } = await supabase
          .from("roles")
          .select("id")
          .eq("business_id", businessId || "")
          .eq("name", role || position || "")
          .single();

        if (existingRole) {
          roleId = existingRole.id;
        }
      }

      const { error: assignmentError } = await supabase
        .from("employee_assignments")
        .insert({
          user_id: finalUserId,
          role_id: roleId,
          business_id: businessId || null,
          branch_id: branchId || null,
          hourly_rate: hourlyRate || null,
          start_date: new Date().toISOString(),
          is_active: true,
        });

      if (assignmentError) {
        console.error("Error creating employee assignment:", assignmentError);
        // Don't fail the entire operation if assignment creation fails
      }
    }

    // Revalidate the employees page to show the new employee
    revalidatePath("/employees");

    return {
      message: "Employee created successfully",
    };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while creating the employee";

    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
