import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth-admin";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!assertAdmin(req))
    return NextResponse.json({ error: "nope" }, { status: 404 });

  const { media_id, dates } = await req.json();
  const mediaId = Number(media_id);
  if (!mediaId || !Array.isArray(dates)) {
    return NextResponse.json(
      { error: "media_id + dates[] required" },
      { status: 400 }
    );
  }

  for (const d of dates) {
    await sql(
      `INSERT INTO media_date(media_id, play_date)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [mediaId, d]
    );
  }

  return NextResponse.json({ ok: true });
}
