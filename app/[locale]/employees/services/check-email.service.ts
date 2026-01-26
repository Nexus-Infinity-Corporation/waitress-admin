"use server";

import { getUserByEmail } from "@/services/users.service";

export interface CheckEmailResult {
  exists: boolean;
  userId?: string;
}

/**
 * Server action to check if an email is already registered
 * @param email - Email to check
 * @returns Object indicating if email exists and user ID if found
 */
export async function checkEmailExistsAction(
  email: string
): Promise<CheckEmailResult> {
  if (!email || !email.includes("@")) {
    return { exists: false };
  }

  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        exists: true,
        userId: existingUser.id,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error checking email existence:", error);
    return { exists: false };
  }
}
