import { setup_state } from "./setup.js";

import { createRoot, createEffect, createSignal } from "solid-js";
import { createFullscreen } from "../src/index.js";
import { describe, it, expect } from "vitest";

describe("createFullscreen", () => {
  const ref = document.createElement("div");

  it("will call the fullscreen method", async () => {
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref);

      createEffect(() => {
        captured = active();
      });

      return dispose;
    });

    expect(captured).toEqual(false);

    await Promise.resolve();
    expect(captured).toEqual(true);

    dispose();
  });

  it("will exit fullscreen on reactive change", async () => {
    const [fs, setFs] = createSignal(true);
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref, fs);

      createEffect(() => {
        captured = active();
      });

      return dispose;
    });

    expect(captured).toEqual(false);

    await Promise.resolve();
    expect(captured).toEqual(true);

    setFs(false);
    expect(captured).toEqual(false);

    dispose();
  });

  it("will open fullscreen with options", async () => {
    const options: FullscreenOptions = { navigationUI: "hide" };
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref, undefined, options);

      createEffect(() => {
        captured = active();
      });

      return dispose;
    });

    expect(captured).toEqual(false);

    await Promise.resolve();
    expect(captured).toEqual(true);
    expect(setup_state.current_options).toBe(options);

    dispose();
  });
});
