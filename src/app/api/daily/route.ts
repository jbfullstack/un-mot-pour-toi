import { NextRequest, NextResponse } from "next/server";
import { sql, pool } from "@/lib/db";
import { todayFranceDateString } from "@/lib/date-fr";

export const dynamic = 'force-dynamic';

async function resolveUserId(uuid?: string | null) {
  if (!uuid) return null;
  const r = await sql<{ id: number }>(
    `SELECT id FROM app_user WHERE uuid = $1`,
    [uuid]
  );
  return r.rows[0]?.id ?? null;
}

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("u");
  const playDate = todayFranceDateString(); // "YYYY-MM-DD" Europe/Paris

  let userId = await resolveUserId(uuid);

  if (!userId) {
    // user default (déjà créé chez toi)
    const d = await sql<{ id: number }>(
      `SELECT id FROM app_user WHERE display_name = 'default' LIMIT 1`
    );
    userId = d.rows[0]?.id ?? null;

    // fallback si même default n'existe pas
    if (!userId) {
      return NextResponse.json({
        title: "Je ne te connais pas encore 🙂",
        audio_url: null,
        image_url: null,
        video_url: null,
      });
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Déjà pick ?
    let res = await client.query(
      `
      SELECT m.*
      FROM daily_pick dp
      JOIN media m ON m.id = dp.media_id
      WHERE dp.user_id = $1 AND dp.play_date = $2
      FOR UPDATE
      `,
      [userId, playDate]
    );
    if (res.rows[0]) {
      await client.query("COMMIT");
      return NextResponse.json(res.rows[0]);
    }

    // 2) Media daté ?
    res = await client.query(
      `
      SELECT m.*
      FROM media m
      JOIN media_date md ON md.media_id = m.id
      WHERE m.user_id = $1 AND md.play_date = $2
      LIMIT 1
      FOR UPDATE
      `,
      [userId, playDate]
    );
    if (res.rows[0]) {
      const mediaId = res.rows[0].id;
      await client.query(
        `
        INSERT INTO daily_pick(user_id, play_date, media_id)
        VALUES ($1,$2,$3)
        `,
        [userId, playDate, mediaId]
      );
      await client.query("COMMIT");
      return NextResponse.json(res.rows[0]);
    }

    // 3) Random non utilisé
    res = await client.query(
      `
      SELECT *
      FROM media
      WHERE user_id = $1
        AND is_random = TRUE
        AND random_used = FALSE
      ORDER BY random()
      LIMIT 1
      FOR UPDATE
      `,
      [userId]
    );

    // 4) Si plus de random => reset puis re-pick
    if (!res.rows[0]) {
      await client.query(
        `
        UPDATE media
        SET random_used = FALSE
        WHERE user_id = $1 AND is_random = TRUE
        `,
        [userId]
      );

      res = await client.query(
        `
        SELECT *
        FROM media
        WHERE user_id = $1
          AND is_random = TRUE
          AND random_used = FALSE
        ORDER BY random()
        LIMIT 1
        FOR UPDATE
        `,
        [userId]
      );
    }

    const picked = res.rows[0];
    if (!picked) {
      await client.query("COMMIT");
      return NextResponse.json(
        { error: "Aucun média configuré pour ce user." },
        { status: 404 }
      );
    }

    // flag random_used
    await client.query(`UPDATE media SET random_used = TRUE WHERE id = $1`, [
      picked.id,
    ]);

    // insert daily_pick
    await client.query(
      `
      INSERT INTO daily_pick(user_id, play_date, media_id)
      VALUES ($1,$2,$3)
      `,
      [userId, playDate, picked.id]
    );

    await client.query("COMMIT");
    return NextResponse.json(picked);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
