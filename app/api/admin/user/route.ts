import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth-admin";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!assertAdmin(req))
    return NextResponse.json({ error: "nope" }, { status: 404 });

  const body = await req.json();
  const name = (body.display_name || "").trim();
  if (!name)
    return NextResponse.json(
      { error: "display_name required" },
      { status: 400 }
    );

  // existe déjà ?
  const existing = await sql<{ uuid: string; id: number }>(
    `SELECT id, uuid FROM app_user WHERE display_name = $1 LIMIT 1`,
    [name]
  );
  if (existing.rows[0]) return NextResponse.json(existing.rows[0]);

  const created = await sql<{ id: number; uuid: string }>(
    `INSERT INTO app_user(uuid, display_name)
     VALUES (gen_random_uuid(), $1)
     RETURNING id, uuid`,
    [name]
  );

  return NextResponse.json(created.rows[0]);
}
