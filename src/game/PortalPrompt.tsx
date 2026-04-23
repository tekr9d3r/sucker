import { useEffect } from "react";
import { useGameStore } from "./useGameStore";

export const PortalPrompt = () => {
  const prompt = useGameStore((s) => s.portalPrompt);
  const setPortalPrompt = useGameStore((s) => s.setPortalPrompt);

  useEffect(() => {
    if (!prompt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyF") {
        window.location.href = prompt.url;
      } else if (e.code === "Escape") {
        setPortalPrompt(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt, setPortalPrompt]);

  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* dim backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative flex flex-col items-center gap-5 rounded-2xl border px-10 py-8 text-center shadow-2xl"
        style={{
          background: "rgba(0,20,15,0.92)",
          borderColor: "rgba(0,255,136,0.35)",
          boxShadow: "0 0 48px rgba(0,255,136,0.18)",
          minWidth: 300,
          maxWidth: 420,
        }}
      >
        {/* glow ring decoration */}
        <div
          className="text-3xl font-bold tracking-widest"
          style={{ color: "#00ff88", textShadow: "0 0 20px #00ff88" }}
        >
          PORTAL
        </div>

        <p className="text-white/80 text-sm leading-relaxed">
          You're standing at the<br />
          <span className="font-semibold text-white">{prompt.label}</span>
        </p>

        <p className="text-white/50 text-xs">
          Travel to another game in the Vibe Jam webring?
        </p>

        <div className="flex gap-3 w-full">
          <button
            className="flex-1 rounded-lg py-2.5 text-sm font-bold tracking-widest uppercase transition-all"
            style={{
              background: "rgba(0,255,136,0.15)",
              border: "1.5px solid rgba(0,255,136,0.5)",
              color: "#00ff88",
            }}
            onClick={() => { window.location.href = prompt.url; }}
          >
            Travel <span className="opacity-60 text-xs ml-1">[F]</span>
          </button>
          <button
            className="flex-1 rounded-lg py-2.5 text-sm font-bold tracking-widest uppercase transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.7)",
            }}
            onClick={() => setPortalPrompt(null)}
          >
            Stay <span className="opacity-60 text-xs ml-1">[ESC]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
