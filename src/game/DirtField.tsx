import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM_HALF, SOLID_OBSTACLES, ROOMBA_RADIUS } from "./obstacles";
import { useGameStore } from "./useGameStore";
import dustUrl from "@/assets/dust.png";

const GRID = 70;
const CELL = (ROOM_HALF * 2) / GRID;

const cellCenter = (i: number) => -ROOM_HALF + (i + 0.5) * CELL;

const isCellBlocked = (cx: number, cz: number) => {
  for (const b of SOLID_OBSTACLES) {
    if (cx > b.minX && cx < b.maxX && cz > b.minZ && cz < b.maxZ) return true;
  }
  return false;
};

interface Props {
  playerRef: React.MutableRefObject<{ x: number; z: number }>;
  active: boolean;
}

export const DirtField = ({ playerRef, active }: Props) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const setProgress = useGameStore((s) => s.setProgress);
  const bumpCells = useGameStore((s) => s.bumpCells);

  // Build cells: include only non-blocked cells
  const { cells, total } = useMemo(() => {
    const list: { x: number; z: number; idx: number }[] = [];
    for (let iz = 0; iz < GRID; iz++) {
      for (let ix = 0; ix < GRID; ix++) {
        const x = cellCenter(ix);
        const z = cellCenter(iz);
        if (isCellBlocked(x, z)) continue;
        list.push({ x, z, idx: iz * GRID + ix });
      }
    }
    return { cells: list, total: list.length };
  }, []);

  // Track cleaned state per instance
  const cleanedRef = useRef<Uint8Array>(new Uint8Array(cells.length));
  const cleanedCountRef = useRef(0);

  // Expose cleaned grid for minimap (sparse map idx -> cleaned)
  const cellMapRef = useRef<Map<number, boolean>>(new Map());

  useEffect(() => {
    cellMapRef.current = new Map();
    cells.forEach((c, i) => cellMapRef.current.set(c.idx, false));
    (window as unknown as { __dirtCells?: { cells: typeof cells; cleaned: Uint8Array; grid: number } }).__dirtCells = {
      cells,
      cleaned: cleanedRef.current,
      grid: GRID,
    };
  }, [cells]);

  // Reset on game restart
  const status = useGameStore((s) => s.status);
  useEffect(() => {
    if (status === "idle" || status === "playing") {
      cleanedRef.current = new Uint8Array(cells.length);
      cleanedCountRef.current = 0;
      const mesh = meshRef.current;
      if (mesh) {
        const m = new THREE.Matrix4();
        cells.forEach((c, i) => {
          // small random jitter & scale for organic look
          const jx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
          const jz = (Math.cos(i * 78.233) * 12345.6789) % 1;
          const ox = (jx - 0.5) * CELL * 0.4;
          const oz = (jz - 0.5) * CELL * 0.4;
          const s = 0.6 + Math.abs(jx) * 0.5;
          m.makeScale(s, s, s);
          m.setPosition(c.x + ox, 0.005, c.z + oz);
          mesh.setMatrixAt(i, m);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.count = cells.length;
      }
      (window as unknown as { __dirtCells?: { cleaned: Uint8Array } }).__dirtCells = {
        ...(window as unknown as { __dirtCells: { cells: typeof cells; cleaned: Uint8Array; grid: number } }).__dirtCells,
        cleaned: cleanedRef.current,
      };
      setProgress(0, cells.length);
      bumpCells();
    }
  }, [status, cells, setProgress, bumpCells]);

  // Hide instance by scaling to 0
  const tmpMatrix = useMemo(() => new THREE.Matrix4(), []);
  const zeroMatrix = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);

  const lastBump = useRef(0);

  useFrame(() => {
    if (!active) return;
    const mesh = meshRef.current;
    if (!mesh) return;
    const px = playerRef.current.x;
    const pz = playerRef.current.z;
    const r = ROOMBA_RADIUS;
    const r2 = r * r;

    // Compute candidate cells in bounding box
    const minIx = Math.max(0, Math.floor((px - r + ROOM_HALF) / CELL));
    const maxIx = Math.min(GRID - 1, Math.floor((px + r + ROOM_HALF) / CELL));
    const minIz = Math.max(0, Math.floor((pz - r + ROOM_HALF) / CELL));
    const maxIz = Math.min(GRID - 1, Math.floor((pz + r + ROOM_HALF) / CELL));

    let cleanedThisFrame = 0;
    for (let iz = minIz; iz <= maxIz; iz++) {
      for (let ix = minIx; ix <= maxIx; ix++) {
        const cx = cellCenter(ix);
        const cz = cellCenter(iz);
        const dx = cx - px;
        const dz = cz - pz;
        if (dx * dx + dz * dz > r2) continue;
        // Find instance index for this cell (linear search is OK because bbox is tiny)
        // We'll use a precomputed map for speed.
        const instanceIdx = idxMapRef.current.get(iz * GRID + ix);
        if (instanceIdx === undefined) continue;
        if (cleanedRef.current[instanceIdx]) continue;
        cleanedRef.current[instanceIdx] = 1;
        mesh.setMatrixAt(instanceIdx, zeroMatrix);
        cleanedThisFrame++;
      }
    }

    if (cleanedThisFrame > 0) {
      cleanedCountRef.current += cleanedThisFrame;
      mesh.instanceMatrix.needsUpdate = true;
      setProgress(cleanedCountRef.current, total);
      const now = performance.now();
      if (now - lastBump.current > 120) {
        bumpCells();
        lastBump.current = now;
      }
    }
    // expose suction intensity (how much cleaning happening)
    (window as unknown as { __cleaningRate?: number }).__cleaningRate = cleanedThisFrame;
    // suppress unused warning
    void tmpMatrix;
  });

  // Build idx -> instanceIndex map
  const idxMapRef = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    const m = new Map<number, number>();
    cells.forEach((c, i) => m.set(c.idx, i));
    idxMapRef.current = m;
  }, [cells]);

  const dustTex = useLoader(THREE.TextureLoader, dustUrl);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, cells.length]}
      frustumCulled={false}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.008, 0]}
    >
      <planeGeometry args={[CELL * 1.5, CELL * 1.5]} />
      <meshBasicMaterial
        map={dustTex}
        transparent
        opacity={0.85}
        depthWrite={false}
        alphaTest={0.05}
      />
    </instancedMesh>
  );
};

export { GRID, CELL };
