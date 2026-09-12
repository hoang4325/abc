import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("access_token")?.value ||
    request.cookies.get("refresh_token")?.value;

  const isAuthRoute = pathname.startsWith("/auth");

  if (!token && !isAuthRoute) {
    const loginUrl = new URL("/auth/auth2/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/auth/auth2/login" || pathname === "/auth/auth2/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicons.ico|images|svgs).*)",
  ],
};
