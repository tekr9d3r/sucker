import { create } from "zustand";

export type GameStatus = "idle" | "playing" | "complete" | "gameover";

interface GameState {
  status: GameStatus;
  elapsedMs: number;
  progress: number; // 0..1
  bestMs: number | null;
  cleanedCells: number;
  totalCells: number;
  // Damage 0..100
  damage: number;
  damageMs: number; // accumulated time penalty in ms
  // Player identity & last submitted score id (for "your rank" lookup)
  playerName: string;
  lastScoreId: number | null;
  setPlayerName: (name: string) => void;
  setLastScoreId: (id: number | null) => void;
  // Mini-map state
  playerX: number;
  playerZ: number;
  playerAngle: number;
  // Cat state for minimap
  catX: number;
  catZ: number;
  cellsVersion: number;
  start: () => void;
  finish: () => void;
  gameOver: () => void;
  reset: () => void;
  tickTime: (ms: number) => void;
  setProgress: (cleaned: number, total: number) => void;
  setPlayer: (x: number, z: number, angle: number) => void;
  setCat: (x: number, z: number) => void;
  bumpCells: () => void;
  takeDamage: (amount: number) => void;
}

const BEST_KEY = "vacuum.bestMs";
const NAME_KEY = "vacuum.playerName";

const loadBest = (): number | null => {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(BEST_KEY);
  return v ? Number(v) : null;
};

const loadName = (): string => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
};

// 100 damage = 60 sec penalty → 600ms per damage point.
export const DAMAGE_MS_PER_POINT = 600;

export const useGameStore = create<GameState>((set, get) => ({
  status: "idle",
  elapsedMs: 0,
  progress: 0,
  bestMs: loadBest(),
  cleanedCells: 0,
  totalCells: 0,
  damage: 0,
  damageMs: 0,
  playerX: 0,
  playerZ: 0,
  playerAngle: 0,
  catX: 0,
  catZ: 0,
  cellsVersion: 0,
  playerName: loadName(),
  lastScoreId: null,
  setPlayerName: (name) => {
    if (typeof window !== "undefined") window.localStorage.setItem(NAME_KEY, name);
    set({ playerName: name });
  },
  setLastScoreId: (id) => set({ lastScoreId: id }),
  start: () =>
    set({ status: "playing", elapsedMs: 0, progress: 0, cleanedCells: 0, damage: 0, damageMs: 0, lastScoreId: null }),
  finish: () => {
    const { elapsedMs, damageMs, bestMs } = get();
    const finalMs = elapsedMs + damageMs;
    let newBest = bestMs;
    if (bestMs === null || finalMs < bestMs) {
      newBest = finalMs;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(BEST_KEY, String(finalMs));
      }
    }
    set({ status: "complete", bestMs: newBest });
  },
  gameOver: () => set({ status: "gameover" }),
  reset: () =>
    set({
      status: "idle",
      elapsedMs: 0,
      progress: 0,
      cleanedCells: 0,
      cellsVersion: 0,
      damage: 0,
      damageMs: 0,
    }),
  tickTime: (ms) => set({ elapsedMs: ms }),
  // Game ends at 80% real coverage; UI shows scaled 0..1 so 80% reads as 100%.
  setProgress: (cleaned, total) =>
    set({
      cleanedCells: cleaned,
      totalCells: total,
      progress: total > 0 ? Math.min(1, cleaned / total / 0.8) : 0,
    }),
  setPlayer: (x, z, angle) => set({ playerX: x, playerZ: z, playerAngle: angle }),
  setCat: (x, z) => set({ catX: x, catZ: z }),
  bumpCells: () => set((s) => ({ cellsVersion: s.cellsVersion + 1 })),
  takeDamage: (amount) =>
    set((s) => {
      const damage = Math.min(100, s.damage + amount);
      const damageMs = damage * DAMAGE_MS_PER_POINT;
      return { damage, damageMs };
    }),
}));
