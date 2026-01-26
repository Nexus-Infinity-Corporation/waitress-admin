"use server";

import { getUserByEmail } from "@/services/users.service";

export interface CheckEmailResult {
  exists: boolean;
  userId?: string;
  isActive?: boolean;
  userName?: string;
}

/**
 * Server action to check if an email is already registered
 * @param email - Email to check
 * @returns Object indicating if email exists, user ID, active status, and name if found
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
      const userName = [existingUser.first_name, existingUser.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        exists: true,
        userId: existingUser.id,
        isActive: existingUser.is_active,
        userName: userName || undefined,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error checking email existence:", error);
    return { exists: false };
  }
}
