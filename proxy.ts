import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createClient } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Get the pathname without locale
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";

  // Public routes that don't require authentication
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Check authentication for protected routes
  if (!isPublicRoute) {
    const { supabase, response } = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated, redirect to login
    if (!user) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, continue with intl middleware
    // Apply intl middleware to the request with updated cookies
    const intlResponse = intlMiddleware(request);

    // Merge auth cookies into intl response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        intlResponse.headers.append(key, value);
      }
    });

    return intlResponse;
  }

  // Public route, just handle internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
