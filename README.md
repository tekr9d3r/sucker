# Vacuum Game

A first-person speed-cleaning game built with React Three Fiber. You are the vacuum — race the clock to sweep every speck of dust from the apartment before time runs out, and don't bump into the cat.

**Live:** https://vacuum-game-nine.vercel.app

---

## Gameplay

- Move through a 3D apartment from the vacuum's point of view
- Clean dust cells scattered across the floor
- Reach 80% coverage to win
- Colliding with the cat adds a time penalty (up to +60 seconds at full damage)
- Your final score is `elapsed time + damage penalty`
- Top scores go to a global leaderboard

**Controls**

| Key | Action |
|-----|--------|
| `W / A / S / D` | Move |
| `Shift` | Boost (2× speed) |
| `R` | Restart |

---

## Tech Stack

| Layer | Library |
|-------|---------|
| 3D rendering | React Three Fiber + Three.js |
| Framework | TanStack Start (SSR) + TanStack Router |
| State | Zustand |
| Database | Neon (serverless PostgreSQL) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel (Build Output API) |

---

## Local Development

```bash
npm install
npm run dev
```

The leaderboard requires a Neon database. Create a free project at [neon.tech](https://neon.tech), then:

```bash
# .env.local
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

The schema is created automatically on first run.

---

## Build & Deploy

The build produces a Vercel-compatible output:

```bash
npm run build
```

This runs `vite build` followed by `scripts/build-vercel.mjs`, which:
1. Copies the client bundle to `.vercel/output/static/`
2. Bundles the SSR server (esbuild) into a Node.js serverless function
3. Writes the Vercel Build Output API v3 config

To deploy, push to `main` — Vercel picks up the `.vercel/output/` directory automatically.

**Required environment variable in Vercel:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
