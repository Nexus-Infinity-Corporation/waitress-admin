"use server";

import { createClient } from "@/lib/supabase/server";

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
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    username,
    userType,
    address,
    age,
  } = userData;

  // Step 1: Create user in Supabase Auth
  // Try using admin API first (requires service role key), fallback to signUp
  let userId: string | undefined;
  let authError: Error | null = null;

  // Check if we have service role key for admin API
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    // Use admin API with service role key (auto-confirms email)
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
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username || email.split("@")[0],
        },
      },
    });

    if (signUpError || !authData.user) {
      authError = new Error(
        signUpError?.message || "Failed to create user account"
      );
    } else {
      userId = authData.user.id;
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

  // Step 2: Create user record in users table
  const { error: userError } = await supabase.from("users").insert({
    id: finalUserId,
    email,
    phone: phone || null,
    first_name: firstName,
    last_name: lastName || null,
    username: username || email.split("@")[0],
    user_type: userType,
    is_active: true,
    address: address || null,
    age: age || null,
  });

  if (userError) {
    // If user creation fails, try to clean up auth user (only if we have admin access)
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
    throw new Error(`Failed to create user record: ${userError.message}`);
  }

  return {
    userId: finalUserId,
    email,
  };
}
