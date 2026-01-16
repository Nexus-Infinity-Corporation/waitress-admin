import { z } from "zod";

/**
 * Zod schema for creating a new employee
 * Validates all required and optional fields for employee creation
 */
export const createEmployeeSchema = z.object({
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
  role: z.string().trim().optional(),
  position: z
    .string()
    .trim()
    .max(100, { message: "Position must be less than 100 characters" })
    .optional(),
  businessId: z
    .string()
    .uuid({ message: "Invalid business ID format" })
    .optional(),
  branchId: z.string().uuid({ message: "Invalid branch ID format" }).optional(),
  hourlyRate: z
    .string()
    .optional()
    .transform((val: string | undefined) => (val ? parseFloat(val) : undefined))
    .pipe(
      z
        .number()
        .positive({ message: "Hourly rate must be positive" })
        .optional()
    ),
  address: z
    .string()
    .trim()
    .max(500, { message: "Address must be less than 500 characters" })
    .optional(),
  age: z
    .string()
    .optional()
    .transform((val: string | undefined) =>
      val ? parseInt(val, 10) : undefined
    )
    .pipe(
      z
        .number()
        .int({ message: "Age must be an integer" })
        .min(16, { message: "Age must be at least 16" })
        .max(100, { message: "Age must be less than 100" })
        .optional()
    ),
});

/**
 * Type inferred from the create employee schema
 */
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

/**
 * Helper function to parse FormData into create employee schema
 * Extracts and validates form data from Next.js FormData object
 */
export function parseCreateEmployeeFormData(formData: FormData):
  | {
      success: true;
      data: CreateEmployeeFormData;
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
    position: formData.get("position"),
    businessId: formData.get("businessId"),
    branchId: formData.get("branchId"),
    hourlyRate: formData.get("hourlyRate"),
    address: formData.get("address"),
    age: formData.get("age"),
  };

  const result = createEmployeeSchema.safeParse(rawData);

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
