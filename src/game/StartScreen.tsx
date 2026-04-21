import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useGameStore } from "./useGameStore";
import { resumeAudio, startSuction } from "./audio";
import { getLeaderboard, type LeaderboardEntry } from "@/server/leaderboard.functions";
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
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const getLeaderboardFn = useServerFn(getLeaderboard);
  const [topList, setTopList] = useState<LeaderboardEntry[]>([]);
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
    getLeaderboardFn({ data: {} })
      .then((res) => {
        if (!cancelled) setTopList(res.top);
      })
      .catch(() => {
        if (!cancelled) setTopList([]);
      })
      .finally(() => {
        if (!cancelled) setTopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, getLeaderboardFn]);

  if (status !== "idle") return null;

  const handleStart = async () => {
    await resumeAudio();
    startSuction();
    start();
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-amber-950/80 backdrop-blur">
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 text-center shadow-2xl">
          <img
            src={vacuumLogo}
            alt="Vacuum Game logo"
            className="mx-auto mb-4 h-40 w-40 drop-shadow-[0_8px_24px_rgba(56,189,248,0.35)]"
            width={160}
            height={160}
          />
          <h1 className="sr-only">Vacuum Game</h1>
          <p className="mb-6 text-sm text-white/70">
            You ARE the vacuum. Race the clock to leave a shiny clean trail behind you.
          </p>

          {bestMs !== null && (
            <div className="mb-3 text-sm text-amber-300">
              Personal best:{" "}
              <span className="font-mono font-bold">{formatTime(bestMs)}</span>
            </div>
          )}

          <button
            onClick={handleStart}
            className="mb-6 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
          >
            Start Cleaning
          </button>

          {/* Top 10 Leaderboard */}
          <div className="mb-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-left">
            <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-amber-200/80">
              🏆 Top 10 Leaderboard
            </div>
            {topLoading ? (
              <div className="text-center text-xs text-white/40">Loading…</div>
            ) : topList.length === 0 ? (
              <div className="text-center text-xs text-white/60">No scores yet — be the first!</div>
            ) : (
              <div className="space-y-1">
                {topList.map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-5 text-right font-bold tabular-nums ${
                        entry.rank === 1 ? "text-amber-300" : "text-white/40"
                      }`}
                    >
                      {entry.rank}.
                    </span>
                    <span className="font-mono tabular-nums text-white/90">
                      {formatTime(entry.scoreMs)}
                    </span>
                    <span className="truncate text-white/60">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Socials */}
          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
              Made by tekrox
            </div>
            <div className="flex items-center justify-center gap-2">
              <a
                href="https://x.com/tekr0x"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) — @tekr0x"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
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
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.18c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
                <span>tekr9d3r</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
