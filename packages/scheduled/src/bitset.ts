export function computePowerOfTwoMask(requestedCapacity: number): {
  capacity: number;
  mask: number;
} {
  const capacity = 1 << (32 - Math.clz32(Math.max(requestedCapacity, 2) - 1));
  const mask = capacity - 1;
  return { capacity, mask };
}

export class SlotBitset128 {
  private mask: bigint;

  constructor(initialMask: bigint = 0n) {
    this.mask = initialMask & ((1n << 128n) - 1n);
  }

  get rawMask(): bigint {
    return this.mask;
  }

  occupySlot(slotIndex: number): void {
    if (slotIndex < 0 || slotIndex >= 128) return;
    this.mask |= 1n << BigInt(slotIndex);
  }

  freeSlot(slotIndex: number): void {
    if (slotIndex < 0 || slotIndex >= 128) return;
    this.mask &= ~(1n << BigInt(slotIndex));
  }

  isSlotOccupied(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= 128) return true;
    return (this.mask & (1n << BigInt(slotIndex))) !== 0n;
  }

  static createSpanMask(startSlot: number, slotCount: number): bigint {
    if (slotCount <= 0 || startSlot < 0 || startSlot + slotCount > 128) {
      return 0n;
    }
    const span = (1n << BigInt(slotCount)) - 1n;
    return span << BigInt(startSlot);
  }

  hasCollision(startSlot: number, slotCount: number, bufferPaddingSlots = 0): boolean {
    const totalSlots = slotCount + bufferPaddingSlots;
    const requested = SlotBitset128.createSpanMask(startSlot, totalSlots);
    if (requested === 0n) return true;
    return (this.mask & requested) !== 0n;
  }

  merge(other: SlotBitset128): SlotBitset128 {
    return new SlotBitset128(this.mask | other.rawMask);
  }
}
