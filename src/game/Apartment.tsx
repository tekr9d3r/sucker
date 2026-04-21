import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { ROOM_HALF, ROOM_HEIGHT, WALL_THICKNESS } from "./obstacles";
import floorUrl from "@/assets/floor-wood.jpg";
import wallUrl from "@/assets/wall-plaster.jpg";
import windowViewUrl from "@/assets/window-view.jpg";
import rugUrl from "@/assets/rug.jpg";

const sofaColor = "#6b7a8f";
const sofaCushionColor = "#8694a8";
const tableColor = "#5d3a1f";
const tableTopColor = "#7a4a26";
const tvColor = "#1a1a1a";
const plantPotColor = "#a0522d";
const plantLeafColor = "#3a7a3a";
const chairColor = "#8b5a3c";
const bookColors = ["#8b2e2e", "#2e4a8b", "#3e6b3e", "#7a5a2e", "#5a3e7a", "#2e5a5a"];

const useTiledTexture = (url: string, repeatX: number, repeatY: number) => {
  const tex = useLoader(THREE.TextureLoader, url);
  return useMemo(() => {
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    t.needsUpdate = true;
    return t;
  }, [tex, repeatX, repeatY]);
};

export const Apartment = () => {
  const floorTex = useTiledTexture(floorUrl, 6, 6);
  const wallTex = useTiledTexture(wallUrl, 3, 1);
  const rugTex = useLoader(THREE.TextureLoader, rugUrl);
  const windowTex = useLoader(THREE.TextureLoader, windowViewUrl);

  return (
    <group>
      {/* Floor with wood texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Persian rug under coffee table area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.005, -6.6]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial map={rugTex} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#fff8ec" roughness={0.95} />
      </mesh>

      {/* Crown molding (top trim) */}
      {[
        { pos: [0, ROOM_HEIGHT - 0.05, -ROOM_HALF + 0.05] as [number, number, number], size: [ROOM_HALF * 2, 0.1, 0.05] as [number, number, number] },
        { pos: [0, ROOM_HEIGHT - 0.05, ROOM_HALF - 0.05] as [number, number, number], size: [ROOM_HALF * 2, 0.1, 0.05] as [number, number, number] },
        { pos: [-ROOM_HALF + 0.05, ROOM_HEIGHT - 0.05, 0] as [number, number, number], size: [0.05, 0.1, ROOM_HALF * 2] as [number, number, number] },
        { pos: [ROOM_HALF - 0.05, ROOM_HEIGHT - 0.05, 0] as [number, number, number], size: [0.05, 0.1, ROOM_HALF * 2] as [number, number, number] },
      ].map((m, i) => (
        <mesh key={`crown-${i}`} position={m.pos}>
          <boxGeometry args={m.size} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Baseboards */}
      {[
        { pos: [0, 0.075, -ROOM_HALF + 0.04] as [number, number, number], size: [ROOM_HALF * 2, 0.15, 0.04] as [number, number, number] },
        { pos: [0, 0.075, ROOM_HALF - 0.04] as [number, number, number], size: [ROOM_HALF * 2, 0.15, 0.04] as [number, number, number] },
        { pos: [-ROOM_HALF + 0.04, 0.075, 0] as [number, number, number], size: [0.04, 0.15, ROOM_HALF * 2] as [number, number, number] },
        { pos: [ROOM_HALF - 0.04, 0.075, 0] as [number, number, number], size: [0.04, 0.15, ROOM_HALF * 2] as [number, number, number] },
      ].map((m, i) => (
        <mesh key={`base-${i}`} position={m.pos}>
          <boxGeometry args={m.size} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Walls with plaster texture */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_HALF - WALL_THICKNESS / 2]}>
        <boxGeometry args={[ROOM_HALF * 2 + WALL_THICKNESS * 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_HALF + WALL_THICKNESS / 2]}>
        <boxGeometry args={[ROOM_HALF * 2 + WALL_THICKNESS * 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      <mesh position={[-ROOM_HALF - WALL_THICKNESS / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_HALF * 2]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      <mesh position={[ROOM_HALF + WALL_THICKNESS / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_HALF * 2]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>

      {/* WINDOW on right wall — view of sunny day */}
      <group position={[ROOM_HALF - 0.02, 1.55, 4]} rotation={[0, -Math.PI / 2, 0]}>
        {/* The view (slightly behind window plane to feel deep) */}
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[5, 2.4]} />
          <meshBasicMaterial map={windowTex} toneMapped={false} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[5.4, 0.15, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, -1.25, 0]}>
          <boxGeometry args={[5.4, 0.15, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-2.55, 0, 0]}>
          <boxGeometry args={[0.15, 2.6, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.55, 0, 0]}>
          <boxGeometry args={[0.15, 2.6, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Vertical mullion */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.06, 2.4, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Horizontal mullion */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[5, 0.06, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Window sill */}
        <mesh position={[0, -1.32, 0.18]}>
          <boxGeometry args={[5.6, 0.08, 0.3]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
        {/* Glow plane in front to fake sunshine spilling in */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[5, 2.4]} />
          <meshBasicMaterial color="#fff4d0" transparent opacity={0.06} />
        </mesh>
      </group>

      {/* Wall art — picture above sofa */}
      <group position={[-6.5, 1.7, -ROOM_HALF + 0.05]}>
        <mesh>
          <boxGeometry args={[1.6, 1.1, 0.05]} />
          <meshStandardMaterial color="#3a2a18" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.4, 0.9]} />
          <meshStandardMaterial color="#c9a26a" />
        </mesh>
      </group>
      <group position={[-4.5, 1.7, -ROOM_HALF + 0.05]}>
        <mesh>
          <boxGeometry args={[1, 1.4, 0.05]} />
          <meshStandardMaterial color="#3a2a18" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.85, 1.2]} />
          <meshStandardMaterial color="#3e6b8b" />
        </mesh>
      </group>

      {/* Sofa — bigger, more detailed */}
      <group position={[-6.5, 0, -11.6]}>
        {/* Base cushion */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[7, 0.7, 1.8]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        {/* Back */}
        <mesh position={[0, 1.0, -0.7]} castShadow>
          <boxGeometry args={[7, 1.3, 0.4]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-3.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.8]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        <mesh position={[3.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.8]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        {/* Seat cushions */}
        {[-2.2, 0, 2.2].map((cx, i) => (
          <mesh key={i} position={[cx, 0.85, 0.1]} castShadow>
            <boxGeometry args={[2, 0.3, 1.4]} />
            <meshStandardMaterial color={sofaCushionColor} roughness={0.95} />
          </mesh>
        ))}
        {/* Throw pillows */}
        <mesh position={[-2.5, 1.0, 0.2]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.3]} />
          <meshStandardMaterial color="#c9794a" roughness={0.95} />
        </mesh>
        <mesh position={[2.6, 1.0, 0.2]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.3]} />
          <meshStandardMaterial color="#3e6b3e" roughness={0.95} />
        </mesh>
        {/* Sofa feet */}
        {[
          [-3.3, -0.85],
          [3.3, -0.85],
          [-3.3, 0.85],
          [3.3, 0.85],
        ].map(([fx, fz], i) => (
          <mesh key={`foot-${i}`} position={[fx, 0.05, fz]} castShadow>
            <boxGeometry args={[0.15, 0.1, 0.15]} />
            <meshStandardMaterial color="#2a1f15" />
          </mesh>
        ))}
      </group>

      {/* Side table next to sofa with lamp */}
      <group position={[-1.6, 0, -11.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {/* Table lamp */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.3, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.28, 0.4, 16]} />
          <meshStandardMaterial color="#fff5d6" emissive="#ffd88a" emissiveIntensity={0.4} />
        </mesh>
        <pointLight position={[0, 1.3, 0]} intensity={0.3} color="#ffd88a" distance={4} />
      </group>

      {/* Coffee table — top floats so Roomba drives under */}
      <group position={[-6, 0, -6.6]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[4.8, 0.1, 3.6]} />
          <meshStandardMaterial color={tableTopColor} roughness={0.4} />
        </mesh>
        {/* Legs */}
        {[
          [-2.2, -1.6],
          [2.2, -1.6],
          [-2.2, 1.6],
          [2.2, 1.6],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.25, lz]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
        {/* Books on table */}
        <mesh position={[-1, 0.6, -0.5]} castShadow>
          <boxGeometry args={[1, 0.08, 0.7]} />
          <meshStandardMaterial color="#8b2e2e" />
        </mesh>
        <mesh position={[-1, 0.7, -0.5]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.65]} />
          <meshStandardMaterial color="#2e4a8b" />
        </mesh>
        {/* Coffee mug */}
        <mesh position={[1.2, 0.65, 0.3]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.18, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Dining table */}
      <group position={[7.75, 0, 0.75]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[4.4, 0.1, 6]} />
          <meshStandardMaterial color={tableTopColor} roughness={0.4} />
        </mesh>
        {[
          [-2, -2.85],
          [2, -2.85],
          [-2, 2.85],
          [2, 2.85],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.425, lz]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.85, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
        {/* Centerpiece bowl */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Fruit in bowl */}
        <mesh position={[-0.1, 1.05, 0.05]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#c93030" />
        </mesh>
        <mesh position={[0.12, 1.05, -0.05]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#e6a428" />
        </mesh>
        <mesh position={[0.05, 1.05, 0.13]} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#7a9a3a" />
        </mesh>
      </group>

      {/* Chairs with backrests */}
      {[
        { z: -3.6, faceZ: 1 },
        { z: 5.1, faceZ: -1 },
      ].map((c, i) => (
        <group key={`chair-${i}`} position={[7.75, 0, c.z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.5, 0.1, 1.2]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
          {[
            [-0.65, -0.5],
            [0.65, -0.5],
            [-0.65, 0.5],
            [0.65, 0.5],
          ].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, 0.225, lz]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.45, 8]} />
              <meshStandardMaterial color={chairColor} />
            </mesh>
          ))}
          <mesh position={[0, 1.0, c.faceZ * 0.55]} castShadow>
            <boxGeometry args={[1.5, 1.0, 0.1]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
        </group>
      ))}

      {/* TV stand & TV */}
      <group position={[0, 0, 12]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[8, 0.8, 1]} />
          <meshStandardMaterial color={tvColor} roughness={0.5} />
        </mesh>
        {/* Drawers detail */}
        {[-2.5, 0, 2.5].map((dx, i) => (
          <mesh key={i} position={[dx, 0.4, 0.51]}>
            <boxGeometry args={[1.8, 0.6, 0.02]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}
        {/* TV */}
        <mesh position={[0, 1.9, 0.3]} castShadow>
          <boxGeometry args={[4.5, 2.4, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* TV screen — emissive */}
        <mesh position={[0, 1.9, 0.37]}>
          <planeGeometry args={[4.2, 2.2]} />
          <meshBasicMaterial color="#1a4a7c" toneMapped={false} />
        </mesh>
        {/* TV stand */}
        <mesh position={[0, 0.95, 0.2]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Decorative items on stand */}
        <mesh position={[3, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        <mesh position={[-3, 0.95, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.3]} />
          <meshStandardMaterial color="#5a3e7a" />
        </mesh>
      </group>

      {/* Bookshelf on left wall */}
      <group position={[-12.05, 0, 1]}>
        {/* Frame */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.4, 2.4, 6]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {/* Shelves (lighter strips) */}
        {[0.4, 0.95, 1.5, 2.05].map((sy, i) => (
          <mesh key={i} position={[0.05, sy, 0]}>
            <boxGeometry args={[0.35, 0.04, 5.9]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
        ))}
        {/* Books — generated rows */}
        {[0.65, 1.2, 1.75, 2.3].map((shelfY, si) =>
          Array.from({ length: 14 }).map((_, bi) => {
            const z = -2.7 + bi * 0.4;
            const h = 0.35 + ((si * 7 + bi) % 4) * 0.04;
            const w = 0.25 + ((si * 3 + bi) % 5) * 0.03;
            const c = bookColors[(si * 5 + bi) % bookColors.length];
            return (
              <mesh key={`b-${si}-${bi}`} position={[0.1, shelfY, z]}>
                <boxGeometry args={[w, h, 0.3]} />
                <meshStandardMaterial color={c} roughness={0.8} />
              </mesh>
            );
          }),
        )}
      </group>

      {/* Potted plant — bigger, more detailed */}
      <group position={[12, 0, -11.8]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.45, 1.0, 16]} />
          <meshStandardMaterial color={plantPotColor} roughness={0.7} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
          <meshStandardMaterial color="#3a2515" />
        </mesh>
        {/* Foliage clusters */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={plantLeafColor} />
        </mesh>
        <mesh position={[0.4, 2.0, 0.1]} castShadow>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#4d8a4d" />
        </mesh>
        <mesh position={[-0.35, 1.95, -0.15]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#356b35" />
        </mesh>
        <mesh position={[0.05, 2.4, 0.2]} castShadow>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#5aa05a" />
        </mesh>
      </group>

      {/* Floor lamp */}
      <group position={[11.7, 0, 10.8]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.9, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow>
          <coneGeometry args={[0.4, 0.5, 16, 1, true]} />
          <meshStandardMaterial color="#fff5d6" emissive="#ffd88a" emissiveIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 2.0, 0]} intensity={0.5} color="#ffd88a" distance={6} />
      </group>

      {/* Sunbeam from window — directional warm light */}
      <directionalLight
        position={[ROOM_HALF + 2, 3, 4]}
        intensity={0.8}
        color="#fff0c8"
        target-position={[-3, 0, 0]}
      />
    </group>
  );
};
