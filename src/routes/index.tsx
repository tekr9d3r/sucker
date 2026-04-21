import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Game = lazy(() => import("@/game/Game").then((m) => ({ default: m.Game })));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vacuum Game — 1st-Person Speed Cleaning" },
      {
        name: "description",
        content:
          "You are the vacuum. Race the clock in this 1st-person speed-cleaning game and sweep every speck of dust in the apartment.",
      },
      { property: "og:title", content: "Vacuum Game — 1st-Person Speed Cleaning" },
      {
        property: "og:description",
        content:
          "Immersive 1st-person vacuum racing game. WASD to move, Shift to boost, clean every cell as fast as you can.",
      },
    ],
  }),
});

function Index() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
          Loading…
        </div>
      }
    >
      <Game />
    </Suspense>
  );
}
