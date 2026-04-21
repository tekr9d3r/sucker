import { useGameStore } from "./useGameStore";
import { resumeAudio, startSuction } from "./audio";

const formatTime = (ms: number): string => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

export const StartScreen = () => {
  const status = useGameStore((s) => s.status);
  const start = useGameStore((s) => s.start);
  const bestMs = useGameStore((s) => s.bestMs);

  if (status !== "idle") return null;

  const handleStart = async () => {
    await resumeAudio();
    startSuction();
    start();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-amber-950/80 backdrop-blur">
      <div className="max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 text-center shadow-2xl">
        <div className="mb-2 text-6xl">🤖</div>
        <h1 className="mb-2 text-3xl font-bold text-white">Roomba Speed Clean</h1>
        <p className="mb-6 text-sm text-white/70">
          You ARE the vacuum. Race the clock to leave a shiny clean trail behind you.
        </p>

        <div className="mb-6 rounded-lg bg-white/5 p-4 text-left text-sm text-white/80">
          <div className="mb-2 font-semibold text-white">Controls</div>
          <div className="grid grid-cols-2 gap-y-1 font-mono text-xs">
            <span className="text-white/60">W / ↑</span>
            <span>Forward</span>
            <span className="text-white/60">S / ↓</span>
            <span>Backward</span>
            <span className="text-white/60">A · D / ← →</span>
            <span>Turn</span>
            <span className="text-white/60">Shift</span>
            <span>Boost</span>
            <span className="text-white/60">R</span>
            <span>Restart</span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-xs text-amber-200/90 space-y-1">
            <div>⚠️ Hitting walls/furniture damages you (+time penalty)</div>
            <div>🐈 Don't hit the cat — instant game over!</div>
          </div>
        </div>

        {bestMs !== null && (
          <div className="mb-4 text-sm text-amber-300">
            Personal best:{" "}
            <span className="font-mono font-bold">{formatTime(bestMs)}</span>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          Start Cleaning
        </button>
      </div>
    </div>
  );
};
