import type { LoginFormData as ZodLoginFormData } from "../schemas/login.schema";

/**
 * Re-export the Zod-inferred type for consistency
 * This ensures type safety and single source of truth
 */
export type LoginFormData = ZodLoginFormData;

/**
 * State returned by the login server action
 * Used with useActionState hook in the login form
 */
export interface LoginState {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
}
