import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM_HALF, SOLID_OBSTACLES, ROOMBA_RADIUS } from "./obstacles";
import { useGameStore } from "./useGameStore";

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

/**
 * Cleaned trail visualization: instead of removing dust sprites, we now SHOW
 * a glossy "wet" shine sprite on cells that have been cleaned. The base floor
 * is always visible; cleaned cells get a soft highlight quad on top.
 */
export const DirtField = ({ playerRef, active }: Props) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const setProgress = useGameStore((s) => s.setProgress);
  const bumpCells = useGameStore((s) => s.bumpCells);

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

  const cleanedRef = useRef<Uint8Array>(new Uint8Array(cells.length));
  const cleanedCountRef = useRef(0);

  // Reuseable matrices
  const visibleMatricesRef = useRef<THREE.Matrix4[]>([]);
  const zeroMatrix = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);

  // Build precomputed "shine" matrices for every cell (we'll swap them in when cleaned)
  useEffect(() => {
    const arr: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const scl = new THREE.Vector3(1, 1, 1);
    const pos = new THREE.Vector3();
    cells.forEach((c) => {
      const m = new THREE.Matrix4();
      pos.set(c.x, 0.012, c.z);
      m.compose(pos, q, scl);
      arr.push(m);
    });
    visibleMatricesRef.current = arr;
  }, [cells]);

  // Expose cleaned grid for minimap
  useEffect(() => {
    (window as unknown as { __dirtCells?: { cells: typeof cells; cleaned: Uint8Array; grid: number } }).__dirtCells = {
      cells,
      cleaned: cleanedRef.current,
      grid: GRID,
    };
  }, [cells]);

  const status = useGameStore((s) => s.status);
  useEffect(() => {
    if (status === "idle" || status === "playing") {
      cleanedRef.current = new Uint8Array(cells.length);
      cleanedCountRef.current = 0;
      const mesh = meshRef.current;
      if (mesh) {
        // Hide all instances initially (nothing cleaned yet)
        for (let i = 0; i < cells.length; i++) {
          mesh.setMatrixAt(i, zeroMatrix);
        }
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
  }, [status, cells, setProgress, bumpCells, zeroMatrix]);

  const lastBump = useRef(0);
  const idxMapRef = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    const m = new Map<number, number>();
    cells.forEach((c, i) => m.set(c.idx, i));
    idxMapRef.current = m;
  }, [cells]);

  useFrame(() => {
    if (!active) return;
    const mesh = meshRef.current;
    if (!mesh) return;
    const px = playerRef.current.x;
    const pz = playerRef.current.z;
    const r = ROOMBA_RADIUS;
    const r2 = r * r;

    const minIx = Math.max(0, Math.floor((px - r + ROOM_HALF) / CELL));
    const maxIx = Math.min(GRID - 1, Math.floor((px + r + ROOM_HALF) / CELL));
    const minIz = Math.max(0, Math.floor((pz - r + ROOM_HALF) / CELL));
    const maxIz = Math.min(GRID - 1, Math.floor((pz + r + ROOM_HALF) / CELL));

    let cleanedThisFrame = 0;
    const visMats = visibleMatricesRef.current;
    for (let iz = minIz; iz <= maxIz; iz++) {
      for (let ix = minIx; ix <= maxIx; ix++) {
        const cx = cellCenter(ix);
        const cz = cellCenter(iz);
        const dx = cx - px;
        const dz = cz - pz;
        if (dx * dx + dz * dz > r2) continue;
        const instanceIdx = idxMapRef.current.get(iz * GRID + ix);
        if (instanceIdx === undefined) continue;
        if (cleanedRef.current[instanceIdx]) continue;
        cleanedRef.current[instanceIdx] = 1;
        // Show this shine instance
        mesh.setMatrixAt(instanceIdx, visMats[instanceIdx]);
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
    (window as unknown as { __cleaningRate?: number }).__cleaningRate = cleanedThisFrame;
  });

  // Procedural radial-glow texture for that "wet shine" look
  const shineTexture = useMemo(() => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const grd = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    grd.addColorStop(0, "rgba(255,255,255,0.85)");
    grd.addColorStop(0.4, "rgba(220,240,255,0.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, cells.length]}
      frustumCulled={false}
    >
      <planeGeometry args={[CELL * 1.7, CELL * 1.7]} />
      <meshBasicMaterial
        map={shineTexture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

export { GRID, CELL };
