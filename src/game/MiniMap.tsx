import { useEffect, useRef } from "react";
import { useGameStore } from "./useGameStore";
import { ROOM_HALF, SOLID_OBSTACLES } from "./obstacles";

const SIZE = 140;

export const MiniMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerX = useGameStore((s) => s.playerX);
  const playerZ = useGameStore((s) => s.playerZ);
  const playerAngle = useGameStore((s) => s.playerAngle);
  const cellsVersion = useGameStore((s) => s.cellsVersion);

  const toPx = (worldX: number, worldZ: number) => {
    const u = (worldX + ROOM_HALF) / (ROOM_HALF * 2);
    const v = (worldZ + ROOM_HALF) / (ROOM_HALF * 2);
    return [u * SIZE, v * SIZE] as const;
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);
    // Background
    ctx.fillStyle = "rgba(20,15,10,0.85)";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Floor cleaned overlay (downsampled grid)
    const dirt = (window as unknown as {
      __dirtCells?: { cells: { x: number; z: number; idx: number }[]; cleaned: Uint8Array; grid: number };
    }).__dirtCells;
    if (dirt) {
      const cellPx = SIZE / dirt.grid;
      // dirty cells dark, cleaned bright
      for (let i = 0; i < dirt.cells.length; i++) {
        const c2 = dirt.cells[i];
        const cleaned = dirt.cleaned[i] === 1;
        const [px, pz] = toPx(c2.x, c2.z);
        ctx.fillStyle = cleaned ? "rgba(120,200,140,0.5)" : "rgba(80,55,30,0.5)";
        ctx.fillRect(px - cellPx / 2, pz - cellPx / 2, cellPx + 0.5, cellPx + 0.5);
      }
    }

    // Obstacles
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (const o of SOLID_OBSTACLES) {
      const [x1, z1] = toPx(o.minX, o.minZ);
      const [x2, z2] = toPx(o.maxX, o.maxZ);
      ctx.fillRect(x1, z1, x2 - x1, z2 - z1);
    }

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);

    // Player
    const [px, pz] = toPx(playerX, playerZ);
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(-playerAngle);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [playerX, playerZ, playerAngle, cellsVersion]);

  return (
    <div className="rounded-lg bg-black/40 p-2 backdrop-blur">
      <div className="mb-1 text-center text-[10px] uppercase tracking-widest text-white/60">
        Map
      </div>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="block rounded"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};
