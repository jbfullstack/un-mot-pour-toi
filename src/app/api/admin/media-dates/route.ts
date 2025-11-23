import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { assertAdmin } from "@/lib/auth-admin";

export async function POST(req: NextRequest) {
  if (!assertAdmin(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await req.json();
  const mediaId = Number(body.media_id);
  const dates: string[] = body.dates || [];

  if (!mediaId || !Array.isArray(dates) || dates.length === 0) {
    return NextResponse.json(
      { error: "media_id et dates requis" },
      { status: 400 }
    );
  }

  for (const d of dates) {
    await sql(
      `
      INSERT INTO media_date(media_id, play_date)
      VALUES ($1,$2)
      ON CONFLICT DO NOTHING
      `,
      [mediaId, d]
    );
  }

  return NextResponse.json({ ok: true });
}
