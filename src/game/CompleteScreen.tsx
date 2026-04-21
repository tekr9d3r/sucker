import { useEffect, useRef } from "react";
import { useGameStore } from "./useGameStore";
import { playVictory, stopSuction, startSuction, resumeAudio } from "./audio";

const formatTime = (ms: number): string => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

export const CompleteScreen = () => {
  const status = useGameStore((s) => s.status);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const bestMs = useGameStore((s) => s.bestMs);
  const reset = useGameStore((s) => s.reset);
  const start = useGameStore((s) => s.start);
  const playedRef = useRef(false);

  useEffect(() => {
    if (status === "complete" && !playedRef.current) {
      playedRef.current = true;
      stopSuction();
      playVictory();
    }
    if (status !== "complete") playedRef.current = false;
  }, [status]);

  if (status !== "complete") return null;

  const isNewBest = bestMs !== null && elapsedMs <= bestMs;

  const handleReplay = async () => {
    await resumeAudio();
    startSuction();
    reset();
    setTimeout(() => start(), 50);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-cyan-950/90 backdrop-blur">
      <div className="max-w-md rounded-2xl border border-emerald-400/20 bg-black/50 p-8 text-center shadow-2xl">
        <div className="mb-2 text-6xl">✨</div>
        <h1 className="mb-1 text-3xl font-bold text-white">Mission Complete!</h1>
        <p className="mb-6 text-sm text-white/70">Spotless. Not a speck left behind.</p>

        <div className="mb-4 rounded-lg bg-white/5 p-6">
          <div className="text-xs uppercase tracking-widest text-white/60">Final Time</div>
          <div className="font-mono text-5xl font-bold text-white tabular-nums">
            {formatTime(elapsedMs)}
          </div>
          {isNewBest && (
            <div className="mt-2 text-sm font-semibold text-amber-300">🏆 New personal best!</div>
          )}
          {!isNewBest && bestMs !== null && (
            <div className="mt-2 text-xs text-white/50">
              Best: <span className="font-mono">{formatTime(bestMs)}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleReplay}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          Clean Again
        </button>
      </div>
    </div>
  );
};
