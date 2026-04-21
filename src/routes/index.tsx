import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Game = lazy(() => import("@/game/Game").then((m) => ({ default: m.Game })));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Roomba Speed Clean — 1st-Person Vacuum Sim" },
      {
        name: "description",
        content:
          "You are the vacuum. Race the clock in this 1st-person Roomba simulator and clean every speck of dust in the apartment.",
      },
      { property: "og:title", content: "Roomba Speed Clean — 1st-Person Vacuum Sim" },
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
