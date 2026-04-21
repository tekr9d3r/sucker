import { useEffect, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { isPointBlocked, ROOMBA_RADIUS } from "./obstacles";
import { useGameStore } from "./useGameStore";
import catFurUrl from "@/assets/cat-fur.jpg";

interface Props {
  playerRef: React.MutableRefObject<{ x: number; z: number }>;
}

const CAT_RADIUS = 0.35;
const CAT_SPEED = 1.4;
const CAT_HIT_DIST = ROOMBA_RADIUS + CAT_RADIUS;

/**
 * Wandering cat: picks random destination, walks toward it. If the Roomba gets
 * close, the cat gets startled and may dart away. Touching it = game over.
 */
export const Cat = ({ playerRef }: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const legRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];
  const status = useGameStore((s) => s.status);
  const setCat = useGameStore((s) => s.setCat);
  const gameOver = useGameStore((s) => s.gameOver);

  const furTex = useLoader(THREE.TextureLoader, catFurUrl);

  const stateRef = useRef({
    x: 4,
    z: 3,
    angle: 0,
    targetX: 4,
    targetZ: 3,
    pauseUntil: 0,
    walkPhase: 0,
    speed: CAT_SPEED,
  });

  // Pick a new random destination
  const pickTarget = () => {
    for (let tries = 0; tries < 30; tries++) {
      const tx = (Math.random() - 0.5) * 13;
      const tz = (Math.random() - 0.5) * 13;
      if (!isPointBlocked(tx, tz, CAT_RADIUS + 0.3)) {
        stateRef.current.targetX = tx;
        stateRef.current.targetZ = tz;
        return;
      }
    }
  };

  useEffect(() => {
    if (status === "idle" || status === "playing") {
      stateRef.current.x = 5;
      stateRef.current.z = 4;
      stateRef.current.angle = Math.PI;
      pickTarget();
    }
  }, [status]);

  useFrame((_, dt) => {
    if (status !== "playing") return;
    const s = stateRef.current;
    const now = performance.now();

    if (now > s.pauseUntil) {
      let dx = s.targetX - s.x;
      let dz = s.targetZ - s.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Reached target — pause briefly, then pick new target
      if (dist < 0.25) {
        s.pauseUntil = now + 600 + Math.random() * 1800;
        if (Math.random() < 0.5) pickTarget();
      } else {
        // Roomba proximity: spook the cat
        const pdx = playerRef.current.x - s.x;
        const pdz = playerRef.current.z - s.z;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
        let speed = s.speed;
        if (pdist < 2.5) {
          // Run away
          dx = -pdx;
          dz = -pdz;
          speed = CAT_SPEED * 2.2;
          if (Math.random() < 0.02) pickTarget();
        }
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        const ux = dx / len;
        const uz = dz / len;
        const nx = s.x + ux * speed * dt;
        const nz = s.z + uz * speed * dt;

        // Try move; if blocked, try sliding axes, else pick new target
        if (!isPointBlocked(nx, nz, CAT_RADIUS)) {
          s.x = nx;
          s.z = nz;
        } else if (!isPointBlocked(nx, s.z, CAT_RADIUS)) {
          s.x = nx;
        } else if (!isPointBlocked(s.x, nz, CAT_RADIUS)) {
          s.z = nz;
        } else {
          pickTarget();
        }

        // Face direction of movement
        const targetAngle = Math.atan2(ux, uz);
        let da = targetAngle - s.angle;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        s.angle += da * Math.min(1, dt * 6);
        s.walkPhase += dt * speed * 4;
      }
    }

    // Update visuals
    if (groupRef.current) {
      groupRef.current.position.set(s.x, 0, s.z);
      groupRef.current.rotation.y = s.angle;
    }
    // Walking leg animation
    const w = s.walkPhase;
    legRefs.forEach((ref, i) => {
      if (ref.current) {
        const phase = w + (i % 2 === 0 ? 0 : Math.PI);
        ref.current.position.y = 0.18 + Math.max(0, Math.sin(phase)) * 0.08;
      }
    });
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(now * 0.003) * 0.3 + 0.4;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(now * 0.0015) * 0.15;
    }

    setCat(s.x, s.z);

    // Collision with Roomba = game over
    const dx = playerRef.current.x - s.x;
    const dz = playerRef.current.z - s.z;
    if (dx * dx + dz * dz < CAT_HIT_DIST * CAT_HIT_DIST) {
      gameOver();
    }
  });

  if (status === "gameover" || status === "complete") {
    // hide
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.5, 6, 12]} />
        <meshStandardMaterial map={furTex} roughness={0.95} />
      </mesh>
      {/* Head */}
      <group ref={headRef} position={[0, 0.42, 0.42]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial map={furTex} roughness={0.95} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.1, 0.15, -0.05]} rotation={[0.3, 0, -0.2]}>
          <coneGeometry args={[0.06, 0.14, 8]} />
          <meshStandardMaterial color="#d99060" />
        </mesh>
        <mesh position={[0.1, 0.15, -0.05]} rotation={[0.3, 0, 0.2]}>
          <coneGeometry args={[0.06, 0.14, 8]} />
          <meshStandardMaterial color="#d99060" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.03, 0.16]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#1a3a1a" emissive="#3a8a3a" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.07, 0.03, 0.16]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#1a3a1a" emissive="#3a8a3a" emissiveIntensity={0.4} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.05, 0.18]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#3a1a1a" />
        </mesh>
      </group>
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.32, -0.4]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
        <meshStandardMaterial map={furTex} roughness={0.95} />
      </mesh>
      {/* Legs */}
      {[
        [-0.13, 0.32] as const,
        [0.13, 0.32] as const,
        [-0.13, -0.18] as const,
        [0.13, -0.18] as const,
      ].map(([lx, lz], i) => (
        <mesh key={i} ref={legRefs[i]} position={[lx, 0.18, lz]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.32, 8]} />
          <meshStandardMaterial color="#e8a87a" />
        </mesh>
      ))}
    </group>
  );
};
