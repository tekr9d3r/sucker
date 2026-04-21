import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, ensureSchemaOnce } from "./db.server";

const NAME_RE = /^[\p{L}\p{N} _\-.!?']+$/u;

const submitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name required")
    .max(20, "Max 20 characters")
    .regex(NAME_RE, "Invalid characters"),
  scoreMs: z.number().int().min(0).max(86_400_000),
});

export type LeaderboardEntry = {
  rank: number;
  name: string;
  scoreMs: number;
  createdAt: string;
};

export type LeaderboardResult = {
  top: LeaderboardEntry[];
  you: LeaderboardEntry | null;
};

const TOP_N = 10;

export const submitScore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSchemaOnce();
    const sql = getSql();
    const rows = (await sql`
      INSERT INTO roomba_scores (name, score_ms)
      VALUES (${data.name}, ${data.scoreMs})
      RETURNING id
    `) as Array<{ id: number | string }>;
    const id = Number(rows[0].id);
    return { id };
  });

export const getLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const schema = z.object({ aroundId: z.number().int().positive().nullable().optional() });
    return schema.parse(input ?? {});
  })
  .handler(async ({ data }): Promise<LeaderboardResult> => {
    await ensureSchemaOnce();
    const sql = getSql();

    const topRows = (await sql`
      SELECT id, name, score_ms, created_at
      FROM roomba_scores
      ORDER BY score_ms ASC, created_at ASC
      LIMIT ${TOP_N}
    `) as Array<{ id: number | string; name: string; score_ms: number; created_at: string }>;

    const top: LeaderboardEntry[] = topRows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      scoreMs: Number(r.score_ms),
      createdAt: r.created_at,
    }));

    let you: LeaderboardEntry | null = null;
    if (data.aroundId) {
      const inTop = topRows.find((r) => Number(r.id) === data.aroundId);
      if (!inTop) {
        const meRows = (await sql`
          SELECT id, name, score_ms, created_at
          FROM roomba_scores
          WHERE id = ${data.aroundId}
          LIMIT 1
        `) as Array<{ id: number | string; name: string; score_ms: number; created_at: string }>;
        const me = meRows[0];
        if (me) {
          const rankRows = (await sql`
            SELECT COUNT(*)::int AS better
            FROM roomba_scores
            WHERE score_ms < ${me.score_ms}
               OR (score_ms = ${me.score_ms} AND created_at < ${me.created_at})
          `) as Array<{ better: number }>;
          you = {
            rank: Number(rankRows[0].better) + 1,
            name: me.name,
            scoreMs: Number(me.score_ms),
            createdAt: me.created_at,
          };
        }
      }
    }

    return { top, you };
  });
