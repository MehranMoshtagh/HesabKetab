import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // On first visit (no locale in path), detect country from Vercel header
  const pathname = request.nextUrl.pathname;
  const hasLocale = /^\/(en|fa)(\/|$)/.test(pathname);

  if (!hasLocale && pathname === "/") {
    const country = request.headers.get("x-vercel-ip-country") ?? "";
    if (country === "IR") {
      const url = request.nextUrl.clone();
      url.pathname = "/fa";
      return Response.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|fa)/:path*"],
};
