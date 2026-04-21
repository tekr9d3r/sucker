// AABB obstacles for collision. y is ignored — Roomba is on the floor.
// Obstacles with `clearance` allow the Roomba to drive UNDER them (e.g. table tops).
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const ROOM_HALF = 13; // 26x26 room — more apartment-like
export const ROOM_HEIGHT = 2.7; // realistic ceiling
export const WALL_THICKNESS = 0.3;
export const ROOMBA_RADIUS = 0.4;

// Solid obstacles (Roomba cannot pass)
export const SOLID_OBSTACLES: AABB[] = [
  // Sofa (back wall, big L-shape main piece)
  { minX: -10, maxX: -3, minZ: -12.5, maxZ: -10.7 },
  // Sofa armrests
  { minX: -10.4, maxX: -10, minZ: -12.5, maxZ: -10.5 },
  { minX: -3, maxX: -2.6, minZ: -12.5, maxZ: -10.5 },
  // TV stand (opposite wall)
  { minX: -4, maxX: 4, minZ: 11.5, maxZ: 12.5 },
  // Bookshelf (left wall)
  { minX: -12.5, maxX: -11.6, minZ: -2, maxZ: 4 },
  // Side table next to sofa
  { minX: -2, maxX: -1.2, minZ: -12.2, maxZ: -11.4 },
  // Potted plant (corner)
  { minX: 11.4, maxX: 12.6, minZ: -12.4, maxZ: -11.2 },
  // Floor lamp (corner near TV)
  { minX: 11.4, maxX: 12, minZ: 10.5, maxZ: 11.1 },
  // Coffee table legs (4 cylinders, in front of sofa)
  { minX: -8.3, maxX: -7.9, minZ: -8.3, maxZ: -7.9 },
  { minX: -4.1, maxX: -3.7, minZ: -8.3, maxZ: -7.9 },
  { minX: -8.3, maxX: -7.9, minZ: -5.3, maxZ: -4.9 },
  { minX: -4.1, maxX: -3.7, minZ: -5.3, maxZ: -4.9 },
  // Dining table legs (right side)
  { minX: 5.7, maxX: 6.1, minZ: -2.3, maxZ: -1.9 },
  { minX: 9.4, maxX: 9.8, minZ: -2.3, maxZ: -1.9 },
  { minX: 5.7, maxX: 6.1, minZ: 3.4, maxZ: 3.8 },
  { minX: 9.4, maxX: 9.8, minZ: 3.4, maxZ: 3.8 },
  // Chairs (solid base)
  { minX: 7, maxX: 8.5, minZ: -4.2, maxZ: -3 },
  { minX: 7, maxX: 8.5, minZ: 4.5, maxZ: 5.7 },
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
