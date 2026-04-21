
# 1st-Person Roomba Speed-Cleaner Sim

A 3D first-person vacuum simulator where you race to clean every inch of an apartment as fast as possible. Built with React Three Fiber on a TanStack Start route.

## Gameplay
- **Perspective**: First-person camera at ~0.2 units high with a wide 95° FOV for that fisheye, "I am the vacuum" feel.
- **Controls**: 
  - `W` / `↑` — forward, `S` / `↓` — backward
  - `A` / `←` and `D` / `→` — rotate left/right
  - `Shift` — turbo boost (short bursts)
  - `R` — restart
- **Movement feel**: Subtle vertical bobbing while moving, slight camera tilt on rotation, smooth acceleration so it feels like a real Roomba — not a spaceship.
- **Collisions**: AABB collision against walls and obstacles. Hitting something triggers a quick screen shake + soft "thud" sound and a red vignette flash.

## The Apartment
- A single open-plan room (~20×20 units) with 4 walls, ceiling, and a wooden-plank floor.
- Obstacles to navigate around:
  - Sofa (large box)
  - Coffee table with 4 cylindrical legs (you can drive *under* it — the fun part)
  - Dining table with 4 legs + 2 chairs
  - A potted plant (cylinder + sphere)
  - A TV stand
- Soft warm lighting + one window light to give the floor visual variety.

## Cleaning Mechanic
- Floor is divided into a **60×60 invisible grid** (3,600 cells, performant).
- Every cell starts "dirty" — rendered as dust/lint specks via an instanced mesh overlay so it's cheap.
- As the Roomba passes over a cell (within its ~0.4 unit radius), the dust instances in that cell are removed and the floor underneath is revealed clean & slightly shiny.
- A subtle vacuum suction sound loops while cleaning new cells (pitch-shifts when on already-clean ground).

## HUD (Tailwind, fixed overlay)
- **Top-left**: Live timer `00:00.00` (centiseconds, monospace).
- **Top-center**: Cleaning progress bar with % cleaned.
- **Top-right**: Mini-map — top-down view of the room showing cleaned vs dirty cells and the player's position + facing arrow. Essential for finding missed spots under furniture.
- **Bottom-center**: Subtle control hints (fades after 5 seconds).
- **Center crosshair**: tiny dot for orientation.

## Game States
1. **Start screen**: Title, brief instructions, "Start Cleaning" button. Click to lock pointer and begin.
2. **Playing**: Timer runs, progress climbs.
3. **Mission Complete** (at 100%): Stops timer, shows final time prominently, displays a "Personal Best" if beaten (stored in localStorage), and a "Clean Again" button to restart with a fresh dirty floor.

## Visual Style
- Cozy apartment vibe: warm cream walls, oak floor, soft ambient + directional lighting.
- Slight motion blur / speed lines effect when boosting via Shift.
- Clean-cell shine effect: a brief sparkle particle when a new cell is cleaned for satisfying feedback.

## Technical Approach
- New route: `src/routes/index.tsx` becomes the game (replaces placeholder).
- New components: `Game.tsx` (Canvas + state), `Roomba.tsx` (player controller + camera), `Apartment.tsx` (room + obstacles), `DirtField.tsx` (instanced dust overlay + cleaning logic), `HUD.tsx`, `MiniMap.tsx`, `StartScreen.tsx`, `CompleteScreen.tsx`.
- Custom hook: `useKeyboard.ts` for input, `useGameStore.ts` (Zustand) for game state (time, progress, status, best time).
- Dependencies to add: `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`.
- Sounds generated via Web Audio API (no asset files needed) — thud, suction loop, victory chime.
- Game loop runs in `useFrame`; HUD reads from Zustand for non-React-tree updates without re-rendering the Canvas.

## Out of Scope (for v1)
No enemies, pets, or hazards yet — pure speed-cleaning focus. We can add a wandering dog, water spills, or "boss rooms" (kitchen, bathroom) in a follow-up once the core feel is dialed in.
