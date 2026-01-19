import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createClient } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";

  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Skip auth check for public routes
  if (isPublicRoute) {
    return intlMiddleware(request);
  }

  // 🚀 FAST PATH: Quick cookie check before Supabase call
  // Supabase SSR uses cookies like: sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes("sb-") && cookie.name.includes("auth-token")
    );

  // If no auth cookie exists, redirect immediately (no Supabase call needed)
  if (!hasAuthCookie) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🚀 OPTIMIZED: Use getSession() instead of getUser()
  // getSession() reads from cookies (fast, ~1-2ms) vs getUser() makes API call (slow, ~300-1400ms)
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User has valid session, continue with intl middleware
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

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
