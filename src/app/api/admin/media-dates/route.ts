import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { assertAdmin } from "@/lib/auth-admin";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!assertAdmin(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("user_id"));
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));

  if (!userId || !year || !month) {
    return NextResponse.json(
      { error: "user_id, year et month requis" },
      { status: 400 }
    );
  }

  // Récupérer toutes les dates déjà utilisées pour cet utilisateur ce mois-ci
  // On utilise ::TEXT pour éviter la conversion en timestamp UTC
  const result = await sql<{ play_date: string }>(
    `
    SELECT DISTINCT md.play_date::TEXT as play_date
    FROM media_date md
    INNER JOIN media m ON m.id = md.media_id
    WHERE m.user_id = $1
    ORDER BY play_date
    `,
    [userId]
  );

  // Les dates sont déjà en format TEXT YYYY-MM-DD, on les utilise directement
  const allDates = result.rows.map((r) => r.play_date);

  // Filtrer par année et mois
  const dates = allDates.filter((dateStr) => {
    const [y, m] = dateStr.split("-").map(Number);
    return y === year && m === month;
  });

  return NextResponse.json({ dates });
}

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
