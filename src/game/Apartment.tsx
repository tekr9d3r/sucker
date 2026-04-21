import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import {
  ROOM_HALF,
  ROOM_HEIGHT,
  WALL_THICKNESS,
  DOOR_X_MIN,
  DOOR_X_MAX,
} from "./obstacles";
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
  const floorTex = useTiledTexture(floorUrl, 4, 4);
  const wallTex = useTiledTexture(wallUrl, 2, 1);
  const rugTex = useLoader(THREE.TextureLoader, rugUrl);
  const windowTex = useLoader(THREE.TextureLoader, windowViewUrl);

  const doorWidth = DOOR_X_MAX - DOOR_X_MIN;
  const doorCenterX = (DOOR_X_MAX + DOOR_X_MIN) / 2;
  const doorHeight = 2.1;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Persian rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.005, -3.7]}>
        <planeGeometry args={[5.2, 4]} />
        <meshStandardMaterial map={rugTex} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#fff8ec" roughness={0.95} />
      </mesh>

      {/* Crown molding */}
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
        { pos: [-(ROOM_HALF + DOOR_X_MIN) / 2 - 0.1, 0.075, -ROOM_HALF + 0.04] as [number, number, number], size: [ROOM_HALF + DOOR_X_MIN, 0.15, 0.04] as [number, number, number] },
        { pos: [(ROOM_HALF + DOOR_X_MAX) / 2, 0.075, -ROOM_HALF + 0.04] as [number, number, number], size: [ROOM_HALF - DOOR_X_MAX, 0.15, 0.04] as [number, number, number] },
        { pos: [0, 0.075, ROOM_HALF - 0.04] as [number, number, number], size: [ROOM_HALF * 2, 0.15, 0.04] as [number, number, number] },
        { pos: [-ROOM_HALF + 0.04, 0.075, 0] as [number, number, number], size: [0.04, 0.15, ROOM_HALF * 2] as [number, number, number] },
        { pos: [ROOM_HALF - 0.04, 0.075, 0] as [number, number, number], size: [0.04, 0.15, ROOM_HALF * 2] as [number, number, number] },
      ].map((m, i) => (
        <mesh key={`base-${i}`} position={m.pos}>
          <boxGeometry args={m.size} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* North wall — left and right segments around the door opening */}
      <mesh
        position={[
          (-ROOM_HALF - WALL_THICKNESS + DOOR_X_MIN) / 2,
          ROOM_HEIGHT / 2,
          -ROOM_HALF - WALL_THICKNESS / 2,
        ]}
      >
        <boxGeometry args={[ROOM_HALF + WALL_THICKNESS + DOOR_X_MIN, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      <mesh
        position={[
          (DOOR_X_MAX + ROOM_HALF + WALL_THICKNESS) / 2,
          ROOM_HEIGHT / 2,
          -ROOM_HALF - WALL_THICKNESS / 2,
        ]}
      >
        <boxGeometry args={[ROOM_HALF + WALL_THICKNESS - DOOR_X_MAX, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      {/* Wall segment ABOVE the door */}
      <mesh
        position={[doorCenterX, doorHeight + (ROOM_HEIGHT - doorHeight) / 2, -ROOM_HALF - WALL_THICKNESS / 2]}
      >
        <boxGeometry args={[doorWidth, ROOM_HEIGHT - doorHeight, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>

      {/* South wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_HALF + WALL_THICKNESS / 2]}>
        <boxGeometry args={[ROOM_HALF * 2 + WALL_THICKNESS * 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      {/* West wall */}
      <mesh position={[-ROOM_HALF - WALL_THICKNESS / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_HALF * 2]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      {/* East wall */}
      <mesh position={[ROOM_HALF + WALL_THICKNESS / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_HALF * 2]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>

      {/* DOOR — wooden, in the opening */}
      <group position={[doorCenterX, 0, -ROOM_HALF + 0.05]}>
        {/* Door slab — slightly ajar */}
        <mesh position={[-doorWidth / 2 + 0.05, doorHeight / 2, -0.05]} rotation={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[doorWidth - 0.05, doorHeight, 0.05]} />
          <meshStandardMaterial color="#5a3a22" roughness={0.7} />
        </mesh>
        {/* Door frame trim */}
        <mesh position={[-doorWidth / 2, doorHeight / 2, 0]}>
          <boxGeometry args={[0.08, doorHeight, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[doorWidth / 2, doorHeight / 2, 0]}>
          <boxGeometry args={[0.08, doorHeight, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, doorHeight, 0]}>
          <boxGeometry args={[doorWidth + 0.16, 0.08, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Door handle */}
        <mesh position={[doorWidth / 2 - 0.25, 1.05, -0.1]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#d4a640" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Hallway light spilling in */}
        <pointLight position={[-0.2, 1.5, -0.6]} intensity={0.3} color="#fff5d6" distance={4} />
      </group>

      {/* WINDOW 1 — east wall (large) */}
      <Window position={[ROOM_HALF - 0.02, 1.45, 3]} rotation={[0, -Math.PI / 2, 0]} width={3.5} height={1.8} tex={windowTex} />
      {/* WINDOW 2 — south wall (smaller) */}
      <Window position={[5, 1.45, ROOM_HALF + 0.02]} rotation={[0, Math.PI, 0]} width={2.5} height={1.6} tex={windowTex} />

      {/* Wall art — picture above sofa */}
      <group position={[-4, 1.6, -ROOM_HALF + 0.05]}>
        <mesh>
          <boxGeometry args={[1.4, 1.0, 0.05]} />
          <meshStandardMaterial color="#3a2a18" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.2, 0.85]} />
          <meshStandardMaterial color="#c9a26a" />
        </mesh>
      </group>

      {/* Sofa */}
      <group position={[-4.5, 0, -6.85]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[5, 0.7, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.0, -0.5]} castShadow>
          <boxGeometry args={[5, 1.3, 0.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        <mesh position={[-2.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        <mesh position={[2.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.9} />
        </mesh>
        {[-1.5, 0, 1.5].map((cx, i) => (
          <mesh key={i} position={[cx, 0.85, 0.05]} castShadow>
            <boxGeometry args={[1.4, 0.3, 1]} />
            <meshStandardMaterial color={sofaCushionColor} roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[-1.7, 1.0, 0.15]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.55, 0.4, 0.25]} />
          <meshStandardMaterial color="#c9794a" />
        </mesh>
        <mesh position={[1.8, 1.0, 0.15]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.55, 0.4, 0.25]} />
          <meshStandardMaterial color="#3e6b3e" />
        </mesh>
      </group>

      {/* Side table next to sofa with lamp */}
      <group position={[-0.85, 0, -6.95]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.13, 0.25, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.24, 0.35, 16]} />
          <meshStandardMaterial color="#fff5d6" emissive="#ffd88a" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 1.15, 0]} intensity={0.4} color="#ffd88a" distance={4} />
      </group>

      {/* Coffee table */}
      <group position={[-4, 0, -3.7]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.8, 0.1, 2.4]} />
          <meshStandardMaterial color={tableTopColor} roughness={0.4} />
        </mesh>
        {[
          [-1.3, -1.1] as const,
          [1.3, -1.1] as const,
          [-1.3, 1.1] as const,
          [1.3, 1.1] as const,
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.25, lz]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
        <mesh position={[-0.6, 0.6, -0.3]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.55]} />
          <meshStandardMaterial color="#8b2e2e" />
        </mesh>
        <mesh position={[0.7, 0.62, 0.2]} castShadow>
          <cylinderGeometry args={[0.09, 0.075, 0.14, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Dining table */}
      <group position={[5, 0, 0.25]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[2.8, 0.1, 4]} />
          <meshStandardMaterial color={tableTopColor} roughness={0.4} />
        </mesh>
        {[
          [-1.15, -1.65] as const,
          [1.15, -1.65] as const,
          [-1.15, 1.65] as const,
          [1.15, 1.65] as const,
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.425, lz]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.85, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.22, 0.12, 16]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        <mesh position={[-0.08, 1.04, 0.04]} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#c93030" />
        </mesh>
        <mesh position={[0.1, 1.04, -0.04]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#e6a428" />
        </mesh>
      </group>

      {/* Chairs */}
      {[
        { z: -2.25, faceZ: 1 },
        { z: 2.45, faceZ: -1 },
      ].map((c, i) => (
        <group key={`chair-${i}`} position={[5, 0, c.z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.9]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
          {[
            [-0.5, -0.4] as const,
            [0.5, -0.4] as const,
            [-0.5, 0.4] as const,
            [0.5, 0.4] as const,
          ].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, 0.225, lz]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color={chairColor} />
            </mesh>
          ))}
          <mesh position={[0, 0.95, c.faceZ * 0.4]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.08]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
        </group>
      ))}

      {/* TV stand & TV */}
      <group position={[0, 0, 7.15]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[6, 0.8, 0.7]} />
          <meshStandardMaterial color={tvColor} roughness={0.5} />
        </mesh>
        {[-2, 0, 2].map((dx, i) => (
          <mesh key={i} position={[dx, 0.4, 0.36]}>
            <boxGeometry args={[1.5, 0.6, 0.02]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}
        <mesh position={[0, 1.7, 0.2]} castShadow>
          <boxGeometry args={[3.6, 2, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, 1.7, 0.26]}>
          <planeGeometry args={[3.4, 1.85]} />
          <meshBasicMaterial color="#1a4a7c" toneMapped={false} />
        </mesh>
        <mesh position={[2.4, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.18, 0.35, 16]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
      </group>

      {/* Bookshelf on left wall */}
      <group position={[-7.2, 0, 2]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.4, 2.2, 4]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {[0.4, 0.95, 1.5, 2.0].map((sy, i) => (
          <mesh key={i} position={[0.05, sy, 0]}>
            <boxGeometry args={[0.35, 0.04, 3.9]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
        ))}
        {[0.65, 1.2, 1.75].map((shelfY, si) =>
          Array.from({ length: 10 }).map((_, bi) => {
            const z = -1.8 + bi * 0.4;
            const h = 0.35 + ((si * 7 + bi) % 4) * 0.04;
            const w = 0.22 + ((si * 3 + bi) % 5) * 0.03;
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

      {/* Potted plant */}
      <group position={[7, 0, -7]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.35, 0.8, 16]} />
          <meshStandardMaterial color={plantPotColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
          <meshStandardMaterial color="#3a2515" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color={plantLeafColor} />
        </mesh>
        <mesh position={[0.3, 1.6, 0.1]} castShadow>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#4d8a4d" />
        </mesh>
        <mesh position={[-0.25, 1.55, -0.1]} castShadow>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#356b35" />
        </mesh>
      </group>

      {/* Bright sunbeams from windows */}
      <directionalLight
        position={[ROOM_HALF + 3, 4, 3]}
        intensity={0.9}
        color="#fff0c8"
        target-position={[-3, 0, 0]}
      />
      <directionalLight
        position={[5, 4, ROOM_HALF + 3]}
        intensity={0.5}
        color="#fff0c8"
        target-position={[0, 0, 0]}
      />
      {/* Sunlight pool on floor near east window — subtle warm patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.012, 3]}>
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial color="#ffe8b0" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.012, 6.5]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial color="#ffe8b0" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

interface WindowProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  tex: THREE.Texture;
}
const Window = ({ position, rotation, width, height, tex }: WindowProps) => {
  const halfW = width / 2;
  const halfH = height / 2;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.18]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, halfH + 0.07, 0]}>
        <boxGeometry args={[width + 0.3, 0.14, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -halfH - 0.07, 0]}>
        <boxGeometry args={[width + 0.3, 0.14, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-halfW - 0.07, 0, 0]}>
        <boxGeometry args={[0.14, height + 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[halfW + 0.07, 0, 0]}>
        <boxGeometry args={[0.14, height + 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Mullions */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.05, height, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Sill */}
      <mesh position={[0, -halfH - 0.13, 0.18]}>
        <boxGeometry args={[width + 0.4, 0.07, 0.3]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Sun glow */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#fff4d0" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};
