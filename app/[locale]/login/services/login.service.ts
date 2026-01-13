"use server";

import type { LoginState } from "@/app/[locale]/login/types/login";
import { signInWithEmail } from "@/services/employees.service";
import { parseLoginFormData } from "../schemas/login.schema";

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  // Validate form data using Zod schema
  const validation = parseLoginFormData(formData);

  // If validation fails, return errors
  if (!validation.success) {
    return { errors: validation.errors };
  }

  // Extract validated data
  const { email, password } = validation.data;

  try {
    // Attempt to sign in with validated credentials
    const user = await signInWithEmail(email, password);

    if (!user) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
      };
    }

    // Return success state
    return {
      message: "Login successful",
    };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during login";

    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
