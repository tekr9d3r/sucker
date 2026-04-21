import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Apartment } from "./Apartment";
import { Roomba } from "./Roomba";
import { DirtField } from "./DirtField";
import { Cat } from "./Cat";
import { HUD } from "./HUD";
import { StartScreen } from "./StartScreen";
import { CompleteScreen } from "./CompleteScreen";
import { GameOverScreen } from "./GameOverScreen";
import { useGameStore } from "./useGameStore";
import { stopSuction } from "./audio";

export const Game = () => {
  const playerRef = useRef({ x: 0, z: 5, yaw: Math.PI });
  const status = useGameStore((s) => s.status);
  const [shake, setShake] = useState(0);
  const [vignette, setVignette] = useState(0);

  useEffect(() => () => stopSuction(), []);

  const handleShake = (intensity: number) => {
    setShake(intensity);
    setVignette(1);
    setTimeout(() => setShake(0), 150);
    setTimeout(() => setVignette(0), 300);
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black"
      style={{
        transform:
          shake > 0
            ? `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`
            : undefined,
        transition: shake > 0 ? "none" : "transform 0.1s",
      }}
    >
      <Canvas
        shadows
        camera={{ fov: 95, near: 0.05, far: 100, position: [0, 0.2, 5] }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#1a1410"]} />
        <fog attach="fog" args={["#2a201a", 10, 28]} />
        <ambientLight intensity={0.6} color="#fff1d6" />
        <directionalLight
          position={[5, 8, -3]}
          intensity={0.7}
          color="#fff0c8"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Apartment />
        <DirtField playerRef={playerRef} active={status === "playing"} />
        <Cat playerRef={playerRef} />
        <Roomba playerRef={playerRef} onShake={handleShake} />
      </Canvas>

      <div
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: vignette * 0.55,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(220,38,38,0.7) 100%)",
        }}
      />

      <HUD />
      <StartScreen />
      <CompleteScreen />
      <GameOverScreen />
    </div>
  );
};
