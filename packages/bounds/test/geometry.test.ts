import { describe, it, expect } from "vitest";
import {
  checkAABBIntersection,
  computeAABBOverlap,
  isPointInPolygon,
  rectToAABB,
  type Point2D,
} from "../src/geometry";

describe("AABB Geometry Math", () => {
  it("detects overlapping and non-overlapping bounding boxes", () => {
    const boxA = rectToAABB({ x: 0, y: 0, width: 100, height: 100 });
    const boxB = rectToAABB({ x: 50, y: 50, width: 100, height: 100 });
    const boxC = rectToAABB({ x: 200, y: 200, width: 50, height: 50 });

    expect(checkAABBIntersection(boxA, boxB)).toBe(true);
    expect(checkAABBIntersection(boxA, boxC)).toBe(false);

    const overlap = computeAABBOverlap(boxA, boxB);
    expect(overlap).toEqual({ minX: 50, minY: 50, maxX: 100, maxY: 100 });
  });

  it("accurately tests point-in-polygon containment with ray-casting", () => {
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    expect(isPointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
    expect(isPointInPolygon({ x: 150, y: 50 }, square)).toBe(false);
    expect(isPointInPolygon({ x: -10, y: -10 }, square)).toBe(false);
  });
});
