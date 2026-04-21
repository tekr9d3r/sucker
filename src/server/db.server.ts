import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;
let _initPromise: Promise<void> | null = null;

const getUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
};

export const getSql = () => {
  if (!_sql) _sql = neon(getUrl());
  return _sql;
};

const ensureSchema = async (): Promise<void> => {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS roomba_scores (
      id          BIGSERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      score_ms    INTEGER NOT NULL CHECK (score_ms >= 0 AND score_ms <= 86400000),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS roomba_scores_score_idx
      ON roomba_scores (score_ms ASC)
  `;
};

export const ensureSchemaOnce = (): Promise<void> => {
  if (!_initPromise) _initPromise = ensureSchema();
  return _initPromise;
};
