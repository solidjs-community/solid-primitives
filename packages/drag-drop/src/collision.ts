import type { CollisionDetector } from "./types.ts";

/** Returns the droppable whose center is nearest to the pointer. Uses squared distance — no sqrt needed. */
export const closestCenter: CollisionDetector = (_draggable, droppables, pointer) => {
  let best: string | number | null = null;
  let bestDistSq = Infinity;
  const px = pointer.x, py = pointer.y;
  for (const d of droppables) {
    // >> 1 instead of * 0.5: truncates width/height to a 32-bit int and floors the
    // halving, so the computed center can be off by up to ~1px on fractional rects.
    const dx = px - (d.rect.left + (d.rect.width >> 1));
    const dy = py - (d.rect.top + (d.rect.height >> 1));
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) { bestDistSq = distSq; best = d.id; }
  }
  return best;
};

/** Returns the droppable whose nearest corner is closest to the pointer. Uses squared distance — no sqrt needed. */
export const closestCorners: CollisionDetector = (_draggable, droppables, pointer) => {
  let best: string | number | null = null;
  let bestDistSq = Infinity;
  const px = pointer.x, py = pointer.y;
  for (const d of droppables) {
    const { left, right, top, bottom } = d.rect;
    // Precompute each delta and its square once — each is reused by two of the
    // four corners below (dxl by top-left & bottom-left, dyt by top-left & top-right, etc.)
    const dxl = px - left, dxr = px - right, dyt = py - top, dyb = py - bottom;
    const dxls = dxl * dxl, dxrs = dxr * dxr, dyts = dyt * dyt, dybs = dyb * dyb;
    let distSq: number;
    // top-left
    distSq = dxls + dyts; if (distSq < bestDistSq) { bestDistSq = distSq; best = d.id; }
    // top-right
    distSq = dxrs + dyts; if (distSq < bestDistSq) { bestDistSq = distSq; best = d.id; }
    // bottom-left
    distSq = dxls + dybs; if (distSq < bestDistSq) { bestDistSq = distSq; best = d.id; }
    // bottom-right
    distSq = dxrs + dybs; if (distSq < bestDistSq) { bestDistSq = distSq; best = d.id; }
  }
  return best;
};

/** Returns the droppable with the largest overlap area with the draggable. */
export const rectIntersection: CollisionDetector = (draggable, droppables) => {
  const dr = draggable.rect;
  let best: string | number | null = null;
  let bestArea = 0;
  for (const d of droppables) {
    const r = d.rect;
    const xOverlap = Math.max(0, Math.min(dr.right, r.right) - Math.max(dr.left, r.left));
    const yOverlap = Math.max(0, Math.min(dr.bottom, r.bottom) - Math.max(dr.top, r.top));
    const area = xOverlap * yOverlap;
    if (area > bestArea) { bestArea = area; best = d.id; }
  }
  return best;
};

/** Returns the topmost droppable whose rect contains the pointer. */
export const pointerWithin: CollisionDetector = (_draggable, droppables, pointer) => {
  const px = pointer.x, py = pointer.y;
  for (let i = droppables.length - 1; i >= 0; i--) {
    const d = droppables[i]!;
    const r = d.rect;
    if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) return d.id;
  }
  return null;
};
