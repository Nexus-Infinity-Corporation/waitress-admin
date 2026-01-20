import { z } from "zod";

/**
 * Zod schema for creating a new administrator
 * Validates all required and optional fields for administrator creation
 */
export const createAdministratorSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name must be less than 100 characters" }),
  lastName: z
    .string()
    .trim()
    .max(100, { message: "Last name must be less than 100 characters" })
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .pipe(z.email({ message: "Invalid email format" }).toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-()]+$/, {
      message: "Invalid phone number format",
    })
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be less than 50 characters" })
    .optional(),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().trim().default("administrator").optional(),
});

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
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const result = createAdministratorSchema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transform Zod errors into the format expected by form state
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.map((key: PropertyKey) => String(key)).join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return { success: false, errors };
}
