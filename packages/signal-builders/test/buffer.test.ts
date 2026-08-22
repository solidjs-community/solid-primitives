import { describe, expect, it, vi } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createDoubleBuffer } from "../src/buffer";

describe("createDoubleBuffer", () => {
  it("initializes with bufferFactory data", () => {
    createRoot(dispose => {
      const [buffer] = createDoubleBuffer(() => new Float32Array([1, 2, 3]));
      expect(buffer()).toEqual(new Float32Array([1, 2, 3]));
      dispose();
    });
  });

  it("updates buffer values without allocating new instances", () => {
    createRoot(dispose => {
      let allocationCount = 0;
      const [buffer, updateBuffer] = createDoubleBuffer(() => {
        allocationCount++;
        return new Float32Array(3);
      });

      expect(allocationCount).toBe(2); // front and back

      updateBuffer(back => {
        back[0] = 10;
        back[1] = 20;
        back[2] = 30;
      });

      expect(buffer()).toEqual(new Float32Array([10, 20, 30]));
      expect(allocationCount).toBe(2); // No new allocations during update

      dispose();
    });
  });

  it("triggers reactive effects on buffer swap", () => {
    createRoot(dispose => {
      const [buffer, updateBuffer] = createDoubleBuffer(() => new Uint8Array(2));
      const effectFn = vi.fn();

      createEffect(() => {
        const current = buffer();
        effectFn(current[0]);
      });

      expect(effectFn).toHaveBeenCalledWith(0);

      updateBuffer(back => {
        back[0] = 42;
      });

      expect(effectFn).toHaveBeenCalledWith(42);
      expect(effectFn).toHaveBeenCalledTimes(2);

      dispose();
    });
  });

  it("supports peek() for reading current buffer untracked", () => {
    createRoot(dispose => {
      const [, updateBuffer, peek] = createDoubleBuffer(() => new Float32Array([5, 6]));

      expect(peek()).toEqual(new Float32Array([5, 6]));

      updateBuffer(back => {
        back[0] = 99;
      });

      expect(peek()[0]).toBe(99);
      dispose();
    });
  });
});
