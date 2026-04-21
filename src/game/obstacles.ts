// AABB obstacles for collision. y is ignored — Roomba is on the floor.
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// World scaling: shrink room footprint (X/Z) by this factor while keeping
// ceiling height in world units. Apartment.tsx wraps its visuals in a
// <group scale={[WORLD_SCALE, 1, WORLD_SCALE]}> so we keep raw unscaled coords
// inside Apartment and scale collision bounds here.
export const WORLD_SCALE = 0.7;
const _S = WORLD_SCALE;

// Raw (unscaled) room footprint used inside the scaled apartment group
export const RAW_ROOM_HALF = 8;
// Scaled (world) room footprint used by physics, AI, dirt grid
export const ROOM_HALF = RAW_ROOM_HALF * _S;
export const ROOM_HEIGHT = 3.6; // taller ceiling (world Y, not scaled)
export const WALL_THICKNESS = 0.3 * _S;
export const ROOMBA_RADIUS = 0.4 * _S;

// Door opening (raw and scaled variants)
export const RAW_DOOR_X_MIN = 3.2;
export const RAW_DOOR_X_MAX = 4.8;
export const DOOR_X_MIN = RAW_DOOR_X_MIN * _S;
export const DOOR_X_MAX = RAW_DOOR_X_MAX * _S;

// Solid obstacles (Roomba cannot pass) — defined in unscaled units, then scaled
const RAW_OBSTACLES: AABB[] = [
  // Sofa
  { minX: -7, maxX: -2, minZ: -7.5, maxZ: -6.2 },
  { minX: -7.4, maxX: -7, minZ: -7.5, maxZ: -6 },
  { minX: -2, maxX: -1.6, minZ: -7.5, maxZ: -6 },
  // TV stand
  { minX: -3, maxX: 3, minZ: 6.8, maxZ: 7.5 },
  // Bookshelf (left wall)
  { minX: -7.5, maxX: -6.9, minZ: 0, maxZ: 4 },
  // Side table next to sofa
  { minX: -1.2, maxX: -0.5, minZ: -7.3, maxZ: -6.6 },
  // Plant in corner
  { minX: 6.5, maxX: 7.4, minZ: -7.4, maxZ: -6.5 },
  // Coffee table legs
  { minX: -5.3, maxX: -4.95, minZ: -4.8, maxZ: -4.45 },
  { minX: -3.05, maxX: -2.7, minZ: -4.8, maxZ: -4.45 },
  { minX: -5.3, maxX: -4.95, minZ: -2.95, maxZ: -2.6 },
  { minX: -3.05, maxX: -2.7, minZ: -2.95, maxZ: -2.6 },
  // Dining table legs (right side)
  { minX: 3.7, maxX: 4.0, minZ: -1.5, maxZ: -1.2 },
  { minX: 6.0, maxX: 6.3, minZ: -1.5, maxZ: -1.2 },
  { minX: 3.7, maxX: 4.0, minZ: 1.7, maxZ: 2.0 },
  { minX: 6.0, maxX: 6.3, minZ: 1.7, maxZ: 2.0 },
  // Chairs
  { minX: 4.4, maxX: 5.6, minZ: -2.7, maxZ: -1.8 },
  { minX: 4.4, maxX: 5.6, minZ: 2.0, maxZ: 2.9 },
];
export const SOLID_OBSTACLES: AABB[] = RAW_OBSTACLES.map((b) => ({
  minX: b.minX * _S,
  maxX: b.maxX * _S,
  minZ: b.minZ * _S,
  maxZ: b.maxZ * _S,
}));

// Walls — split north wall into two segments to leave a door opening
export const WALLS: AABB[] = [
  // North wall left segment (from -ROOM_HALF to DOOR_X_MIN)
  {
    minX: -ROOM_HALF - WALL_THICKNESS,
    maxX: DOOR_X_MIN,
    minZ: -ROOM_HALF - WALL_THICKNESS,
    maxZ: -ROOM_HALF,
  },
  // North wall right segment (from DOOR_X_MAX to +ROOM_HALF)
  {
    minX: DOOR_X_MAX,
    maxX: ROOM_HALF + WALL_THICKNESS,
    minZ: -ROOM_HALF - WALL_THICKNESS,
    maxZ: -ROOM_HALF,
  },
  // South wall
  {
    minX: -ROOM_HALF - WALL_THICKNESS,
    maxX: ROOM_HALF + WALL_THICKNESS,
    minZ: ROOM_HALF,
    maxZ: ROOM_HALF + WALL_THICKNESS,
  },
  // West wall
  { minX: -ROOM_HALF - WALL_THICKNESS, maxX: -ROOM_HALF, minZ: -ROOM_HALF, maxZ: ROOM_HALF },
  // East wall
  { minX: ROOM_HALF, maxX: ROOM_HALF + WALL_THICKNESS, minZ: -ROOM_HALF, maxZ: ROOM_HALF },
];

const ALL: AABB[] = [...WALLS, ...SOLID_OBSTACLES];

export const resolveCollision = (
  oldX: number,
  oldZ: number,
  newX: number,
  newZ: number,
): { x: number; z: number; hit: boolean } => {
  let x = newX;
  let z = newZ;
  let hit = false;
  const r = ROOMBA_RADIUS;

  for (const b of ALL) {
    if (x + r > b.minX && x - r < b.maxX && oldZ + r > b.minZ && oldZ - r < b.maxZ) {
      x = oldX;
      hit = true;
      break;
    }
  }
  for (const b of ALL) {
    if (x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ) {
      z = oldZ;
      hit = true;
      break;
    }
  }
  return { x, z, hit };
};

// Check if a point is inside any solid obstacle (used by cat AI)
export const isPointBlocked = (x: number, z: number, padding = 0.3): boolean => {
  if (
    x < -ROOM_HALF + padding ||
    x > ROOM_HALF - padding ||
    z < -ROOM_HALF + padding ||
    z > ROOM_HALF - padding
  ) {
    return true;
  }
  for (const b of SOLID_OBSTACLES) {
    if (
      x + padding > b.minX &&
      x - padding < b.maxX &&
      z + padding > b.minZ &&
      z - padding < b.maxZ
    ) {
      return true;
    }
  }
  return false;
};
