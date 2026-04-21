import { useEffect, useState } from "react";
import { useGameStore, DAMAGE_MS_PER_POINT } from "./useGameStore";
import { MiniMap } from "./MiniMap";

const formatTime = (ms: number): string => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

export const HUD = () => {
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const progress = useGameStore((s) => s.progress);
  const damage = useGameStore((s) => s.damage);
  const damageMs = useGameStore((s) => s.damageMs);
  const status = useGameStore((s) => s.status);
  const [hintsVisible, setHintsVisible] = useState(true);

  useEffect(() => {
    if (status !== "playing") {
      setHintsVisible(true);
      return;
    }
    const t = setTimeout(() => setHintsVisible(false), 5000);
    return () => clearTimeout(t);
  }, [status]);

  if (status !== "playing") return null;

  const pct = Math.round(progress * 100);
  const damagePct = Math.round(damage);
  const damageColor =
    damage < 30 ? "from-emerald-400 to-yellow-300" : damage < 70 ? "from-yellow-400 to-orange-400" : "from-orange-500 to-red-500";

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Timer */}
      <div className="absolute left-4 top-4 rounded-lg bg-black/40 px-4 py-2 backdrop-blur">
        <div className="text-xs uppercase tracking-widest text-white/60">Time</div>
        <div className="font-mono text-2xl font-bold text-white tabular-nums">
          {formatTime(elapsedMs)}
        </div>
        {damageMs > 0 && (
          <div className="font-mono text-xs text-red-400">
            +{(damageMs / 1000).toFixed(1)}s penalty
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="absolute left-1/2 top-4 w-72 -translate-x-1/2 rounded-lg bg-black/40 px-4 py-2 backdrop-blur">
        <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-white/60">
          <span>Cleaned</span>
          <span className="font-mono text-white">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Damage meter */}
        <div className="mt-2 mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-white/60">
          <span>Damage</span>
          <span className="font-mono text-white">{damagePct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full bg-gradient-to-r ${damageColor} transition-all duration-150`}
            style={{ width: `${damagePct}%` }}
          />
        </div>
      </div>

      {/* Mini-map */}
      <div className="absolute right-4 top-4">
        <MiniMap />
      </div>

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow" />

      {/* Hints */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/40 px-4 py-2 text-xs text-white/80 backdrop-blur transition-opacity duration-700 ${
          hintsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-mono">WASD</span> move ·{" "}
        <span className="font-mono">Shift</span> boost ·{" "}
        <span className="font-mono">R</span> restart · ⚠️ avoid the cat!
      </div>
    </div>
  );
};

export { DAMAGE_MS_PER_POINT };
