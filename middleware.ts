import { NextResponse, type NextRequest } from "next/server";
import { authCookieName, isAllowedSessionUser } from "@/app/lib/auth";

const publicPaths = new Set(["/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.has(pathname)) {
    const existingSession = request.cookies.get(authCookieName)?.value;

    if (isAllowedSessionUser(existingSession)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const sessionValue = request.cookies.get(authCookieName)?.value;

  if (isAllowedSessionUser(sessionValue)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
