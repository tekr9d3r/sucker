import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useGameStore } from "./useGameStore";
import { resumeAudio, startSuction } from "./audio";
import { getTopScore, type TopScore } from "@/server/leaderboard.functions";
import vacuumLogo from "@/assets/vacuum-game-logo.png";

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
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const getTopScoreFn = useServerFn(getTopScore);
  const [top, setTop] = useState<TopScore>(null);
  const [topLoading, setTopLoading] = useState(true);

  // Auto-start when arriving from a portal (?portal=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("portal")) return;
    const username = params.get("username");
    if (username) setPlayerName(username.slice(0, 20));
    const t = setTimeout(async () => {
      await resumeAudio();
      startSuction();
      start();
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "idle") return;
    let cancelled = false;
    setTopLoading(true);
    getTopScoreFn()
      .then((res) => {
        if (!cancelled) setTop(res);
      })
      .catch(() => {
        if (!cancelled) setTop(null);
      })
      .finally(() => {
        if (!cancelled) setTopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, getTopScoreFn]);

  if (status !== "idle") return null;

  const trimmed = playerName.trim();
  const canStart = trimmed.length >= 1 && trimmed.length <= 20;

  const handleStart = async () => {
    if (!canStart) return;
    await resumeAudio();
    startSuction();
    start();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-amber-950/80 backdrop-blur">
      <div className="my-8 w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 text-center shadow-2xl">
        <img
          src={vacuumLogo}
          alt="Vacuum Game logo"
          className="mx-auto mb-3 h-40 w-40 drop-shadow-[0_8px_24px_rgba(56,189,248,0.35)]"
          width={160}
          height={160}
        />
        <h1 className="sr-only">Vacuum Game</h1>
        <p className="mb-6 text-sm text-white/70">
          You ARE the vacuum. Race the clock to leave a shiny clean trail behind you.
        </p>

        {/* World record */}
        <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-200/80">
            🏆 World Record
          </div>
          {topLoading ? (
            <div className="mt-1 text-xs text-white/40">Loading…</div>
          ) : top ? (
            <div className="mt-1 flex items-center justify-center gap-2 text-white">
              <span className="font-mono text-2xl font-bold tabular-nums text-amber-300">
                {formatTime(top.scoreMs)}
              </span>
              <span className="text-sm text-white/70">by {top.name}</span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-white/60">
              No scores yet — be the first!
            </div>
          )}
        </div>

        <div className="mb-4 text-left">
          <label
            htmlFor="player-name"
            className="mb-1 block text-xs uppercase tracking-widest text-white/60"
          >
            Your name
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canStart) handleStart();
            }}
            placeholder="Nickname"
            maxLength={20}
            autoComplete="off"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

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
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-amber-200/90">
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
          disabled={!canStart}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {canStart ? "Start Cleaning" : "Enter your name"}
        </button>

        {/* Socials */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
            Made by tekr
          </div>
          <div className="flex items-center justify-center gap-2">
            <a
              href="https://x.com/tekr0x"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) — @tekr0x"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.79l-5.32-6.96L4.8 22H1.54l8.02-9.16L1 2h6.91l4.81 6.36L18.244 2Zm-2.38 18h1.88L7.27 4H5.27l10.594 16Z" />
              </svg>
              <span>@tekr0x</span>
            </a>
            <a
              href="https://github.com/tekr9d3r"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub — tekr9d3r"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.18c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              <span>tekr9d3r</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
