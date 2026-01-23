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
}

/**
 * Creates a user in Supabase Auth and users table
 * Uses admin API if available (auto-confirms email), otherwise falls back to signUp
 *
 * @param userData - User data for creation
 * @returns Created user ID and email
 * @throws Error if user creation fails
 */
export async function createUser(
  userData: CreateUserData
): Promise<CreateUserResult> {
  const supabase = await createClient();
  const { firstName, lastName, email, password, phone, address, age } =
    userData;

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
  // STEP 2: Create user record in users table (public.users)
  // ============================================
  console.log("Step 2: Creating user record in users table...");

  // Use admin client (with secret/service_role key) to bypass RLS policies
  let userError: { message: string } | null = null;

  if (serviceRoleKey) {
    // Use admin client to bypass RLS policies
    console.log("Step 2: Using admin client for users table insert");
    const supabaseAdmin = createAdminClient();

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
      console.error("Step 2 FAILED: Users table insert error:", error);
    } else {
      console.log("Step 2 SUCCESS: User record created in users table:", data);
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
  };
}
