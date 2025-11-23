import { createPool } from "@vercel/postgres";

export const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function sql<T = any>(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res as { rows: T[] };
  } finally {
    client.release();
  }
}
