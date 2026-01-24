"use server";

import { writeToSupabase, adminOperation } from "@/lib/supabase/service";
import { parseCreateAdministratorFormData } from "../schemas/create-administrator.schema";
import { revalidatePath } from "next/cache";
import { createUser } from "@/services/users.service";
import {
  getAdministratorByUserId,
  updateAdministrator,
} from "./administrators.service";

export interface CreateAdministratorState {
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Server action to create a new administrator
 *
 * Process:
 * 1. Checks if user exists by email, if so uses existing user (with optional update)
 * 2. If user doesn't exist, creates user in auth and users table
 * 3. Checks if administrator record exists, if so updates it
 * 4. If administrator record doesn't exist, creates new one
 *
 * This approach prevents duplicate users and handles partial creation scenarios
 */
export async function createAdministratorAction(
  prevState: CreateAdministratorState | undefined,
  formData: FormData
): Promise<CreateAdministratorState> {
  try {
    // Log all form data values (except password)
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = key === "password" ? "***" : value.toString();
    });

    const validation = parseCreateAdministratorFormData(formData);

    console.log(
      "🚀 [SERVER] Validation result:",
      validation.success ? "SUCCESS" : "FAILED"
    );
    if (!validation.success) {
      console.error(
        "🚀 [SERVER] Validation errors:",
        JSON.stringify(validation.errors, null, 2)
      );
      return { errors: validation.errors };
    }

    // Extract validated data
    const { firstName, lastName, email, phone, password, role } =
      validation.data;

    // ============================================
    // STEP 1 & 2: Create user in Auth and users table
    // ============================================
    let userResult: { userId: string; email: string; isExisting?: boolean };
    try {
      userResult = await createUser(
        {
          firstName,
          lastName,
          email,
          password,
          phone,
          userType: "administrator",
        },
        true
      ); // updateIfExists = true for administrators

      if (userResult.isExisting) {
        console.log("Steps 1-2 INFO: User already exists, using existing user");
      } else {
        console.log(
          "Steps 1-2 COMPLETED: User created successfully in Auth and users table"
        );
      }
    } catch (userError) {
      console.error("Steps 1-2 FAILED: User creation/lookup error:", userError);
      return {
        errors: {
          _form: [
            userError instanceof Error
              ? userError.message
              : "Failed to create or find user account",
          ],
        },
      };
    }

    const finalUserId = userResult.userId;

    // ============================================
    // STEP 2.3: Resolve role string to role_id
    // ============================================
    // First, resolve role string to role_id using centralized service
    let roleId: number | null = null;
    if (role) {
      try {
        const { getRoleByName } = await import("./administrators.service");
        const roleData = await getRoleByName(role);
        roleId = roleData?.id || null;

        if (!roleData) {
          console.warn(`Role "${role}" not found, using null`);
        } else {
          console.log(`Role "${role}" resolved to ID:`, roleId);
        }
      } catch (roleError) {
        console.warn("Failed to resolve role, using null:", roleError);
      }
    }

    // Generate username from email (before @ symbol) or use first name
    const username = email.split("@")[0] || firstName.toLowerCase();

    // ============================================
    // STEP 2.5: Check if administrator record already exists
    // ============================================
    console.log("Step 2.5: Checking if administrator record already exists...");

    try {
      const existingAdmin = await getAdministratorByUserId(finalUserId);

      if (existingAdmin) {
        console.log(
          "Step 2.5 INFO: Administrator record already exists, updating..."
        );

        // Update existing administrator record
        const updateData = {
          role_id: roleId,
          phone: phone || null,
          status: "active",
          username: username,
        };

        const updatedAdmin = await updateAdministrator(finalUserId, updateData);

        if (updatedAdmin) {
          // Revalidate and return success
          revalidatePath("/administrators");
          return {
            message: "Administrator updated successfully",
          };
        } else {
          console.warn(
            "Step 2.5 WARNING: Failed to update administrator, proceeding with creation..."
          );
        }
      } else {
        console.log(
          "Step 2.5 INFO: No existing administrator record found, creating new one..."
        );
      }
    } catch (adminCheckError) {
      console.warn(
        "Step 2.5 WARNING: Could not check existing administrator, proceeding with creation:",
        adminCheckError
      );
    }

    // ============================================
    // STEP 3: Create administrator record
    // ============================================

    // Use centralized service to create administrator record
    // Only include fields that actually exist in the administrators table schema
    const insertData = {
      id: finalUserId, // Same ID as users.id and auth.users.id
      role_id: roleId, // Foreign key to roles table (can be null)
      phone: phone || null,
      status: "active",
      username: username,
      updated_at: new Date().toISOString(),
      // created_at is auto-generated by database DEFAULT now()
    };

    try {
      // Use centralized service with automatic admin client selection
      const data = await writeToSupabase(async (client) => {
        return await client.from("administrators").insert(insertData).select();
      });

      // Verify the record was actually inserted by fetching it
      try {
        const verifyData = await adminOperation(async (client) => {
          const { data: verify, error: verifyError } = await client
            .from("administrators")
            .select("*")
            .eq("id", finalUserId)
            .single();

          if (verifyError) {
            throw verifyError;
          }
          return verify;
        });
      } catch (verifyError) {
        console.error(
          "Step 3 VERIFY FAILED: Could not verify administrator creation:",
          verifyError
        );
        // Don't fail the whole operation if verification fails
      }
    } catch (adminError) {
      console.error("=== Administrator Creation FAILED ===");
      console.error(
        "Step 3 FAILED: Administrator insert error:",
        adminError instanceof Error ? adminError.message : String(adminError)
      );

      return {
        errors: {
          _form: [
            `Failed to create administrator: ${
              adminError instanceof Error
                ? adminError.message
                : "Unknown error occurred"
            }`,
          ],
        },
      };
    }

    // Revalidate the administrators page to show the new administrator
    revalidatePath("/administrators");

    // Return success state
    return {
      message: userResult.isExisting
        ? "Administrator record created for existing user successfully"
        : "Administrator created successfully",
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
