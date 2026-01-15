import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

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
