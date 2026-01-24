"use server";

import { writeToSupabase, adminOperation } from "@/lib/supabase/service";
import { parseCreateAdministratorFormData } from "../schemas/create-administrator.schema";
import { revalidatePath } from "next/cache";

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
    // Log that server action was called
    console.log("🚀 [SERVER] ========================================");
    console.log("🚀 [SERVER] createAdministratorAction called");
    console.log("🚀 [SERVER] prevState:", JSON.stringify(prevState, null, 2));
    console.log("🚀 [SERVER] formData keys:", Array.from(formData.keys()));

    // Log all form data values (except password)
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = key === "password" ? "***" : value.toString();
    });
    console.log(
      "🚀 [SERVER] formData values:",
      JSON.stringify(formDataObj, null, 2)
    );

    // Validate form data using Zod schema
    console.log("🚀 [SERVER] Starting validation...");
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

    console.log("🚀 [SERVER] Validation passed, proceeding with creation...");

    // Extract validated data
    const { firstName, lastName, email, phone, password, role } =
      validation.data;

    // ============================================
    // STEP 1 & 2: Create user in Auth and users table
    // ============================================
    console.log("=== Starting Administrator Creation ===");
    console.log("Steps 1-2: Creating user in Auth and users table...");

    const { createUser } = await import("@/services/users.service");

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
    // STEP 2.5: Check if administrator record already exists
    // ============================================
    console.log("Step 2.5: Checking if administrator record already exists...");

    try {
      const { getAdministratorByUserId, updateAdministrator } =
        await import("./administrators.service");

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
          console.log(
            "Step 2.5 SUCCESS: Administrator record updated:",
            JSON.stringify(updatedAdmin, null, 2)
          );

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
    console.log(
      "Step 3: Creating administrator record in administrators table..."
    );
    console.log("Step 3: Using user_id:", finalUserId);

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

    console.log(
      "Step 3: Inserting administrator with data:",
      JSON.stringify(insertData, null, 2)
    );

    try {
      // Use centralized service with automatic admin client selection
      const data = await writeToSupabase(async (client) => {
        return await client.from("administrators").insert(insertData).select();
      });

      console.log(
        "Step 3 SUCCESS: Administrator record created:",
        JSON.stringify(data, null, 2)
      );

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

        console.log(
          "Step 3 VERIFY SUCCESS: Administrator verified in database:",
          verifyData
        );
      } catch (verifyError) {
        console.error(
          "Step 3 VERIFY FAILED: Could not verify administrator creation:",
          verifyError
        );
        // Don't fail the whole operation if verification fails
      }

      console.log("=== Administrator Creation COMPLETED ===");
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
    console.error(
      "🚀 [SERVER] Unexpected error in createAdministratorAction:",
      error
    );
    console.error(
      "🚀 [SERVER] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

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
