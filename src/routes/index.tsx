import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Sucker — 1st-Person Vacuum Racing Game" },
      { name: "description", content: "You ARE the vacuum. Zoom through a 3D apartment, suck up every speck of dust, and post the fastest time. Free to play in your browser — no install needed." },
      { property: "og:title", content: "Sucker — 1st-Person Vacuum Racing Game" },
      { property: "og:description", content: "You ARE the vacuum. Zoom through a 3D apartment, suck up every speck of dust, and post the fastest time. Free to play in your browser — no install needed." },
      { property: "og:image", content: "https://vacuum-game-nine.vercel.app/sucker-website-preview.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:title", content: "Sucker — 1st-Person Vacuum Racing Game" },
      { name: "twitter:description", content: "You ARE the vacuum. Zoom through a 3D apartment, suck up every speck of dust, and post the fastest time. Free to play in your browser — no install needed." },
      { name: "twitter:image", content: "https://vacuum-game-nine.vercel.app/sucker-website-preview.png" },
    ],
    scripts: [
      { src: "https://vibejam.cc/2026/widget.js", async: true },
    ],
  }),
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white/60 text-sm tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  return <Game />;
}
