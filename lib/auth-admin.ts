import { NextRequest } from "next/server";

export function assertAdmin(req: NextRequest) {
  const token =
    req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("t");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}
