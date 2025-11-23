import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { todayFranceDateString } from "@/lib/date-fr";

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("u");
  const playDate = todayFranceDateString(); // DATE en France

  // resolve user_id: uuid -> user, sinon default
  let userId: number | null = null;

  const client = await pool.connect();
  try {
    if (uuid) {
      const u = await client.query(`SELECT id FROM app_user WHERE uuid = $1`, [
        uuid,
      ]);
      if (u.rows[0]) userId = u.rows[0].id;
    }

    if (!userId) {
      const d = await client.query(
        `SELECT id FROM app_user WHERE display_name = 'default' LIMIT 1`
      );
      userId = d.rows[0]?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Default user missing" },
        { status: 500 }
      );
    }

    await client.query("BEGIN");

    // 1) déjà pické ?
    let res = await client.query(
      `SELECT m.*
       FROM daily_pick dp
       JOIN media m ON m.id = dp.media_id
       WHERE dp.user_id = $1 AND dp.play_date = $2
       FOR UPDATE`,
      [userId, playDate]
    );

    if (res.rows[0]) {
      await client.query("COMMIT");
      return NextResponse.json(res.rows[0]);
    }

    // 2) média daté
    res = await client.query(
      `SELECT m.*
       FROM media m
       JOIN media_date md ON md.media_id = m.id
       WHERE m.user_id = $1 AND md.play_date = $2
       LIMIT 1
       FOR UPDATE`,
      [userId, playDate]
    );

    if (res.rows[0]) {
      const mediaId = res.rows[0].id;
      await client.query(
        `INSERT INTO daily_pick(user_id, play_date, media_id)
         VALUES ($1,$2,$3)`,
        [userId, playDate, mediaId]
      );
      await client.query("COMMIT");
      return NextResponse.json(res.rows[0]);
    }

    // 3) random non utilisé
    res = await client.query(
      `SELECT *
       FROM media
       WHERE user_id = $1 AND is_random = TRUE AND random_used = FALSE
       ORDER BY random()
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (!res.rows[0]) {
      // reset random
      await client.query(
        `UPDATE media
         SET random_used = FALSE
         WHERE user_id = $1 AND is_random = TRUE`,
        [userId]
      );

      res = await client.query(
        `SELECT *
         FROM media
         WHERE user_id = $1 AND is_random = TRUE AND random_used = FALSE
         ORDER BY random()
         LIMIT 1
         FOR UPDATE`,
        [userId]
      );
    }

    const picked = res.rows[0];
    if (!picked) {
      await client.query("COMMIT");
      return NextResponse.json(
        { error: "No media configured for this user" },
        { status: 404 }
      );
    }

    await client.query(`UPDATE media SET random_used = TRUE WHERE id = $1`, [
      picked.id,
    ]);

    await client.query(
      `INSERT INTO daily_pick(user_id, play_date, media_id)
       VALUES ($1,$2,$3)`,
      [userId, playDate, picked.id]
    );

    await client.query("COMMIT");
    return NextResponse.json(picked);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
