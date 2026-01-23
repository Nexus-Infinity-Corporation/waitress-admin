"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const supabase = await createClient();
    // ============================================
    // STEP 1 & 2: Create user in Auth and users table
    // ============================================
    console.log("=== Starting Administrator Creation ===");
    console.log("Steps 1-2: Creating user in Auth and users table...");

    const { createUser } = await import("@/services/users.service");

    let userResult: { userId: string; email: string };
    try {
      userResult = await createUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        userType: "administrator",
      });
      console.log(
        "Steps 1-2 COMPLETED: User created successfully in Auth and users table"
      );
    } catch (userError) {
      console.error("Steps 1-2 FAILED: User creation error:", userError);
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

    // ============================================
    // STEP 3: Create administrator record
    // ============================================
    console.log(
      "Step 3: Creating administrator record in administrators table..."
    );
    console.log("Step 3: Using user_id:", finalUserId);

    // Use admin client to bypass RLS policies
    const serviceRoleKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    let adminError: { message: string } | null = null;

    if (serviceRoleKey) {
      // Use admin client to bypass RLS policies
      const supabaseAdmin = createAdminClient();

      const insertData = {
        id: finalUserId, // Same ID as users.id and auth.users.id
        name: fullName,
        email,
        phone: phone || "",
        role: role || "administrator",
        status: "active",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log(
        "Step 3: Inserting administrator with data:",
        JSON.stringify(insertData, null, 2)
      );

      const { error, data, status, statusText } = await supabaseAdmin
        .from("administrators")
        .insert(insertData)
        .select();

      console.log(
        "Step 3: Insert response - status:",
        status,
        "statusText:",
        statusText
      );
      console.log("Step 3: Insert response - error:", error);
      console.log("Step 3: Insert response - data:", data);

      if (error) {
        adminError = error;
        console.error(
          "Step 3 FAILED: Administrator insert error:",
          JSON.stringify(error, null, 2)
        );
        console.error("Step 3 FAILED: Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      } else if (!data || data.length === 0) {
        adminError = { message: "Insert succeeded but no data returned" };
        console.error("Step 3 FAILED: Insert succeeded but returned no data");
      } else {
        console.log(
          "Step 3 SUCCESS: Administrator record created:",
          JSON.stringify(data, null, 2)
        );

        // Verify the record was actually inserted by fetching it
        const { data: verifyData, error: verifyError } = await supabaseAdmin
          .from("administrators")
          .select("*")
          .eq("id", finalUserId)
          .single();

        if (verifyError) {
          console.error(
            "Step 3 VERIFY FAILED: Could not verify administrator creation:",
            verifyError
          );
        } else {
          console.log(
            "Step 3 VERIFY SUCCESS: Administrator verified in database:",
            verifyData
          );
        }

        console.log("=== Administrator Creation COMPLETED ===");
      }
    } else {
      // Fallback to regular client (will fail if RLS policies block inserts)
      const { error } = await supabase.from("administrators").insert({
        id: finalUserId, // Same ID as users.id and auth.users.id
        name: fullName,
        email,
        phone: phone || "",
        role: role || "administrator",
        status: "active",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        adminError = error;
        console.error(
          "Step 3 FAILED: Administrator insert error (regular client):",
          error
        );
      } else {
        console.log(
          "Step 3 SUCCESS: Administrator record created (regular client)"
        );
        console.log("=== Administrator Creation COMPLETED ===");
      }
    }

    if (adminError) {
      console.error("=== Administrator Creation FAILED ===");
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
