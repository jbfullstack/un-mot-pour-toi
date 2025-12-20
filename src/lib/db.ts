import { createPool, VercelPool } from "@vercel/postgres";

let _pool: VercelPool | null = null;

function getPool() {
  if (!_pool) {
    _pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return _pool;
}

export const pool = {
  connect: () => getPool().connect(),
};

export async function sql<T = any>(query: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    const res = await client.query(query, params);
    return res as { rows: T[] };
  } finally {
    client.release();
  }
}
