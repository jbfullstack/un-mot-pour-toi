import { NextRequest } from "next/server";

export function assertAdmin(req: NextRequest) {
  const token = (
    req.headers.get("x-admin-token") ||
    req.nextUrl.searchParams.get("t") ||
    ""
  ).trim();

  const envToken = (process.env.ADMIN_TOKEN || "").trim();

  return !!token && token === envToken;
}
