import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminPath) return NextResponse.next();

  const token = req.nextUrl.searchParams.get("t");
  if (token && token === process.env.ADMIN_TOKEN) {
    return NextResponse.next();
  }

  // pas de token -> 404 (discret)
  return new NextResponse("Not found", { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
