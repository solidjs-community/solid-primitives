import "./setup.js";
import { setup_state } from "./setup.js";

import { createRoot, createEffect, createSignal, flush } from "solid-js";
import { createFullscreen } from "../src/index.js";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  setup_state.current_el = undefined;
  setup_state.current_options = undefined;
});

describe("createFullscreen", () => {
  const ref = document.createElement("div");

  it("will call the fullscreen method", () => {
    let captured: boolean | undefined;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref);

      createEffect(
        () => active(),
        value => {
          captured = value;
        },
      );

      return dispose;
    });

    // flush() drives all effect compute/effect phases to stable state
    flush();
    expect(captured).toEqual(true);

    dispose();
  });

  it("will exit fullscreen on reactive change", () => {
    const [fs, setFs] = createSignal(true);
    let captured: boolean | undefined;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref, fs);

      createEffect(
        () => active(),
        value => {
          captured = value;
        },
      );

      return dispose;
    });

    flush();
    expect(captured).toEqual(true);

    setFs(false);
    flush();
    expect(captured).toEqual(false);

    dispose();
  });

  it("will open fullscreen with options", () => {
    const options: FullscreenOptions = { navigationUI: "hide" };
    let captured: boolean | undefined;

    const dispose = createRoot(dispose => {
      const active = createFullscreen(ref, undefined, options);

      createEffect(
        () => active(),
        value => {
          captured = value;
        },
      );

      return dispose;
    });

    flush();
    expect(captured).toEqual(true);
    expect(setup_state.current_options).toBe(options);

    dispose();
  });
});
