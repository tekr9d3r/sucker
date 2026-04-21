import { create } from "zustand";

export type GameStatus = "idle" | "playing" | "complete";

interface GameState {
  status: GameStatus;
  elapsedMs: number;
  progress: number; // 0..1
  bestMs: number | null;
  cleanedCells: number;
  totalCells: number;
  // Mini-map state (updated frequently, not via subscribe in Canvas tree)
  playerX: number;
  playerZ: number;
  playerAngle: number;
  // For mini-map dirt visualization (Uint8Array of cell states, 0=dirty 1=clean)
  cellsVersion: number;
  start: () => void;
  finish: () => void;
  reset: () => void;
  tickTime: (ms: number) => void;
  setProgress: (cleaned: number, total: number) => void;
  setPlayer: (x: number, z: number, angle: number) => void;
  bumpCells: () => void;
}

const BEST_KEY = "roomba.bestMs";

const loadBest = (): number | null => {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(BEST_KEY);
  return v ? Number(v) : null;
};

export const useGameStore = create<GameState>((set, get) => ({
  status: "idle",
  elapsedMs: 0,
  progress: 0,
  bestMs: loadBest(),
  cleanedCells: 0,
  totalCells: 0,
  playerX: 0,
  playerZ: 0,
  playerAngle: 0,
  cellsVersion: 0,
  start: () => set({ status: "playing", elapsedMs: 0, progress: 0, cleanedCells: 0 }),
  finish: () => {
    const { elapsedMs, bestMs } = get();
    let newBest = bestMs;
    if (bestMs === null || elapsedMs < bestMs) {
      newBest = elapsedMs;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(BEST_KEY, String(elapsedMs));
      }
    }
    set({ status: "complete", bestMs: newBest });
  },
  reset: () =>
    set({
      status: "idle",
      elapsedMs: 0,
      progress: 0,
      cleanedCells: 0,
      cellsVersion: 0,
    }),
  tickTime: (ms) => set({ elapsedMs: ms }),
  setProgress: (cleaned, total) =>
    set({ cleanedCells: cleaned, totalCells: total, progress: total > 0 ? cleaned / total : 0 }),
  setPlayer: (x, z, angle) => set({ playerX: x, playerZ: z, playerAngle: angle }),
  bumpCells: () => set((s) => ({ cellsVersion: s.cellsVersion + 1 })),
}));
