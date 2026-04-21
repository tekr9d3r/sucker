import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useGameStore } from "./useGameStore";
import { playVictory, stopSuction, startSuction, resumeAudio } from "./audio";
import {
  getLeaderboard,
  submitScore,
  type LeaderboardEntry,
  type LeaderboardResult,
} from "@/server/leaderboard.functions";

const formatTime = (ms: number): string => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

const Row = ({ entry, highlight }: { entry: LeaderboardEntry; highlight: boolean }) => (
  <div
    className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded px-2 py-1 text-sm ${
      highlight ? "bg-amber-400/20 text-amber-100" : "text-white/80"
    }`}
  >
    <span className="font-mono text-xs text-white/50">#{entry.rank}</span>
    <span className="truncate">{entry.name}</span>
    <span className="font-mono tabular-nums">{formatTime(entry.scoreMs)}</span>
  </div>
);

type Phase = "name" | "submitting" | "done";

export const CompleteScreen = () => {
  const status = useGameStore((s) => s.status);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const damageMs = useGameStore((s) => s.damageMs);
  const damage = useGameStore((s) => s.damage);
  const bestMs = useGameStore((s) => s.bestMs);
  const reset = useGameStore((s) => s.reset);
  const start = useGameStore((s) => s.start);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const lastScoreId = useGameStore((s) => s.lastScoreId);
  const setLastScoreId = useGameStore((s) => s.setLastScoreId);
  const playedRef = useRef(false);

  const submitScoreFn = useServerFn(submitScore);
  const getLeaderboardFn = useServerFn(getLeaderboard);

  const [nameInput, setNameInput] = useState(playerName);
  const [phase, setPhase] = useState<Phase>("name");
  const [board, setBoard] = useState<LeaderboardResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finalMs = elapsedMs + damageMs;
  const isNewBest = bestMs !== null && finalMs <= bestMs;

  useEffect(() => {
    if (status === "complete" && !playedRef.current) {
      playedRef.current = true;
      stopSuction();
      playVictory();
    }
    if (status !== "complete") {
      playedRef.current = false;
      setPhase("name");
      setBoard(null);
      setError(null);
    }
  }, [status]);

  // Pre-fill name input with stored name each time a run completes
  useEffect(() => {
    if (status === "complete") {
      setNameInput(playerName);
    }
    // intentionally only on status change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status !== "complete") return null;

  const trimmedName = nameInput.trim();
  const canSubmit = trimmedName.length >= 1 && trimmedName.length <= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPlayerName(trimmedName);
    setPhase("submitting");
    setError(null);
    try {
      const res = await submitScoreFn({ data: { name: trimmedName, scoreMs: Math.round(finalMs) } });
      setLastScoreId(res.id);
      const lb = await getLeaderboardFn({ data: { aroundId: res.id } });
      setBoard(lb);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit score");
      setPhase("name");
    }
  };

  const handleSkip = async () => {
    setPhase("submitting");
    try {
      const lb = await getLeaderboardFn({ data: {} });
      setBoard(lb);
    } catch {
      // show leaderboard as empty
    }
    setPhase("done");
  };

  const handleReplay = async () => {
    await resumeAudio();
    startSuction();
    reset();
    setTimeout(() => start(), 50);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-cyan-950/90 backdrop-blur">
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-emerald-400/20 bg-black/50 p-8 text-center shadow-2xl">
          <div className="mb-2 text-6xl">✨</div>
          <h1 className="mb-1 text-3xl font-bold text-white">Mission Complete!</h1>
          <p className="mb-6 text-sm text-white/70">Spotless. Not a speck left behind.</p>

          {/* Score */}
          <div className="mb-6 rounded-lg bg-white/5 p-6">
            <div className="text-xs uppercase tracking-widest text-white/60">Final Time</div>
            <div className="font-mono text-5xl font-bold text-white tabular-nums">
              {formatTime(finalMs)}
            </div>
            {damageMs > 0 && (
              <div className="mt-2 space-y-0.5 text-xs text-white/60">
                <div>
                  Run time: <span className="font-mono">{formatTime(elapsedMs)}</span>
                </div>
                <div className="text-red-400">
                  Damage penalty:{" "}
                  <span className="font-mono">+{(damageMs / 1000).toFixed(1)}s</span>{" "}
                  ({Math.round(damage)}%)
                </div>
              </div>
            )}
            {isNewBest && (
              <div className="mt-3 text-sm font-semibold text-amber-300">
                🏆 New personal best!
              </div>
            )}
            {!isNewBest && bestMs !== null && (
              <div className="mt-2 text-xs text-white/50">
                Best: <span className="font-mono">{formatTime(bestMs)}</span>
              </div>
            )}
          </div>

          {/* Name input phase */}
          {phase === "name" && (
            <div className="mb-4">
              <label
                htmlFor="complete-name"
                className="mb-1 block text-left text-xs uppercase tracking-widest text-white/60"
              >
                Your name for the leaderboard
              </label>
              <input
                id="complete-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) handleSubmit();
                }}
                placeholder="Nickname"
                maxLength={20}
                autoComplete="off"
                autoFocus
                className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/60 focus:outline-none"
              />
              {error && <div className="mb-2 text-xs text-red-400">{error}</div>}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="mb-2 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {canSubmit ? "Submit Score" : "Enter your name"}
              </button>
              <button
                onClick={handleSkip}
                className="w-full rounded-lg px-4 py-2 text-xs text-white/40 transition-colors hover:text-white/70"
              >
                Skip (don't submit)
              </button>
            </div>
          )}

          {/* Loading phase */}
          {phase === "submitting" && (
            <div className="mb-4 py-4 text-sm text-white/50">Submitting…</div>
          )}

          {/* Leaderboard phase */}
          {phase === "done" && (
            <div className="mb-4 rounded-lg bg-white/5 p-4 text-left">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Global Leaderboard
                </div>
                <div className="text-[10px] text-white/40">Top 10</div>
              </div>
              {board ? (
                <div className="space-y-0.5">
                  {board.top.length === 0 && (
                    <div className="py-3 text-center text-xs text-white/50">
                      Be the first to set a time!
                    </div>
                  )}
                  {board.top.map((e) => (
                    <Row
                      key={`${e.rank}-${e.name}-${e.createdAt}`}
                      entry={e}
                      highlight={
                        lastScoreId !== null &&
                        board.you === null &&
                        e.scoreMs === finalMs &&
                        e.name === trimmedName
                      }
                    />
                  ))}
                  {board.you && (
                    <>
                      <div className="my-1 text-center text-[10px] text-white/30">···</div>
                      <Row entry={board.you} highlight />
                    </>
                  )}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-white/50">
                  Could not load leaderboard.
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleReplay}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
          >
            Clean Again
          </button>
        </div>
      </div>
    </div>
  );
};
