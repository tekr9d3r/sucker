import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import {
  RAW_ROOM_HALF as ROOM_HALF,
  ROOM_HEIGHT,
  RAW_WALL_THICKNESS as WALL_THICKNESS,
  RAW_DOOR_X_MIN as DOOR_X_MIN,
  RAW_DOOR_X_MAX as DOOR_X_MAX,
  WORLD_SCALE,
} from "./obstacles";
import floorUrl from "@/assets/floor-wood.jpg";
import wallUrl from "@/assets/wall-plaster.jpg";
import windowViewUrl from "@/assets/window-view.jpg";
import rugUrl from "@/assets/rug.jpg";
import tvNewsUrl from "@/assets/tv-news.jpg";

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
  const tvNewsTex = useLoader(THREE.TextureLoader, tvNewsUrl);

  const doorWidth = DOOR_X_MAX - DOOR_X_MIN;
  const doorCenterX = (DOOR_X_MAX + DOOR_X_MIN) / 2;
  const doorHeight = 2.1;

  return (
    <group scale={[WORLD_SCALE, 1, WORLD_SCALE]}>
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

      {/* South wall — split into 4 segments around a much wider window */}
      {(() => {
        const W = 4.5, H = 2.0, cx = 4.5, cy = 1.5;
        const xL = cx - W / 2, xR = cx + W / 2;
        const yB = cy - H / 2, yT = cy + H / 2;
        const z = ROOM_HALF + WALL_THICKNESS / 2;
        const leftW = xL - (-ROOM_HALF - WALL_THICKNESS);
        const rightW = (ROOM_HALF + WALL_THICKNESS) - xR;
        return (
          <>
            <mesh position={[(-ROOM_HALF - WALL_THICKNESS + xL) / 2, ROOM_HEIGHT / 2, z]}>
              <boxGeometry args={[leftW, ROOM_HEIGHT, WALL_THICKNESS]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[(xR + ROOM_HALF + WALL_THICKNESS) / 2, ROOM_HEIGHT / 2, z]}>
              <boxGeometry args={[rightW, ROOM_HEIGHT, WALL_THICKNESS]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[cx, yB / 2, z]}>
              <boxGeometry args={[W, yB, WALL_THICKNESS]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[cx, (yT + ROOM_HEIGHT) / 2, z]}>
              <boxGeometry args={[W, ROOM_HEIGHT - yT, WALL_THICKNESS]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
          </>
        );
      })()}
      {/* West wall */}
      <mesh position={[-ROOM_HALF - WALL_THICKNESS / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_HALF * 2]} />
        <meshStandardMaterial map={wallTex} />
      </mesh>
      {/* East wall — split into 4 segments around a much wider window */}
      {(() => {
        const W = 5.5, H = 2.1, cz = 2, cy = 1.55;
        const zN = cz - W / 2, zS = cz + W / 2;
        const yB = cy - H / 2, yT = cy + H / 2;
        const x = ROOM_HALF + WALL_THICKNESS / 2;
        const northW = zN - (-ROOM_HALF);
        const southW = ROOM_HALF - zS;
        return (
          <>
            <mesh position={[x, ROOM_HEIGHT / 2, (-ROOM_HALF + zN) / 2]}>
              <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, northW]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[x, ROOM_HEIGHT / 2, (zS + ROOM_HALF) / 2]}>
              <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, southW]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[x, yB / 2, cz]}>
              <boxGeometry args={[WALL_THICKNESS, yB, W]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
            <mesh position={[x, (yT + ROOM_HEIGHT) / 2, cz]}>
              <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT - yT, W]} />
              <meshStandardMaterial map={wallTex} />
            </mesh>
          </>
        );
      })()}

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

      {/* WINDOW 1 — east wall (extra wide) */}
      <Window position={[ROOM_HALF - 0.02, 1.55, 2]} rotation={[0, -Math.PI / 2, 0]} width={5.5} height={2.1} tex={windowTex} />
      {/* WINDOW 2 — south wall (wide) */}
      <Window position={[4.5, 1.5, ROOM_HALF + 0.02]} rotation={[0, Math.PI, 0]} width={4.5} height={2.0} tex={windowTex} />

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

      {/* Sofa — richly detailed with tufting, piping and seat cushions */}
      <group position={[-4.5, 0, -6.85]}>
        {/* Base frame */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[5, 0.7, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        {/* Front piping along base */}
        <mesh position={[0, 0.7, 0.66]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 4.6, 8]} />
          <meshStandardMaterial color="#4d5867" roughness={0.8} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 1.0, -0.5]} castShadow>
          <boxGeometry args={[5, 1.3, 0.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        {/* Tufting buttons on backrest (3x4 grid) */}
        {[-2, -0.65, 0.65, 2].map((bx) =>
          [0.7, 1.25].map((by) => (
            <mesh key={`tuft-${bx}-${by}`} position={[bx, by, -0.36]} castShadow>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#4d5867" roughness={0.6} />
            </mesh>
          )),
        )}
        {/* Armrests with rolled top */}
        <mesh position={[-2.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        <mesh position={[-2.5, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.3, 16]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        <mesh position={[2.5, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 1.2, 1.3]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        <mesh position={[2.5, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.3, 16]} />
          <meshStandardMaterial color={sofaColor} roughness={0.95} />
        </mesh>
        {/* Seat cushions — slightly varied tones for fabric realism */}
        {[-1.5, 0, 1.5].map((cx, i) => (
          <group key={`seat-${i}`} position={[cx, 0.85, 0.05]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.32, 1]} />
              <meshStandardMaterial
                color={i === 1 ? "#7d8ba0" : sofaCushionColor}
                roughness={0.98}
              />
            </mesh>
            {/* Seam piping around top edge */}
            <mesh position={[0, 0.16, 0.5]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 1.4, 8]} />
              <meshStandardMaterial color="#4d5867" />
            </mesh>
          </group>
        ))}
        {/* Throw pillows */}
        <mesh position={[-1.7, 1.0, 0.15]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.55, 0.4, 0.25]} />
          <meshStandardMaterial color="#c9794a" roughness={1} />
        </mesh>
        <mesh position={[1.8, 1.0, 0.15]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.55, 0.4, 0.25]} />
          <meshStandardMaterial color="#3e6b3e" roughness={1} />
        </mesh>
        {/* A small striped patterned pillow in middle */}
        <mesh position={[0.1, 1.05, 0.18]} rotation={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[0.5, 0.35, 0.22]} />
          <meshStandardMaterial color="#e8d8b8" roughness={1} />
        </mesh>
        {/* Knitted throw blanket draped over right armrest */}
        <mesh position={[2.1, 0.78, 0.3]} rotation={[0.2, 0.1, 0]} castShadow>
          <boxGeometry args={[1.2, 0.05, 0.9]} />
          <meshStandardMaterial color="#b85c4a" roughness={1} />
        </mesh>
        <mesh position={[2.45, 0.55, 0.55]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial color="#b85c4a" roughness={1} />
        </mesh>
        {/* Folded second blanket on left armrest */}
        <mesh position={[-2.5, 1.45, 0]} castShadow>
          <boxGeometry args={[0.55, 0.12, 0.85]} />
          <meshStandardMaterial color="#5a6e7d" roughness={1} />
        </mesh>
        {/* Wooden sofa legs */}
        {[-2.4, -0.8, 0.8, 2.4].map((lx, i) => (
          <mesh key={`sleg-${i}`} position={[lx, 0.05, 0.5]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
        ))}
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
        {/* Stack of magazines */}
        <mesh position={[-0.6, 0.6, -0.3]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.55]} />
          <meshStandardMaterial color="#8b2e2e" />
        </mesh>
        <mesh position={[-0.55, 0.66, -0.28]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.75, 0.04, 0.5]} />
          <meshStandardMaterial color="#2e4a8b" />
        </mesh>
        <mesh position={[-0.62, 0.7, -0.32]} rotation={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.7, 0.03, 0.48]} />
          <meshStandardMaterial color="#e6c547" />
        </mesh>
        {/* Coffee mug */}
        <mesh position={[0.7, 0.62, 0.2]} castShadow>
          <cylinderGeometry args={[0.09, 0.075, 0.14, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.79, 0.62, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Small succulent in clay pot */}
        <mesh position={[1.1, 0.6, -0.6]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.18, 12]} />
          <meshStandardMaterial color="#a85a30" roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 0.78, -0.6]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#5a8a4a" />
        </mesh>
        {/* Remote control */}
        <mesh position={[0.2, 0.555, -0.5]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.18, 0.03, 0.45]} />
          <meshStandardMaterial color="#1a1a1a" />
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
        {/* Linen table runner */}
        <mesh position={[0, 0.905, 0]}>
          <boxGeometry args={[0.7, 0.005, 3.8]} />
          <meshStandardMaterial color="#e8d8b8" roughness={1} />
        </mesh>
        {/* Two place settings — plates */}
        {[-1.3, 1.3].map((pz, i) => (
          <group key={`plate-${i}`} position={[0, 0.91, pz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.015, 24]} />
              <meshStandardMaterial color="#fafafa" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.005, 24]} />
              <meshStandardMaterial color="#e8e2d0" />
            </mesh>
          </group>
        ))}
        {/* Wine glass */}
        <mesh position={[0.5, 1.05, 1.1]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.18, 12]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} transmission={0.9} roughness={0.05} />
        </mesh>
        <mesh position={[0.5, 0.94, 1.1]}>
          <cylinderGeometry args={[0.005, 0.005, 0.06, 8]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        <mesh position={[0.5, 0.91, 1.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.005, 12]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </group>

      {/* Chairs — backrest faces AWAY from table so a person sits facing the table */}
      {[
        { z: -2.25, faceZ: -1 }, // chair north of table → backrest on -z (away from table at z=0.25)
        { z: 2.45, faceZ: 1 },   // chair south of table → backrest on +z
      ].map((c, i) => (
        <group key={`chair-${i}`} position={[5, 0, c.z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.9]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
          {/* Cushion */}
          <mesh position={[0, 0.53, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.8]} />
            <meshStandardMaterial color="#d4b896" roughness={1} />
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
          {/* Spindle slats on backrest */}
          {[-0.3, 0, 0.3].map((sx, j) => (
            <mesh key={`slat-${j}`} position={[sx, 0.95, c.faceZ * 0.36]}>
              <cylinderGeometry args={[0.025, 0.025, 0.85, 8]} />
              <meshStandardMaterial color={chairColor} />
            </mesh>
          ))}
        </group>
      ))}

      {/* TV stand & TV with AV gear — cabinet flipped so doors face player; pushed to wall; tall legs for Roomba clearance */}
      <group position={[0, 0, 6.55]}>
        {/* Cabinet sub-group, rotated 180° so the door/front face -Z (toward player) */}
        <group rotation={[0, Math.PI, 0]}>
          {/* Top surface — raised to allow vacuum clearance underneath */}
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.06, 0.9]} />
            <meshStandardMaterial color="#3a2515" roughness={0.5} />
          </mesh>
          {/* Bottom shelf */}
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.04, 0.9]} />
            <meshStandardMaterial color="#3a2515" roughness={0.5} />
          </mesh>
          {/* Back panel (now faces +Z in world after rotation = wall side) */}
          <mesh position={[0, 0.83, -0.42]} castShadow>
            <boxGeometry args={[3.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#2a1a0c" roughness={0.7} />
          </mesh>
          {/* Side panels */}
          {[-1.78, 1.78].map((sx, i) => (
            <mesh key={`tvside-${i}`} position={[sx, 0.83, 0]} castShadow>
              <boxGeometry args={[0.04, 0.4, 0.9]} />
              <meshStandardMaterial color="#3a2515" />
            </mesh>
          ))}
          {/* Vertical divider */}
          <mesh position={[-0.5, 0.83, 0]}>
            <boxGeometry args={[0.04, 0.4, 0.9]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
          {/* Closed cabinet door — front of cabinet (after rotation, faces player) */}
          <mesh position={[-1.15, 0.83, 0.46]}>
            <boxGeometry args={[1.2, 0.38, 0.025]} />
            <meshStandardMaterial color="#4a3020" roughness={0.6} />
          </mesh>
          <mesh position={[-0.65, 0.83, 0.48]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#c9a040" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Tall legs — leave clearance under cabinet for vacuuming */}
          {[
            [-1.7, -0.4],
            [1.7, -0.4],
            [-1.7, 0.4],
            [1.7, 0.4],
          ].map(([lx, lz], i) => (
            <mesh key={`tvleg-${i}`} position={[lx, 0.31, lz]} castShadow>
              <boxGeometry args={[0.08, 0.62, 0.08]} />
              <meshStandardMaterial color="#2a1a0c" />
            </mesh>
          ))}
        </group>

        {/* === VCR (on right side of bottom shelf) === */}
        <group position={[0.7, 0.75, 0.05]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.16, 0.55]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </mesh>
          {/* Cassette slot */}
          <mesh position={[-0.05, 0.02, 0.276]}>
            <boxGeometry args={[0.5, 0.035, 0.005]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          {/* Green digital clock */}
          <mesh position={[-0.38, -0.01, 0.276]}>
            <boxGeometry args={[0.18, 0.05, 0.005]} />
            <meshBasicMaterial color="#22ff44" toneMapped={false} />
          </mesh>
          {/* Buttons */}
          {[0.1, 0.2, 0.3, 0.4].map((bx, i) => (
            <mesh key={`vcrbtn-${i}`} position={[bx, -0.02, 0.276]}>
              <boxGeometry args={[0.05, 0.035, 0.012]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          ))}
          {/* Red power LED */}
          <mesh position={[0.46, 0, 0.276]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ff2020" toneMapped={false} />
          </mesh>
        </group>

        {/* === Vinyl turntable (on top of cabinet, left side) === */}
        <group position={[-1.0, 1.12, 0]}>
          {/* Plinth */}
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.08, 0.75]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          {/* Platter */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.025, 32]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Vinyl record */}
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.004, 32]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.25} />
          </mesh>
          {/* Record label */}
          <mesh position={[0, 0.068, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.002, 24]} />
            <meshStandardMaterial color="#c93030" />
          </mesh>
          {/* Spindle */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
            <meshStandardMaterial color="#999" metalness={0.9} />
          </mesh>
          {/* Tonearm pivot */}
          <mesh position={[0.36, 0.06, 0.28]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.05, 12]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
          {/* Tonearm */}
          <mesh position={[0.15, 0.075, 0.13]} rotation={[0, -0.7, 0]} castShadow>
            <boxGeometry args={[0.45, 0.018, 0.022]} />
            <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* === TV — sits ON TOP of cabinet, screen faces -Z (toward player) === */}
        <group position={[0.5, 1.95, 0]}>
          {/* Bezel: outer frame, thin */}
          <mesh castShadow>
            <boxGeometry args={[2.6, 1.55, 0.1]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Screen — recessed slightly, BIG and clearly in front, faces -Z */}
          <mesh position={[0, 0, -0.052]}>
            <planeGeometry args={[2.4, 1.35]} />
            <meshBasicMaterial map={tvNewsTex} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* Brand label below screen */}
          <mesh position={[0, -0.7, -0.052]}>
            <planeGeometry args={[0.3, 0.05]} />
            <meshBasicMaterial color="#444" toneMapped={false} />
          </mesh>
          {/* TV stand neck */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <boxGeometry args={[0.25, 0.15, 0.15]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* TV stand foot */}
          <mesh position={[0, -0.92, 0]} castShadow>
            <boxGeometry args={[0.6, 0.02, 0.3]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
          </mesh>
        </group>

        {/* Screen glow */}
        <pointLight position={[0.5, 1.95, -0.6]} intensity={0.45} color="#9ec5ff" distance={4} />
      </group>

      {/* Bookshelf on left wall — richly detailed */}
      <group position={[-7.2, 0, 2]}>
        {/* Carcass back panel */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.4, 2.2, 4]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {/* Outer frame trim — top, bottom, sides */}
        <mesh position={[0.18, 2.2, 0]}>
          <boxGeometry args={[0.06, 0.08, 4.05]} />
          <meshStandardMaterial color="#3a2515" />
        </mesh>
        <mesh position={[0.18, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 4.05]} />
          <meshStandardMaterial color="#3a2515" />
        </mesh>
        {/* Vertical dividers — split shelves into compartments */}
        {[-1.2, 0.4].map((dz, i) => (
          <mesh key={`vdiv-${i}`} position={[0.1, 1.1, dz]}>
            <boxGeometry args={[0.32, 2.0, 0.04]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
        ))}
        {/* Horizontal shelves */}
        {[0.4, 0.95, 1.5, 2.0].map((sy, i) => (
          <mesh key={`shelf-${i}`} position={[0.05, sy, 0]}>
            <boxGeometry args={[0.35, 0.04, 3.9]} />
            <meshStandardMaterial color="#3a2515" />
          </mesh>
        ))}
        {/* Books — varied heights, some leaning */}
        {[0.65, 1.2, 1.75].map((shelfY, si) =>
          Array.from({ length: 10 }).map((_, bi) => {
            const z = -1.8 + bi * 0.4;
            const h = 0.35 + ((si * 7 + bi) % 4) * 0.04;
            const w = 0.22 + ((si * 3 + bi) % 5) * 0.03;
            const c = bookColors[(si * 5 + bi) % bookColors.length];
            const lean = ((si + bi) % 7 === 0) ? 0.15 : 0;
            return (
              <mesh
                key={`b-${si}-${bi}`}
                position={[0.1, shelfY + h / 2 - 0.18, z]}
                rotation={[0, 0, lean]}
              >
                <boxGeometry args={[w, h, 0.3]} />
                <meshStandardMaterial color={c} roughness={0.85} />
              </mesh>
            );
          }),
        )}
        {/* Stack of horizontally-laid books on shelf 1 */}
        <group position={[0.1, 0.7, -0.6]}>
          {[0, 1, 2].map((i) => (
            <mesh key={`hb-${i}`} position={[0, i * 0.06, 0]}>
              <boxGeometry args={[0.3, 0.05, 0.4]} />
              <meshStandardMaterial color={bookColors[i + 1]} roughness={0.8} />
            </mesh>
          ))}
        </group>
        {/* Decorative vase on top of shelf */}
        <mesh position={[0.1, 2.36, -1.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.25, 12]} />
          <meshStandardMaterial color="#d8c8b0" roughness={0.6} />
        </mesh>
        {/* Globe / sphere ornament */}
        <mesh position={[0.1, 2.32, 0.5]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#3e6b8b" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Small framed photo on top */}
        <group position={[0.1, 2.32, 1.2]}>
          <mesh>
            <boxGeometry args={[0.04, 0.22, 0.18]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.005, 0.18, 0.14]} />
            <meshStandardMaterial color="#c9a26a" />
          </mesh>
        </group>
        {/* Small potted succulent on middle shelf */}
        <group position={[0.1, 1.55, 1.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.12, 12]} />
            <meshStandardMaterial color="#a85a30" />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#5a8a4a" />
          </mesh>
        </group>
        {/* Bookend on right side of top shelf */}
        <mesh position={[0.1, 2.18, 1.85]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Potted fiddle-leaf fig in corner */}
      <group position={[7, 0, -7]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.35, 0.8, 16]} />
          <meshStandardMaterial color={plantPotColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.48, 0.45, 0.06, 16]} />
          <meshStandardMaterial color="#8a4a26" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.81, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 16]} />
          <meshStandardMaterial color="#2a1a10" roughness={1} />
        </mesh>
        {/* Trunk */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#6b4a2a" />
        </mesh>
        {/* Leaves */}
        {[
          { p: [0, 1.5, 0.25] as [number, number, number], r: [0.1, 0, 0.2] as [number, number, number], s: 0.45 },
          { p: [0.25, 1.6, -0.15] as [number, number, number], r: [-0.2, 0.5, -0.3] as [number, number, number], s: 0.4 },
          { p: [-0.2, 1.7, 0.1] as [number, number, number], r: [0.1, -0.4, 0.4] as [number, number, number], s: 0.42 },
          { p: [0.15, 1.85, 0.2] as [number, number, number], r: [-0.3, 0.2, -0.2] as [number, number, number], s: 0.38 },
          { p: [-0.15, 2.0, -0.2] as [number, number, number], r: [0.2, -0.6, 0.3] as [number, number, number], s: 0.4 },
          { p: [0.05, 2.15, 0.15] as [number, number, number], r: [-0.4, 0.3, 0] as [number, number, number], s: 0.36 },
        ].map((l, i) => (
          <mesh key={`leaf-${i}`} position={l.p} rotation={l.r} castShadow>
            <sphereGeometry args={[l.s, 12, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? plantLeafColor : "#4d8a4d"} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Tulips in glass vase on dining table */}
      <group position={[5, 0.91, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.28, 16]} />
          <meshPhysicalMaterial
            color="#cfe6f5"
            transparent
            opacity={0.4}
            transmission={0.85}
            roughness={0.05}
            ior={1.45}
          />
        </mesh>
        {[
          { x: 0, z: 0, h: 0.42, c: "#c93030" },
          { x: 0.05, z: -0.04, h: 0.46, c: "#e8a428" },
          { x: -0.05, z: 0.03, h: 0.4, c: "#e85a8a" },
          { x: 0.04, z: 0.05, h: 0.44, c: "#9a3ec9" },
          { x: -0.04, z: -0.05, h: 0.38, c: "#e8d028" },
        ].map((f, i) => (
          <group key={`tulip-${i}`} position={[f.x, 0, f.z]}>
            <mesh position={[0, f.h / 2, 0]}>
              <cylinderGeometry args={[0.008, 0.008, f.h, 6]} />
              <meshStandardMaterial color="#3e6b3e" />
            </mesh>
            <mesh position={[0, f.h + 0.04, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 10]} />
              <meshStandardMaterial color={f.c} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Sunflower in tall ceramic pot, by bookshelf */}
      <group position={[-7, 0, -1]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.6, 16]} />
          <meshStandardMaterial color="#e8e2d8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.23, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#d8d0c0" />
        </mesh>
        <mesh position={[0, 0.61, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
          <meshStandardMaterial color="#3a2a18" roughness={1} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 1.2, 8]} />
          <meshStandardMaterial color="#4a7a3a" roughness={0.8} />
        </mesh>
        {[0.9, 1.3, 1.6].map((ly, i) => (
          <mesh
            key={`sf-leaf-${i}`}
            position={[i % 2 === 0 ? 0.15 : -0.15, ly, 0]}
            rotation={[0, 0, i % 2 === 0 ? -0.6 : 0.6]}
            castShadow
          >
            <boxGeometry args={[0.25, 0.12, 0.02]} />
            <meshStandardMaterial color="#3a7a3a" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 1.85, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 24]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={`petal-${i}`}
              position={[Math.cos(a) * 0.18, 1.85, Math.sin(a) * 0.18]}
              rotation={[0, -a, 0]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.02, 0.07]} />
              <meshStandardMaterial color="#f5c020" roughness={0.7} />
            </mesh>
          );
        })}
      </group>

      {/* Floor lamp by sofa corner */}
      <group position={[-7, 0, -5]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.05, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.28, 0.4, 16]} />
          <meshStandardMaterial color="#fff5d6" emissive="#ffd88a" emissiveIntensity={0.4} roughness={0.9} />
        </mesh>
        <pointLight position={[0, 1.7, 0]} intensity={0.35} color="#ffd88a" distance={5} />
      </group>

      {/* Wall clock on south wall */}
      <group position={[-3, 2.3, ROOM_HALF - 0.06]} rotation={[0, Math.PI, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
          <meshStandardMaterial color="#2a2018" />
        </mesh>
        <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.005, 24]} />
          <meshStandardMaterial color="#fafafa" />
        </mesh>
        <mesh position={[0.05, 0.04, 0.04]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.16, 0.02, 0.005]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.1, 0.04]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.02, 0.22, 0.005]} />
          <meshStandardMaterial color="#1a1a1a" />
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
  // Magnify backdrop and pull it CLOSE to the glass so it reads as a tight,
  // detailed view (less empty perspective).
  const sceneScale = 1.6;
  const sceneW = width * sceneScale;
  const sceneH = height * sceneScale;
  return (
    <group position={position} rotation={rotation}>
      {/* Magnified city backdrop, tucked just behind the glass */}
      <mesh position={[0, 0, -0.25]}>
        <planeGeometry args={[sceneW, sceneH]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* Sky-blue safety tint behind, in case backdrop edges peek */}
      <mesh position={[0, 0, -0.45]}>
        <planeGeometry args={[sceneW * 1.4, sceneH * 1.4]} />
        <meshBasicMaterial color="#b8d8ee" toneMapped={false} />
      </mesh>
      {/* Glass pane — slight blue tint, transparent, subtle reflection feel */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color="#dbeefb"
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0}
          transmission={0.9}
          thickness={0.05}
          ior={1.45}
        />
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
      {/* Mullions — slim cross dividing the glass */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.04, height, 0.04]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width, 0.04, 0.04]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Sill */}
      <mesh position={[0, -halfH - 0.13, 0.18]}>
        <boxGeometry args={[width + 0.4, 0.07, 0.3]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
};
