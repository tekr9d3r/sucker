import { ROOM_HALF, WALL_THICKNESS } from "./obstacles";

const wallColor = "#f1e8d6";
const floorColor = "#b8956a";
const sofaColor = "#6b7a8f";
const tableColor = "#5d3a1f";
const tvColor = "#222831";
const plantPotColor = "#a0522d";
const plantLeafColor = "#3a7a3a";
const chairColor = "#8b5a3c";

export const Apartment = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color={floorColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Floor plank lines (subtle stripes) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`plank-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, -ROOM_HALF + 1 + i * 2]}
        >
          <planeGeometry args={[ROOM_HALF * 2, 0.04]} />
          <meshBasicMaterial color="#8a6a44" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#fff8ec" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -ROOM_HALF - WALL_THICKNESS / 2]}>
        <boxGeometry args={[ROOM_HALF * 2 + WALL_THICKNESS * 2, 4, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, 2, ROOM_HALF + WALL_THICKNESS / 2]}>
        <boxGeometry args={[ROOM_HALF * 2 + WALL_THICKNESS * 2, 4, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[-ROOM_HALF - WALL_THICKNESS / 2, 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, 4, ROOM_HALF * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[ROOM_HALF + WALL_THICKNESS / 2, 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, 4, ROOM_HALF * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Window cutout (decorative bright panel on right wall) */}
      <mesh position={[ROOM_HALF - 0.05, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4, 1.6]} />
        <meshBasicMaterial color="#fff4d6" />
      </mesh>

      {/* Sofa */}
      <group position={[-5, 0, -8.75]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[6, 0.8, 1.5]} />
          <meshStandardMaterial color={sofaColor} />
        </mesh>
        <mesh position={[0, 1.1, -0.5]} castShadow>
          <boxGeometry args={[6, 1.2, 0.5]} />
          <meshStandardMaterial color={sofaColor} />
        </mesh>
        {/* Cushions */}
        <mesh position={[-2, 0.95, 0.1]} castShadow>
          <boxGeometry args={[1.8, 0.3, 1.2]} />
          <meshStandardMaterial color="#8694a8" />
        </mesh>
        <mesh position={[0, 0.95, 0.1]} castShadow>
          <boxGeometry args={[1.8, 0.3, 1.2]} />
          <meshStandardMaterial color="#8694a8" />
        </mesh>
        <mesh position={[2, 0.95, 0.1]} castShadow>
          <boxGeometry args={[1.8, 0.3, 1.2]} />
          <meshStandardMaterial color="#8694a8" />
        </mesh>
      </group>

      {/* Coffee table — top floats above so Roomba can drive under */}
      <group position={[-4.5, 0, -5]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[3.8, 0.1, 2.8]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {/* Legs */}
        {[
          [-1.7, -1.2],
          [1.7, -1.2],
          [-1.7, 1.2],
          [1.7, 1.2],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.25, lz]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
      </group>

      {/* Dining table — also drivable under */}
      <group position={[5.5, 0, 1]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[3.8, 0.1, 4.6]} />
          <meshStandardMaterial color={tableColor} />
        </mesh>
        {[
          [-1.7, -2.1],
          [1.7, -2.1],
          [-1.7, 2.1],
          [1.7, 2.1],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.425, lz]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.85, 12]} />
            <meshStandardMaterial color={tableColor} />
          </mesh>
        ))}
      </group>

      {/* Chairs */}
      <group position={[5.5, 0, -2.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.2, 0.6, 1]} />
          <meshStandardMaterial color={chairColor} />
        </mesh>
        <mesh position={[0, 1.0, -0.45]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.1]} />
          <meshStandardMaterial color={chairColor} />
        </mesh>
      </group>
      <group position={[5.5, 0, 4.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.2, 0.6, 1]} />
          <meshStandardMaterial color={chairColor} />
        </mesh>
        <mesh position={[0, 1.0, 0.45]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.1]} />
          <meshStandardMaterial color={chairColor} />
        </mesh>
      </group>

      {/* TV stand */}
      <group position={[0, 0, 9]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[6, 0.8, 1]} />
          <meshStandardMaterial color={tvColor} />
        </mesh>
        {/* TV screen */}
        <mesh position={[0, 1.8, 0.3]} castShadow>
          <boxGeometry args={[3.5, 1.8, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#1a3a5c" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Potted plant */}
      <group position={[8.8, 0, -8.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.4, 0.8, 16]} />
          <meshStandardMaterial color={plantPotColor} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={plantLeafColor} />
        </mesh>
        <mesh position={[0.3, 1.7, 0.1]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#4d8a4d" />
        </mesh>
        <mesh position={[-0.3, 1.6, -0.1]} castShadow>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#356b35" />
        </mesh>
      </group>
    </group>
  );
};
