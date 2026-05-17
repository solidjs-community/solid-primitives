import "./setup.js";
import { setup_state } from "./setup.js";

import { createRoot, flush } from "solid-js";
import { makeFullscreen, createFullscreen, fullscreen } from "../src/index.js";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  setup_state.current_el = undefined;
  setup_state.current_options = undefined;
});

describe("makeFullscreen", () => {
  const ref = document.createElement("div");

  it("enter() calls requestFullscreen on the element", async () => {
    const [enter] = makeFullscreen(ref);
    await enter();
    expect(setup_state.current_el).toBe(ref);
  });

  it("exit() calls document.exitFullscreen", async () => {
    const [enter, exit] = makeFullscreen(ref);
    await enter();
    await exit();
    expect(setup_state.current_el).toBeUndefined();
  });

  it("enter() uses creation-time options by default", async () => {
    const options: FullscreenOptions = { navigationUI: "hide" };
    const [enter] = makeFullscreen(ref, options);
    await enter();
    expect(setup_state.current_options).toBe(options);
  });

  it("enter() call-time options override creation-time options", async () => {
    const creation: FullscreenOptions = { navigationUI: "hide" };
    const callTime: FullscreenOptions = { navigationUI: "show" };
    const [enter] = makeFullscreen(ref, creation);
    await enter(callTime);
    expect(setup_state.current_options).toBe(callTime);
  });
});

describe("createFullscreen", () => {
  const ref = document.createElement("div");

  it("isActive starts false when element is not fullscreen", () => {
    createRoot(dispose => {
      const { isActive } = createFullscreen(ref);
      expect(isActive()).toBe(false);
      dispose();
    });
  });

  it("isActive starts true when element is already fullscreen", () => {
    setup_state.current_el = ref;

    createRoot(dispose => {
      const { isActive } = createFullscreen(ref);
      expect(isActive()).toBe(true);
      dispose();
    });
  });

  it("enter() enters fullscreen and isActive becomes true", async () => {
    await createRoot(async dispose => {
      const { enter, isActive } = createFullscreen(ref);

      await enter();
      flush();
      expect(isActive()).toBe(true);

      dispose();
    });
  });

  it("exit() leaves fullscreen and isActive becomes false", async () => {
    await createRoot(async dispose => {
      const { enter, exit, isActive } = createFullscreen(ref);

      await enter();
      flush();
      expect(isActive()).toBe(true);

      await exit();
      flush();
      expect(isActive()).toBe(false);

      dispose();
    });
  });

  it("isActive updates when OS dismisses fullscreen", async () => {
    await createRoot(async dispose => {
      const { enter, isActive } = createFullscreen(ref);

      await enter();
      flush();
      expect(isActive()).toBe(true);

      setup_state.current_el = undefined;
      document.dispatchEvent(new Event("fullscreenchange"));
      flush();
      expect(isActive()).toBe(false);

      dispose();
    });
  });

  it("exits fullscreen on cleanup by default", async () => {
    let dispose!: () => void;
    await createRoot(async d => {
      dispose = d;
      const { enter } = createFullscreen(ref);
      await enter();
      flush();
    });
    dispose();
    expect(setup_state.current_el).toBeUndefined();
  });

  it("does not exit fullscreen on cleanup when exitOnCleanup is false", async () => {
    let dispose!: () => void;
    await createRoot(async d => {
      dispose = d;
      const { enter } = createFullscreen(ref, { exitOnCleanup: false });
      await enter();
      flush();
    });
    dispose();
    expect(setup_state.current_el).toBe(ref);

    // reset state
    setup_state.current_el = undefined;
  });

  it("enter() passes options to requestFullscreen", async () => {
    await createRoot(async dispose => {
      const { enter } = createFullscreen(ref, { navigationUI: "hide" });
      await enter();
      expect(setup_state.current_options).toStrictEqual({ navigationUI: "hide" });
      dispose();
    });
  });
});

describe("fullscreen (directive)", () => {
  const el = document.createElement("div");

  it("clicking the element enters fullscreen", () => {
    createRoot(dispose => {
      const attach = fullscreen();
      attach(el);
      el.click();
      expect(setup_state.current_el).toBe(el);
      dispose();
    });
  });

  it("clicking again while fullscreen exits", () => {
    createRoot(dispose => {
      const attach = fullscreen();
      attach(el);
      el.click();
      expect(setup_state.current_el).toBe(el);
      el.click();
      expect(setup_state.current_el).toBeUndefined();
      dispose();
    });
  });

  it("passes options to requestFullscreen", () => {
    const options: FullscreenOptions = { navigationUI: "hide" };

    createRoot(dispose => {
      const attach = fullscreen(options);
      attach(el);
      el.click();
      expect(setup_state.current_options).toBe(options);
      dispose();
    });
  });

  it("removes click listener on cleanup", () => {
    let dispose!: () => void;
    createRoot(d => {
      dispose = d;
      const attach = fullscreen();
      attach(el);
    });
    dispose();
    el.click();
    expect(setup_state.current_el).toBeUndefined();
  });
});
