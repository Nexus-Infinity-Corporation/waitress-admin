"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  username?: string;
  userType: "administrator" | "employee" | "customer";
  address?: string;
  age?: number;
}

export interface CreateUserResult {
  userId: string;
  email: string;
  isExisting?: boolean; // Flag to indicate if user already existed
}

export interface ExistingUser {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  address?: string;
  age?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Check if a user exists by email in the users table
 *
 * @param email - Email to check
 * @returns User data if exists, null if not found
 */
export async function getUserByEmail(
  email: string
): Promise<ExistingUser | null> {
  console.log("Checking if user exists with email:", email);

  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    if (serviceRoleKey) {
      // Use admin client for broader access
      const supabaseAdmin = createAdminClient();

      const { data: userData, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Error checking user existence:", error);
        return null;
      }

      return userData || null;
    } else {
      // Use regular client (limited by RLS)
      const supabase = await createClient();

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking user existence:", error);
        return null;
      }

      return userData || null;
    }
  } catch (error) {
    console.error("Exception checking user existence:", error);
    return null;
  }
}

/**
 * Update existing user data
 *
 * @param userId - User ID to update
 * @param updateData - Data to update
 * @returns Updated user data
 */
export async function updateUser(
  userId: string,
  updateData: Partial<Omit<CreateUserData, "password" | "userType">>
): Promise<ExistingUser | null> {
  console.log("Updating existing user:", userId);

  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    if (serviceRoleKey) {
      const supabaseAdmin = createAdminClient();

      const updatePayload = {
        first_name: updateData.firstName,
        last_name: updateData.lastName || null,
        phone: updateData.phone || null,
        address: updateData.address || null,
        age: updateData.age || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabaseAdmin
        .from("users")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return null;
      }

      return updatedUser;
    } else {
      console.warn("Cannot update user: No service role key available");
      return null;
    }
  } catch (error) {
    console.error("Exception updating user:", error);
    return null;
  }
}

/**
 * Creates a user in Supabase Auth and users table
 * First checks if user exists, if so returns existing user or updates it
 * Uses admin API if available (auto-confirms email), otherwise falls back to signUp
 *
 * @param userData - User data for creation
 * @param updateIfExists - Whether to update user data if user already exists (default: false)
 * @returns Created or existing user ID and email
 * @throws Error if user creation fails
 */
export async function createUser(
  userData: CreateUserData,
  updateIfExists: boolean = false
): Promise<CreateUserResult> {
  const supabase = await createClient();
  const { firstName, lastName, email, password, phone, address, age } =
    userData;

  // ============================================
  // STEP 0: Check if user already exists
  // ============================================
  console.log("Step 0: Checking if user already exists with email:", email);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    console.log("User already exists:", existingUser.id);

    if (updateIfExists) {
      console.log("Updating existing user data...");

      const updatedUser = await updateUser(existingUser.id, userData);

      if (updatedUser) {
        console.log("User updated successfully:", updatedUser.id);
        return {
          userId: updatedUser.id,
          email: updatedUser.email,
          isExisting: true,
        };
      } else {
        console.log("Failed to update user, returning existing user data");
      }
    }

    console.log("Returning existing user without update");
    return {
      userId: existingUser.id,
      email: existingUser.email,
      isExisting: true,
    };
  }

  console.log("User does not exist, proceeding with creation...");

  // ============================================
  // STEP 1: Create user in Supabase Auth (auth.users)
  // ============================================
  console.log("Step 1: Creating user in Supabase Auth...");

  // Try using admin API first (requires service role key), fallback to signUp
  let userId: string | undefined;
  let authError: Error | null = null;

  // Check if we have service role/secret key for admin API
  // Support both legacy (SUPABASE_SERVICE_ROLE_KEY) and new (SUPABASE_SECRET_KEY) naming
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Step 1: Service role key available:", !!serviceRoleKey);
  if (!serviceRoleKey) {
    console.warn(
      "Step 1: WARNING - No service role key found. Admin operations will fail!"
    );
  }

  if (serviceRoleKey) {
    // Use admin API with service role key (auto-confirms email)
    const supabaseAdmin = createAdminClient();

    const { data: authData, error: adminError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (adminError || !authData.user) {
      authError = new Error(
        adminError?.message || "Failed to create user account"
      );
      console.error("Step 1 FAILED: Auth user creation error:", adminError);
    } else {
      userId = authData.user.id;
      console.log("Step 1 SUCCESS: Auth user created with ID:", userId);
    }
  } else {
    // Fallback to regular signUp (requires email confirmation unless disabled in Supabase settings)
    console.error(
      "Step 1 FAILED: Auth user creation error: No service role key found"
    );
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (signUpError || !authData.user) {
      authError = new Error(
        signUpError?.message || "Failed to create user account"
      );
      console.error("Step 1 FAILED: SignUp error:", signUpError);
    } else {
      userId = authData.user.id;
      console.log("Step 1 SUCCESS: Auth user created with ID:", userId);
    }
  }

  if (authError) {
    throw authError;
  }

  // Ensure userId is defined (TypeScript guard)
  if (!userId) {
    throw new Error("Failed to create user account: User ID not available");
  }

  const finalUserId: string = userId;

  // ============================================
  // STEP 1.5: Verify user exists in auth.users before proceeding
  // ============================================
  console.log(
    "Step 1.5: Verifying auth user exists before creating users record..."
  );

  if (serviceRoleKey) {
    const supabaseAdmin = createAdminClient();

    // Retry verification up to 3 times with exponential backoff
    let userExists = false;
    let verifyAttempts = 0;
    const maxVerifyAttempts = 3;

    while (!userExists && verifyAttempts < maxVerifyAttempts) {
      try {
        const { data: authUser, error: verifyError } =
          await supabaseAdmin.auth.admin.getUserById(finalUserId);

        if (authUser && authUser.user) {
          userExists = true;
          console.log("Step 1.5 SUCCESS: Auth user verified to exist");
        } else if (verifyError) {
          console.warn(
            `Step 1.5: Verification attempt ${verifyAttempts + 1} failed:`,
            verifyError.message
          );
        }
      } catch (verifyErr) {
        console.warn(
          `Step 1.5: Verification attempt ${verifyAttempts + 1} error:`,
          verifyErr
        );
      }

      if (!userExists && verifyAttempts < maxVerifyAttempts - 1) {
        // Wait before retrying (exponential backoff: 100ms, 200ms, 400ms)
        const delay = 100 * Math.pow(2, verifyAttempts);
        console.log(`Step 1.5: Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      verifyAttempts++;
    }

    if (!userExists) {
      console.error(
        "Step 1.5 FAILED: Could not verify auth user exists after multiple attempts"
      );
      throw new Error(
        "Auth user verification failed - user may not have been created properly"
      );
    }
  }

  // ============================================
  // STEP 2: Create user record in users table (public.users)
  // ============================================
  console.log("Step 2: Creating user record in users table...");

  // Use admin client (with secret/service_role key) to bypass RLS policies
  let userError: { message: string } | null = null;

  if (serviceRoleKey) {
    // Use admin client to bypass RLS policies
    console.log("Step 2: Using admin client for users table insert");
    const supabaseAdmin = createAdminClient();

    // Try using RPC function first (bypasses check constraints with SECURITY DEFINER)
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
        "insert_user_with_auth_validation",
        {
          p_id: finalUserId,
          p_email: email,
          p_phone: phone || "",
          p_first_name: firstName,
          p_last_name: lastName || "",
          p_is_active: true,
          p_address: address || null,
          p_age: age || null,
        }
      );

      if (rpcError) {
        console.warn(
          "Step 2: RPC function failed, falling back to direct insert:",
          rpcError.message
        );
        // Fallback to direct insert if RPC function doesn't exist
        throw rpcError;
      }

      console.log(
        "Step 2 SUCCESS: User record created via RPC function:",
        rpcData
      );
    } catch {
      // Fallback: Try direct insert with retry logic
      console.log(
        "Step 2: Falling back to direct insert (RPC may not exist)..."
      );

      let insertAttempts = 0;
      const maxInsertAttempts = 3;
      let insertSuccess = false;

      while (!insertSuccess && insertAttempts < maxInsertAttempts) {
        const { error, data } = await supabaseAdmin
          .from("users")
          .insert({
            id: finalUserId,
            email,
            phone: phone || null,
            first_name: firstName,
            last_name: lastName || null,
            is_active: true,
            address: address || null,
            age: age || null,
          })
          .select();

        if (error) {
          userError = error;
          console.error(
            `Step 2 FAILED: Users table insert error (attempt ${insertAttempts + 1}):`,
            error.message,
            error.details,
            error.hint
          );

          // If it's the check constraint error and not the last attempt, wait and retry
          if (
            error.message.includes("users_id_auth_check") &&
            insertAttempts < maxInsertAttempts - 1
          ) {
            const delay = 500 * Math.pow(2, insertAttempts); // 500ms, 1s, 2s
            console.log(
              `Step 2: Check constraint failed, waiting ${delay}ms before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            insertAttempts++;
            continue;
          }

          break; // Exit loop on other errors or last attempt
        } else {
          insertSuccess = true;
          console.log(
            "Step 2 SUCCESS: User record created in users table:",
            data
          );
        }
      }
    }
  } else {
    // Fallback to regular client (will fail if RLS policies block inserts)
    console.warn(
      "Step 2: WARNING - Using regular client (anon key). This will likely fail due to RLS!"
    );
    const { error } = await supabase.from("users").insert({
      id: finalUserId,
      email,
      phone: phone || null,
      first_name: firstName,
      last_name: lastName || null,
      is_active: true,
      address: address || null,
      age: age || null,
    });

    if (error) {
      userError = error;
      console.error(
        "Step 2 FAILED: Users table insert error (regular client):",
        error
      );
    } else {
      console.log(
        "Step 2 SUCCESS: User record created in users table (regular client)"
      );
    }
  }

  if (userError) {
    // If user creation fails, try to clean up auth user (only if we have admin access)
    console.log(
      "Step 2 FAILED: Cleaning up auth user due to users table insert failure..."
    );
    if (serviceRoleKey) {
      try {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin.auth.admin.deleteUser(finalUserId);
        console.log("Step 2 CLEANUP: Auth user deleted successfully");
      } catch (cleanupError) {
        console.error(
          "Step 2 CLEANUP FAILED: Failed to cleanup auth user:",
          cleanupError
        );
      }
    }
    throw new Error(`Failed to create user record: ${userError.message}`);
  }

  return {
    userId: finalUserId,
    email,
    isExisting: false, // This is a newly created user
  };
}
