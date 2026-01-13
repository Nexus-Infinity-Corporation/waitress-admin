import { z } from "zod";

/**
 * Zod schema for login form validation
 * Validates email and password fields with appropriate constraints
 */
export const loginSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Email is required"
          : "Email must be a string",
    })
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(z.email({ error: "Invalid email format" }).toLowerCase()),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Password is required"
          : "Password must be a string",
    })
    .trim()
    .min(1, { error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
});

/**
 * Type inferred from the login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Helper function to parse FormData into login schema
 * Extracts and validates form data from Next.js FormData object
 */
export function parseLoginFormData(formData: FormData):
  | {
      success: true;
      data: LoginFormData;
    }
  | {
      success: false;
      errors: Record<string, string[]>;
    } {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transform Zod errors into the format expected by LoginState
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return { success: false, errors };
}
