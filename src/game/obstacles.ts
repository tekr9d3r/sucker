// AABB obstacles for collision. y is ignored — Roomba is on the floor.
// Obstacles with `clearance` allow the Roomba to drive UNDER them (e.g. table tops).
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const ROOM_HALF = 10; // 20x20 room
export const WALL_THICKNESS = 0.3;
export const ROOMBA_RADIUS = 0.4;

// Solid obstacles (Roomba cannot pass)
export const SOLID_OBSTACLES: AABB[] = [
  // Sofa (back wall, big)
  { minX: -8, maxX: -2, minZ: -9.5, maxZ: -8 },
  // TV stand (opposite wall)
  { minX: -3, maxX: 3, minZ: 8.5, maxZ: 9.5 },
  // Potted plant (corner)
  { minX: 8.2, maxX: 9.4, minZ: -9.4, maxZ: -8.2 },
  // Coffee table legs (4 cylinders, in front of sofa)
  { minX: -6.3, maxX: -5.9, minZ: -6.3, maxZ: -5.9 },
  { minX: -3.1, maxX: -2.7, minZ: -6.3, maxZ: -5.9 },
  { minX: -6.3, maxX: -5.9, minZ: -3.7, maxZ: -3.3 },
  { minX: -3.1, maxX: -2.7, minZ: -3.7, maxZ: -3.3 },
  // Dining table legs (right side)
  { minX: 3.7, maxX: 4.1, minZ: -1.3, maxZ: -0.9 },
  { minX: 6.9, maxX: 7.3, minZ: -1.3, maxZ: -0.9 },
  { minX: 3.7, maxX: 4.1, minZ: 2.9, maxZ: 3.3 },
  { minX: 6.9, maxX: 7.3, minZ: 2.9, maxZ: 3.3 },
  // Chairs (solid base)
  { minX: 4.9, maxX: 6.1, minZ: -3, maxZ: -2 },
  { minX: 4.9, maxX: 6.1, minZ: 4, maxZ: 5 },
];

// Walls (4)
export const WALLS: AABB[] = [
  { minX: -ROOM_HALF - WALL_THICKNESS, maxX: ROOM_HALF + WALL_THICKNESS, minZ: -ROOM_HALF - WALL_THICKNESS, maxZ: -ROOM_HALF },
  { minX: -ROOM_HALF - WALL_THICKNESS, maxX: ROOM_HALF + WALL_THICKNESS, minZ: ROOM_HALF, maxZ: ROOM_HALF + WALL_THICKNESS },
  { minX: -ROOM_HALF - WALL_THICKNESS, maxX: -ROOM_HALF, minZ: -ROOM_HALF, maxZ: ROOM_HALF },
  { minX: ROOM_HALF, maxX: ROOM_HALF + WALL_THICKNESS, minZ: -ROOM_HALF, maxZ: ROOM_HALF },
];

const ALL: AABB[] = [...WALLS, ...SOLID_OBSTACLES];

// Returns corrected (x, z) after collision resolution and whether a collision occurred.
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

  // Try X movement
  for (const b of ALL) {
    if (x + r > b.minX && x - r < b.maxX && oldZ + r > b.minZ && oldZ - r < b.maxZ) {
      x = oldX;
      hit = true;
      break;
    }
  }
  // Try Z movement
  for (const b of ALL) {
    if (x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ) {
      z = oldZ;
      hit = true;
      break;
    }
  }
  return { x, z, hit };
};
