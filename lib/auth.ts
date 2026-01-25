import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { getRoleForCurrentUser } from "@/lib/supabase/roles";

/**
 * Checks if the user is authenticated
 * If not authenticated, redirects to login page
 * @param redirectTo - Optional path to redirect to after login
 * @returns The authenticated user
 */
export async function requireAuth(redirectTo?: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const locale = await getLocale();
    const loginPath = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect({ href: loginPath, locale });
  }

  return user;
}

/**
 * Checks if the user has the required role level
 * If not authenticated or insufficient role level, redirects to dashboard
 * @param minRoleLevel - Minimum role level required (e.g., 9 for administrators)
 * @param redirectTo - Optional path to redirect to if access is denied (defaults to dashboard)
 * @returns The user's role
 */
export async function requireRole(
  minRoleLevel: number,
  redirectTo: string = "/dashboard"
) {
  // First ensure user is authenticated
  await requireAuth();

  // Get user's role
  const role = await getRoleForCurrentUser();

  if (!role || !role.role_level || role.role_level < minRoleLevel) {
    const locale = await getLocale();
    redirect({ href: redirectTo, locale });
  }

  return role;
}
