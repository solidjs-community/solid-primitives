import { describe, it, expect } from "vitest";
import {
  computePowerOfTwoMask,
  SlotBitset128,
} from "../src/bitset";

describe("Power-of-Two RingBuffer & 128-bit Slot Bitset", () => {
  it("calculates exact power-of-two bitmasks", () => {
    expect(computePowerOfTwoMask(100)).toEqual({ capacity: 128, mask: 127 });
    expect(computePowerOfTwoMask(1024)).toEqual({ capacity: 1024, mask: 1023 });
  });

  it("performs branchless 128-bit slot collision detection", () => {
    const schedule = new SlotBitset128();

    schedule.occupySlot(10);
    expect(schedule.isSlotOccupied(10)).toBe(true);
    expect(schedule.isSlotOccupied(11)).toBe(false);

    expect(schedule.hasCollision(8, 4)).toBe(true);
    expect(schedule.hasCollision(11, 4)).toBe(false);
    expect(schedule.hasCollision(8, 2, 1)).toBe(true);
  });
});
