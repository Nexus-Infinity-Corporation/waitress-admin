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
    // Step 1: Create user in Supabase Auth
    // Try using admin API first (requires service role key), fallback to signUp
    let userId: string | undefined;
    let authError: Error | null = null;

    // Check if we have service role key for admin API
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      // Use admin API with service role key
      const { createClient: createAdminClient } =
        await import("@supabase/supabase-js");
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );

      const { data: authData, error: adminError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email for admin-created users
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            username: username || email.split("@")[0],
          },
        });

      if (adminError || !authData.user) {
        authError = new Error(
          adminError?.message || "Failed to create user account"
        );
      } else {
        userId = authData.user.id;
      }
    } else {
      // Fallback to regular signUp (requires email confirmation unless disabled in Supabase settings)
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              username: username || email.split("@")[0],
            },
          },
        }
      );

      if (signUpError || !authData.user) {
        authError = new Error(
          signUpError?.message || "Failed to create user account"
        );
      } else {
        userId = authData.user.id;
      }
    }

    if (authError) {
      return {
        errors: {
          _form: [authError.message],
        },
      };
    }

    // Ensure userId is defined (TypeScript guard)
    if (!userId) {
      return {
        errors: {
          _form: ["Failed to create user account: User ID not available"],
        },
      };
    }

    // TypeScript now knows userId is defined, assign to const for clarity
    const finalUserId: string = userId;

    // Step 2: Create user record in users table
    const { error: userError } = await supabase.from("users").insert({
      id: finalUserId,
      first_name: firstName,
      last_name: lastName || null,
      email,
      phone: phone || null,
      username: username || null,
      user_type: "employee",
      is_active: true,
      address: address || null,
      age: age || null,
    });

    if (userError) {
      // If user creation fails, try to clean up auth user (only if we have admin access)
      const serviceRoleKey: string | undefined =
        process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        try {
          const { createClient: createAdminClient } =
            await import("@supabase/supabase-js");
          const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
          );
          await supabaseAdmin.auth.admin.deleteUser(finalUserId);
        } catch (cleanupError) {
          console.error("Failed to cleanup auth user:", cleanupError);
        }
      }
      return {
        errors: {
          _form: [userError.message || "Failed to create user record"],
        },
      };
    }

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
