"use server";

import { writeToSupabase, adminOperation } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DeleteAdministratorState {
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Server action to delete an administrator
 *
 * Process:
 * 1. Delete administrator record from administrators table
 * 2. Optionally delete user from users table and auth.users
 */
export async function deleteAdministratorAction(
  prevState: DeleteAdministratorState | undefined,
  formData: FormData
): Promise<DeleteAdministratorState> {
  try {
    const administratorId = formData.get("administratorId") as string;

    if (!administratorId) {
      return {
        errors: {
          _form: ["Administrator ID is required"],
        },
      };
    }

    console.log("🗑️ [SERVER] Deleting administrator:", administratorId);

    // ============================================
    // STEP 1: Delete administrator record
    // ============================================
    console.log("Step 1: Deleting administrator record...");

    try {
      await writeToSupabase(async (client) => {
        const { error } = await client
          .from("administrators")
          .delete()
          .eq("id", administratorId);

        if (error) {
          throw error;
        }

        return { data: true, error: null };
      });

      console.log("Step 1 SUCCESS: Administrator record deleted");
    } catch (adminError) {
      console.error("Step 1 FAILED: Administrator delete error:", adminError);
      return {
        errors: {
          _form: [
            `Failed to delete administrator: ${
              adminError instanceof Error
                ? adminError.message
                : "Unknown error occurred"
            }`,
          ],
        },
      };
    }

    // ============================================
    // STEP 2: Delete user from users table
    // ============================================
    console.log("Step 2: Deleting user record...");

    try {
      await writeToSupabase(async (client) => {
        const { error } = await client
          .from("users")
          .delete()
          .eq("id", administratorId);

        if (error) {
          throw error;
        }

        return { data: true, error: null };
      });

      console.log("Step 2 SUCCESS: User record deleted");
    } catch (userError) {
      console.error("Step 2 WARNING: User delete error:", userError);
      // Continue even if user deletion fails - administrator is already deleted
    }

    // ============================================
    // STEP 3: Delete user from auth.users
    // ============================================
    console.log("Step 3: Deleting auth user...");

    try {
      await adminOperation(async () => {
        const supabaseAdmin = createAdminClient();
        const { error } =
          await supabaseAdmin.auth.admin.deleteUser(administratorId);

        if (error) {
          throw error;
        }

        return true;
      });

      console.log("Step 3 SUCCESS: Auth user deleted");
    } catch (authError) {
      console.error("Step 3 WARNING: Auth user delete error:", authError);
      // Continue even if auth deletion fails - administrator is already deleted
    }

    // Revalidate the administrators page
    revalidatePath("/administrators");

    return {
      message: "Administrator deleted successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while deleting the administrator";

    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
