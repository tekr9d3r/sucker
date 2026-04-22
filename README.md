# Sucker

![Sucker screenshot](public/screen-shot.jpeg)

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

| Input | Action |
|-------|--------|
| `W / ↑` | Move forward |
| `S / ↓` | Move backward |
| `A / ←` | Rotate left |
| `D / →` | Rotate right |
| `Shift` | Boost (2× speed) |
| `R` | Restart |
| Touch joystick (mobile) | Move & rotate |

---

## Tech Stack

### 3D & Rendering

| Library | Version | Purpose |
|---------|---------|---------|
| [Three.js](https://threejs.org) | ^0.184 | WebGL 3D engine |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | ^9.6 | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | ^10.7 | R3F helpers (loaders, controls, etc.) |

The apartment scene, cat, and furniture are rendered with instanced meshes and shadow maps. Dirt cells use an instanced mesh of 4 900 sprites updated per-frame. All collision detection is custom AABB (no physics engine).

### Audio

All audio runs through the **Web Audio API** — no external audio library:

- **Vacuum sound** — MP3 loaded via `fetch` + `decodeAudioData`, looped with gain scaled to movement speed using `setTargetAtTime` for glitch-free per-frame updates
- **Background melody** — MP3 loaded and looped as the main track
- **Collision thud** — procedural sine sweep (120 Hz → 40 Hz)
- **Victory fanfare** — procedural triangle wave chord sequence

### Framework & Routing

| Library | Version | Purpose |
|---------|---------|---------|
| [TanStack Start](https://tanstack.com/start) | ^1.167 | SSR framework (Vinxi-based) |
| [TanStack Router](https://tanstack.com/router) | ^1.168 | File-based routing with type safety |
| [Vite](https://vitejs.dev) | ^7.3 | Dev server & bundler |
| [React](https://react.dev) | ^19.2 | UI runtime |

### State Management

[Zustand](https://zustand-demo.pmnd.rs) — single flat store manages all game state: `status`, `elapsedMs`, `progress`, `damage`, `damageMs`, `cleanedCells`, player position/angle, cat position. Game logic (tick, damage, finish) lives in store actions.

### Database & Backend

| Library | Purpose |
|---------|---------|
| [Neon](https://neon.tech) (`@neondatabase/serverless`) | Serverless PostgreSQL — leaderboard persistence |
| TanStack Start server functions | Type-safe RPC (no separate API layer) |

The schema is a single `scores` table, created automatically on first run.

### Styling

| Library | Version | Purpose |
|---------|---------|---------|
| [Tailwind CSS v4](https://tailwindcss.com) | ^4.2 | Utility-first CSS |
| [@tailwindcss/vite](https://tailwindcss.com/docs/installation/using-vite) | ^4.2 | Vite plugin for Tailwind v4 |

### Deployment

Deployed on **Vercel** using the [Build Output API v3](https://vercel.com/docs/build-output-api/v3). A custom `scripts/build-vercel.mjs` post-build script:

1. Copies the Vite client bundle to `.vercel/output/static/`
2. Bundles the SSR server entry with `esbuild` into a Node.js serverless function
3. Writes the Vercel config (`config.json`, `routes`, function metadata)

Push to `main` → Vercel deploys automatically.

### Code Quality

| Tool | Purpose |
|------|---------|
| TypeScript ^5.8 | Full type safety across game logic, store, server functions |
| ESLint + Prettier | Linting and formatting |
| `eslint-plugin-react-hooks` | Enforces hooks rules |

---

## Local Development

```bash
npm install
npm run dev
```

The leaderboard requires a Neon database. Create a free project at [neon.tech](https://neon.tech), then add to `.env.local`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

The schema is created automatically on first run.

---

## Build & Deploy

```bash
npm run build
```

This runs `vite build` followed by `scripts/build-vercel.mjs`. To deploy, push to `main` — Vercel picks up `.vercel/output/` automatically.

**Required environment variable in Vercel:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
