import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface Props {
  position: [number, number, number];
  width: number;
  height: number;
}

/**
 * Animated TV "news" screen — procedural CanvasTexture redrawn each frame.
 * Mimics a news broadcast: anchor silhouette, breaking-news lower-third,
 * scrolling ticker, and rotating background graphics.
 */
export const TVScreen = ({ position, width, height }: Props) => {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 288;
    const x = c.getContext("2d")!;
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return { canvas: c, ctx: x, texture: t };
  }, []);

  const startRef = useRef(performance.now());
  const tickerOffsetRef = useRef(0);
  const headlines = useMemo(
    () => [
      "BREAKING: ROOMBA SETS NEW SPEED-CLEAN WORLD RECORD",
      "WEATHER: SUNNY ALL WEEK — DUST PARTICLES AT ALL-TIME HIGH",
      "MARKETS: VACUUM STOCKS SOAR 23% ON CAT-AVOIDANCE TECH",
      "SPORTS: TABBY CAT NAMED MVP FOR 4TH STRAIGHT QUARTER",
    ],
    [],
  );
  const tickerText = headlines.join("   •   ") + "   •   ";

  useFrame(() => {
    const t = (performance.now() - startRef.current) / 1000;
    const W = canvas.width;
    const H = canvas.height;

    // Background — subtle animated gradient (newsroom feel)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a2548");
    grad.addColorStop(1, "#06122a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stage spotlights — soft moving radial highlights
    const spot = ctx.createRadialGradient(
      W * 0.5 + Math.sin(t * 0.7) * 60,
      H * 0.4,
      20,
      W * 0.5,
      H * 0.4,
      260,
    );
    spot.addColorStop(0, "rgba(255,220,150,0.35)");
    spot.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);

    // Anchor desk silhouette
    ctx.fillStyle = "#1a3a6a";
    ctx.fillRect(0, H * 0.7, W, H * 0.3);
    ctx.fillStyle = "#264b85";
    ctx.fillRect(0, H * 0.7, W, 6);

    // Anchor head + shoulders silhouette (subtle bob)
    const bob = Math.sin(t * 1.8) * 1.5;
    ctx.fillStyle = "#2a2018";
    // shoulders
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.78 + bob, 70, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.62 + bob, 26, 0, Math.PI * 2);
    ctx.fill();
    // skin tone (face)
    ctx.fillStyle = "#d9b48a";
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.63 + bob, 22, 0, Math.PI * 2);
    ctx.fill();
    // tie
    ctx.fillStyle = "#c93030";
    ctx.beginPath();
    ctx.moveTo(W * 0.5 - 5, H * 0.74 + bob);
    ctx.lineTo(W * 0.5 + 5, H * 0.74 + bob);
    ctx.lineTo(W * 0.5 + 3, H * 0.85 + bob);
    ctx.lineTo(W * 0.5 - 3, H * 0.85 + bob);
    ctx.closePath();
    ctx.fill();

    // Behind-anchor world-map graphic (rotates slowly)
    ctx.save();
    ctx.translate(W * 0.18, H * 0.32);
    ctx.rotate(t * 0.15);
    ctx.fillStyle = "rgba(120,180,255,0.22)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 18 + i * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(120,180,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Live indicator (top-left, blinking)
    if (Math.floor(t * 1.5) % 2 === 0) {
      ctx.fillStyle = "#e22020";
      ctx.fillRect(14, 14, 14, 14);
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("LIVE", 36, 28);

    // Channel logo top-right
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("RNN", W - 16, 30);
    ctx.font = "11px sans-serif";
    ctx.fillText("ROOMBA NEWS", W - 16, 46);
    ctx.textAlign = "left";

    // Lower third — breaking news banner
    ctx.fillStyle = "#c93030";
    ctx.fillRect(0, H - 78, W, 26);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("BREAKING NEWS", 12, H - 60);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, H - 52, W, 26);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px sans-serif";
    const subline = "Vacuum cleaner overcomes furniture in record time";
    ctx.fillText(subline, 12, H - 34);

    // Scrolling ticker at bottom
    ctx.fillStyle = "#facc15";
    ctx.fillRect(0, H - 26, W, 26);
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "bold 14px monospace";
    tickerOffsetRef.current -= 1.2;
    const tickerW = ctx.measureText(tickerText).width;
    if (tickerOffsetRef.current < -tickerW) tickerOffsetRef.current = 0;
    ctx.fillText(tickerText, tickerOffsetRef.current, H - 8);
    ctx.fillText(tickerText, tickerOffsetRef.current + tickerW, H - 8);

    // Subtle scanline overlay
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    texture.needsUpdate = true;
  });

  return (
    <mesh position={position} rotation={[0, Math.PI, 0]} frustumCulled={false} renderOrder={2}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={matRef} map={texture} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
};
