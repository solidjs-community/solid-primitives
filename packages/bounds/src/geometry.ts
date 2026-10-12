export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface BoundingBox2D {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface Rect2D {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function rectToAABB(rect: Rect2D): BoundingBox2D {
  return {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  };
}

export function checkAABBIntersection(
  a: BoundingBox2D,
  b: BoundingBox2D,
): boolean {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY
  );
}

export function computeAABBOverlap(
  a: BoundingBox2D,
  b: BoundingBox2D,
): BoundingBox2D | null {
  if (!checkAABBIntersection(a, b)) return null;

  return {
    minX: Math.max(a.minX, b.minX),
    minY: Math.max(a.minY, b.minY),
    maxX: Math.min(a.maxX, b.maxX),
    maxY: Math.min(a.maxY, b.maxY),
  };
}

export function computePolygonBounds(
  polygon: readonly Point2D[],
): BoundingBox2D {
  const len = polygon.length;
  if (len === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = polygon[0].x;
  let maxX = polygon[0].x;
  let minY = polygon[0].y;
  let maxY = polygon[0].y;

  for (let i = 1; i < len; i++) {
    const pt = polygon[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  return { minX, minY, maxX, maxY };
}

export function isPointInPolygon(
  point: Point2D,
  polygon: readonly Point2D[],
  precomputedBounds?: BoundingBox2D,
): boolean {
  const len = polygon.length;
  if (len < 3) return false;

  const bounds = precomputedBounds ?? computePolygonBounds(polygon);

  if (
    point.x < bounds.minX ||
    point.x > bounds.maxX ||
    point.y < bounds.minY ||
    point.y > bounds.maxY
  ) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
