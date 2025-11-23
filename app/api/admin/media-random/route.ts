import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth-admin";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!assertAdmin(req))
    return NextResponse.json({ error: "nope" }, { status: 404 });

  const { media_id, is_random } = await req.json();
  const mediaId = Number(media_id);
  if (!mediaId)
    return NextResponse.json({ error: "media_id required" }, { status: 400 });

  await sql(`UPDATE media SET is_random = $2 WHERE id = $1`, [
    mediaId,
    !!is_random,
  ]);

  return NextResponse.json({ ok: true });
}
