// jsdom doesn't implement PointerEvent or DragEvent — shim them on top of MouseEvent.

class PointerEventShim extends MouseEvent {
  readonly pointerId: number;
  readonly width: number;
  readonly height: number;
  readonly pressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.width = init.width ?? 1;
    this.height = init.height ?? 1;
    this.pressure = init.pressure ?? 0;
    this.tiltX = init.tiltX ?? 0;
    this.tiltY = init.tiltY ?? 0;
    this.pointerType = init.pointerType ?? "mouse";
    this.isPrimary = init.isPrimary ?? true;
  }
}

class DragEventShim extends MouseEvent {
  readonly dataTransfer: DataTransfer | null;

  constructor(type: string, init: DragEventInit = {}) {
    super(type, init);
    this.dataTransfer = init.dataTransfer ?? null;
  }
}

// Tests run with `isolate: false`, so anything patched on the global scope leaks into the other
// test files sharing this worker. Remember the originals so the test file can put them back.
const g = globalThis as any; // eslint-disable-line @typescript-eslint/no-explicit-any
const originals = {
  PointerEvent: g.PointerEvent,
  DragEvent: g.DragEvent,
  requestAnimationFrame: g.requestAnimationFrame,
  cancelAnimationFrame: g.cancelAnimationFrame,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
};

export function restoreGlobals(): void {
  g.PointerEvent = originals.PointerEvent;
  g.DragEvent = originals.DragEvent;
  g.requestAnimationFrame = originals.requestAnimationFrame;
  g.cancelAnimationFrame = originals.cancelAnimationFrame;
  Object.defineProperty(window, "innerWidth", { value: originals.innerWidth, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: originals.innerHeight, configurable: true });
}

// Install globally so test files can use `new PointerEvent(...)` / `new DragEvent(...)`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).PointerEvent = PointerEventShim;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).DragEvent = DragEventShim;

// jsdom doesn't implement pointer capture — shim as no-ops.
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.hasPointerCapture = () => false;
}

// Make requestAnimationFrame synchronous in jsdom so pointermove tests don't need to advance frames.
// The context code uses `rafPending` (not the return value) as the dedup guard, so this is safe.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback): number => {
  cb(performance.now());
  return 0;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).cancelAnimationFrame = (_id: number): void => {};
