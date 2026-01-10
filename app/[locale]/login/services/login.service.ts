"use server";

import type { LoginState } from "@/app/[locale]/login/types/login";

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: LoginState["errors"] = {};

  // Email validation
  if (!email || email.trim() === "") {
    errors.email = ["Email is required"];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Invalid email format"];
  }

  // Password validation
  if (!password || password.trim() === "") {
    errors.password = ["Password is required"];
  } else if (password.length < 6) {
    errors.password = ["Password must be at least 6 characters"];
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // TODO: Implement actual authentication logic here
  // This is a placeholder for the authentication service
  // Example:
  // const user = await authenticateUser(email, password);
  // if (!user) {
  //   return {
  //     errors: {
  //       _form: ["Invalid email or password"],
  //     },
  //   };
  // }

  // For now, return success (remove this when implementing real auth)
  return {
    message: "Login successful",
  };
}
