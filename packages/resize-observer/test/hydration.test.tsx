import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

describe("createElementSize hydration", () => {
  let result: HydrationRoundTripResult | undefined;
  const targets = new Set<Element>();
  const disconnect = vi.fn(() => targets.clear());

  beforeEach(() => {
    targets.clear();
    disconnect.mockClear();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(target: Element) {
          targets.add(target);
        }
        unobserve(target: Element) {
          targets.delete(target);
        }
        disconnect = disconnect;
      },
    );
  });

  afterEach(() => {
    result?.cleanup();
    result = undefined;
    vi.unstubAllGlobals();
  });

  it.each(["accessor", "element"])(
    "hydrates the %s target without replacing server nodes",
    async path => {
      result = await renderHydrationRoundTrip(
        `
import { createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { createElementSize } from "@solid-primitives/resize-observer";

export default function App() {
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const size = createElementSize(${path === "accessor" ? "target" : 'isServer ? undefined as any : document.getElementById("measured")!'});
  return <><div id="measured" ref={setTarget}>Width: </div><span>{size.width ?? "waiting"}</span><p>after size</p></>;
}
`,
        import.meta.dirname,
      );
      expect(result.html).toContain("waiting");
      expect(result.consoleMessages).toEqual([]);
      expect(result.container.childNodes).toHaveLength(result.serverNodes.length);
      result.serverNodes.forEach((node, index) => {
        expect(result!.container.childNodes[index]).toBe(node);
        expect(node.parentNode).toBe(result!.container);
      });
      expect(result.container.querySelectorAll("#measured")).toHaveLength(1);
      expect(targets.size).toBe(1);
      expect(targets.values().next().value).toBe(result.container.querySelector("#measured"));
      expect(result.container.querySelector("p")?.textContent).toBe("after size");
      if (path === "accessor")
        expect(result.container.querySelector("span")?.textContent).toBe("0");
      result.cleanup();
      result = undefined;
      expect(targets.size).toBe(0);
      expect(disconnect).toHaveBeenCalledOnce();
    },
  );
});
