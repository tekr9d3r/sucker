import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useKeyboard } from "./useKeyboard";
import { resolveCollision } from "./obstacles";
import { useGameStore } from "./useGameStore";
import { playThud, setSuctionIntensity } from "./audio";

interface Props {
  playerRef: React.MutableRefObject<{ x: number; z: number; yaw?: number }>;
  onShake: (intensity: number) => void;
}

const BASE_SPEED = 3.0;
const BOOST_SPEED = 6.0;
const ROT_SPEED = 2.4;
const CAM_HEIGHT = 0.2;

export const Vacuum = ({ playerRef, onShake }: Props) => {
  const { camera } = useThree();
  const reset = useGameStore((s) => s.reset);
  const status = useGameStore((s) => s.status);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const tickTime = useGameStore((s) => s.tickTime);
  const finish = useGameStore((s) => s.finish);
  const takeDamage = useGameStore((s) => s.takeDamage);

  const keys = useKeyboard(() => {
    if (status === "playing" || status === "complete" || status === "gameover") reset();
  });

  const angleRef = useRef(0);
  const velRef = useRef(0);
  const bobRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const tiltRef = useRef(0);
  const lastThudRef = useRef(0);

  useEffect(() => {
    if (status === "idle") {
      playerRef.current.x = 0;
      playerRef.current.z = 3;
      angleRef.current = Math.PI;
      velRef.current = 0;
      startTimeRef.current = null;
    }
    if (status === "playing") {
      startTimeRef.current = performance.now();
    }
  }, [status, playerRef]);

  useFrame((_, dt) => {
    const k = keys.current;
    const playing = status === "playing";

    if (playing) {
      if (k.left) angleRef.current += ROT_SPEED * dt;
      if (k.right) angleRef.current -= ROT_SPEED * dt;
      const targetTilt = (k.left ? 0.05 : 0) + (k.right ? -0.05 : 0);
      tiltRef.current += (targetTilt - tiltRef.current) * Math.min(1, dt * 8);
    } else {
      tiltRef.current += (0 - tiltRef.current) * Math.min(1, dt * 8);
    }

    let inputAccel = 0;
    if (playing) {
      if (k.forward) inputAccel += 1;
      if (k.backward) inputAccel -= 1;
    }
    const maxSpeed = k.boost && playing ? BOOST_SPEED : BASE_SPEED;
    const targetVel = inputAccel * maxSpeed;
    velRef.current += (targetVel - velRef.current) * Math.min(1, dt * 6);

    const dx = -Math.sin(angleRef.current) * velRef.current * dt;
    const dz = -Math.cos(angleRef.current) * velRef.current * dt;
    const oldX = playerRef.current.x;
    const oldZ = playerRef.current.z;
    const newX = oldX + dx;
    const newZ = oldZ + dz;
    const { x, z, hit } = resolveCollision(oldX, oldZ, newX, newZ);
    playerRef.current.x = x;
    playerRef.current.z = z;

    if (hit && Math.abs(velRef.current) > 1.0 && playing) {
      const now = performance.now();
      if (now - lastThudRef.current > 250) {
        lastThudRef.current = now;
        playThud();
        // Damage scales with impact velocity (and a bit more if boosting)
        const impactSpeed = Math.abs(velRef.current);
        const dmg = Math.min(15, 3 + impactSpeed * 1.5);
        takeDamage(dmg);
        onShake(0.08 + impactSpeed * 0.01);
      }
      velRef.current *= 0.3;
    }

    const speedFrac = Math.min(1, Math.abs(velRef.current) / BASE_SPEED);
    bobRef.current += dt * 14 * speedFrac;
    const bob = Math.sin(bobRef.current) * 0.015 * speedFrac;

    camera.position.set(x, CAM_HEIGHT + bob, z);
    const yaw = angleRef.current;
    camera.rotation.order = "YXZ";
    camera.rotation.set(0, yaw, tiltRef.current);
    camera.up.set(0, 1, 0);

    playerRef.current.yaw = yaw;
    setPlayer(x, z, yaw);

    const rate = (window as unknown as { __cleaningRate?: number }).__cleaningRate ?? 0;
    setSuctionIntensity(playing ? Math.min(1, 0.2 + rate * 0.15) : 0);

    if (playing && startTimeRef.current !== null) {
      tickTime(performance.now() - startTimeRef.current);
    }

    const progress = useGameStore.getState().progress;
    if (playing && progress >= 0.8) {
      finish();
    }
  });

  return null;
};
