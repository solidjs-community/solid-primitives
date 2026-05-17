import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createMutationObserver, mutationObserver } from "../src/index.js";

describe("SSR", () => {
  it("createMutationObserver is a noop on the server", () =>
    createRoot(dispose => {
      const fakeNode = {} as Node;
      const [add, { start, stop, instance, isSupported }] = createMutationObserver(
        fakeNode,
        { childList: true },
        _ => {},
      );

      expect(isSupported).toBe(false);
      expect(instance).toBeUndefined();
      expect(() => start()).not.toThrow();
      expect(() => stop()).not.toThrow();
      expect(() => add(fakeNode)).not.toThrow();

      dispose();
    }));

  it("mutationObserver directive is a noop on the server", () =>
    createRoot(dispose => {
      const fakeEl = {} as Element;
      expect(() => mutationObserver(fakeEl, () => [{ childList: true }, _ => {}])).not.toThrow();
      dispose();
    }));
});
