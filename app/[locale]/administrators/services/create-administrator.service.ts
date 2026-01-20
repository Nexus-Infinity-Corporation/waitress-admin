"use server";

import { createClient } from "@/lib/supabase/server";
import { parseCreateAdministratorFormData } from "../schemas/create-administrator.schema";
import { revalidatePath } from "next/cache";

export interface CreateAdministratorState {
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Server action to create a new administrator
 * Creates user in auth, users table, and administrator record
 */
export async function createAdministratorAction(
  prevState: CreateAdministratorState | undefined,
  formData: FormData
): Promise<CreateAdministratorState> {
  // Validate form data using Zod schema
  const validation = parseCreateAdministratorFormData(formData);

  // If validation fails, return errors
  if (!validation.success) {
    return { errors: validation.errors };
  }

  // Extract validated data
  const { firstName, lastName, email, phone, username, password, role } =
    validation.data;

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
        userType: "administrator",
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
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || firstName;

    // Step 3: Create administrator record
    const { error: adminError } = await supabase.from("administrators").insert({
      user_id: finalUserId,
      name: fullName,
      email,
      phone: phone || "",
      role: role || "administrator",
      status: "active",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (adminError) {
      return {
        errors: {
          _form: [`Failed to create administrator: ${adminError.message}`],
        },
      };
    }

    // Revalidate the administrators page to show the new administrator
    revalidatePath("/administrators");

    // Return success state
    return {
      message: "Administrator created successfully",
    };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while creating the administrator";

    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
