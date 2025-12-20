import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { assertAdmin } from "@/lib/auth-admin";
import { randomUUID } from "crypto";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!assertAdmin(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const r = await sql(
    `SELECT id, uuid, display_name
     FROM app_user
     ORDER BY id ASC`
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  if (!assertAdmin(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await req.json();
  const display_name = String(body.display_name || "").trim();
  if (!display_name) {
    return NextResponse.json({ error: "display_name requis" }, { status: 400 });
  }

  const uuid = randomUUID();

  const r = await sql(
    `
    INSERT INTO app_user(uuid, display_name)
    VALUES ($1, $2)
    RETURNING id, uuid, display_name
    `,
    [uuid, display_name]
  );

  return NextResponse.json(r.rows[0]);
}
