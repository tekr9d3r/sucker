import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Game } from "@/game/Game";

// useLayoutEffect fires synchronously before the browser paints on the client.
// Falls back to useEffect on the server (where layout effects never run anyway).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  // Render Game on both server and client (no hydration mismatch).
  // A same-colour cover div sits on top and is removed before the first
  // browser paint via useLayoutEffect — the user goes straight to the
  // start screen with no visible flash or blank frame.
  const [cover, setCover] = useState(true);
  useIsomorphicLayoutEffect(() => setCover(false), []);

  return (
    <>
      <Game />
      {cover && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9999, background: "#1a1410" }}
        />
      )}
    </>
  );
}
