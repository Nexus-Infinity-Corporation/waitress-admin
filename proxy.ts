import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// For now, just use the intl middleware without auth
// This will help identify if the loop is caused by auth or something else
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
