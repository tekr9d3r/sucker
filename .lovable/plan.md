

## Add Neon-backed Leaderboard

A global top-10 leaderboard for Roomba Speed Clean, backed by your own Neon Postgres database (free tier, fully portable — you own the connection string and can move/export it any time).

### What you'll get

- **Start screen**: a "Your name" input. Saved to `localStorage` so it auto-fills on every run.
- **Complete screen**: after a win, your final time (run time + damage penalty) is auto-submitted to the leaderboard, then a Top 10 panel appears showing rank, name, and time.
- **If you didn't make Top 10**: an extra row below the table shows your rank (e.g. `47.  YourName  01:42.30`) so you always see where you stand.
- **Game Over (cat hit)**: no submission — only completed runs are scored.
- **Best time** still tracked locally per browser, shown alongside the global board.

### Why Neon (vs Lovable Cloud)

- Standard Postgres — `pg_dump`, point any other host (Supabase, Railway, Fly, RDS) at the dump and it just works.
- Free tier: 0.5 GB, no card required.
- The connection string lives in a server-side environment variable. Moving away from Lovable later = copy that string into your new host's env vars. Nothing else changes.

### Setup you'll do once (3 minutes)

1. Sign up at [neon.tech](https://neon.tech) (free, GitHub login).
2. Create a project → copy the **pooled connection string** (looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).
3. Paste it when I ask for the `DATABASE_URL` secret.

I'll run the table-creation SQL for you against your Neon DB the first time the server function boots (idempotent `CREATE TABLE IF NOT EXISTS`), so no manual SQL needed.

### Schema (single table, exportable anywhere)

```sql
CREATE TABLE IF NOT EXISTS leaderboard (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT      NOT NULL,
  time_ms     INTEGER   NOT NULL,   -- final time incl. damage penalty
  damage_pct  SMALLINT  NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leaderboard_time_idx ON leaderboard (time_ms ASC);
```

### Technical approach

- **Add dep**: `@neondatabase/serverless` (HTTP driver — works in Cloudflare Workers SSR runtime, no Node TCP needed).
- **Secret**: `DATABASE_URL` (runtime secret, server-only, never bundled to client).
- **Two server functions** in `src/utils/leaderboard.functions.ts`:
  - `submitScore({ name, timeMs, damagePct })` — Zod-validated (name 1–24 chars, time 1000–600000ms), inserts row, returns `{ rank, top: Entry[], you: Entry }`.
  - `getLeaderboard()` — returns top 10 for the Start screen preview.
- **Validation**: name trimmed, max 24 chars, regex `^[\p{L}\p{N} _.\-]+$`; time bounds enforced server-side.
- **Rate limiting**: simple in-memory token bucket (1 submit / 3s per IP) inside the server fn — fine for a casual game; documented as not bulletproof.
- **State store** (`useGameStore.ts`): add `playerName: string`, `setPlayerName`, plus `submissionState: 'idle' | 'submitting' | 'done' | 'error'` and `leaderboard: { top: Entry[]; yourRank: number | null }`.
- **UI changes**:
  - `StartScreen.tsx` — name input (required to start), small "Top 10" preview list fetched on mount via TanStack Query.
  - `CompleteScreen.tsx` — auto-submit on mount when `status === 'complete'`; render Top 10 + your row; "Clean Again" button unchanged.
- **Files touched / created**:
  - new: `src/utils/leaderboard.functions.ts`, `src/utils/leaderboard.server.ts` (Neon client + ensureSchema), `src/game/Leaderboard.tsx` (shared display component)
  - edited: `src/game/useGameStore.ts`, `src/game/StartScreen.tsx`, `src/game/CompleteScreen.tsx`, `package.json`
- **Router**: QueryClientProvider isn't set up yet — I'll add it in `__root.tsx` and `router.tsx` per the framework requirement, since we'll use `useQuery` for the leaderboard fetch.

### Portability guarantee

When you leave Lovable: `pg_dump $DATABASE_URL > leaderboard.sql`, point new host at the dump, update `DATABASE_URL` env var on the new host. Done. No Lovable-specific tables, no proprietary SDK, no vendor lock.

### Out of scope (v1)

- No profanity filter (can add a small wordlist later if spam appears).
- No per-day/weekly boards — single all-time list. Easy to add later with a `WHERE created_at > now() - interval '7 days'`.
- No edit/delete UI — moderation via direct SQL on Neon if needed.

