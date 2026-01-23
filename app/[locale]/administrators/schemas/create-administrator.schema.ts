import { z } from "zod";

/**
 * Zod schema for creating a new administrator
 * Validates all required and optional fields for administrator creation
 */
export const createAdministratorSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, { message: "First name is required" })
      .max(100, { message: "First name must be less than 100 characters" }),
    lastName: z
      .string()
      .trim()
      .max(100, { message: "Last name must be less than 100 characters" })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .pipe(z.email({ message: "Invalid email format" }).toLowerCase()),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal("").transform(() => undefined))
      .refine((val) => !val || val === "" || /^\+?[\d\s-()]+$/.test(val), {
        message: "Invalid phone number format",
      }),
    password: z
      .string()
      .trim()
      .min(1, { message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
    role: z
      .string()
      .trim()
      .default("administrator")
      .optional()
      .or(z.literal("").transform(() => "administrator")),
  })
  .passthrough(); // Allow extra fields but ignore them

/**
 * Type inferred from the create administrator schema
 */
export type CreateAdministratorFormData = z.infer<
  typeof createAdministratorSchema
>;

/**
 * Helper function to parse FormData into create administrator schema
 * Extracts and validates form data from Next.js FormData object
 */
export function parseCreateAdministratorFormData(formData: FormData):
  | {
      success: true;
      data: CreateAdministratorFormData;
    }
  | {
      success: false;
      errors: Record<string, string[]>;
    } {
  // Extract only the fields we need from form data
  // Convert null to empty string for string fields, or undefined for optional fields
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const role = formData.get("role");

  const rawData = {
    firstName: firstName ? String(firstName) : "",
    lastName: lastName ? String(lastName) : undefined,
    email: email ? String(email) : "",
    phone: phone ? String(phone) : undefined,
    password: password ? String(password) : "",
    role: role ? String(role) : "administrator",
  };

  // Validate with Zod schema
  const result = createAdministratorSchema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transform Zod errors into the format expected by form state
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    // Handle nested paths (e.g., "address.street" -> "address.street")
    // For simple fields, just use the field name
    const path =
      issue.path.length > 0
        ? issue.path.map((key: PropertyKey) => String(key)).join(".")
        : "unknown";

    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return { success: false, errors };
}
