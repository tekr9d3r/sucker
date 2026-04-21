import { useEffect, useRef } from "react";
import { useGameStore } from "./useGameStore";
import { stopSuction, startSuction, resumeAudio, playThud } from "./audio";

export const GameOverScreen = () => {
  const status = useGameStore((s) => s.status);
  const reset = useGameStore((s) => s.reset);
  const start = useGameStore((s) => s.start);
  const playedRef = useRef(false);

  useEffect(() => {
    if (status === "gameover" && !playedRef.current) {
      playedRef.current = true;
      stopSuction();
      playThud();
      setTimeout(playThud, 120);
    }
    if (status !== "gameover") playedRef.current = false;
  }, [status]);

  if (status !== "gameover") return null;

  const handleReplay = async () => {
    await resumeAudio();
    startSuction();
    reset();
    setTimeout(() => start(), 50);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-red-950/95 via-slate-950/95 to-red-900/90 backdrop-blur">
      <div className="max-w-md rounded-2xl border border-red-500/30 bg-black/60 p-8 text-center shadow-2xl">
        <div className="mb-2 text-6xl">😾</div>
        <h1 className="mb-1 text-3xl font-bold text-white">You hit the cat!</h1>
        <p className="mb-6 text-sm text-white/70">
          The household has revoked your cleaning privileges. Indefinitely.
        </p>

        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-200">
          A good Roomba never harms its furry overlords. Try again, but watch the mini-map.
        </div>

        <button
          onClick={handleReplay}
          className="w-full rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
