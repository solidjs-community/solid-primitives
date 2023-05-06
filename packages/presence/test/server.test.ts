import { describe, test, expect } from "vitest";
import { createPresence } from "../src";
import { createSignal } from "solid-js";

describe("on server", () => {
  test("createPresence initializes requested state as expected", () => {
    const [shouldRender] = createSignal(true);
    const first = createPresence(shouldRender, { transitionDuration: 50, initialEnter: true });
    expect(first.isAnimating()).toBe(true);
    expect(first.isEntering()).toBe(true);
    expect(first.isExiting()).toBe(false);
    expect(first.isMounted()).toBe(true);
    expect(first.isVisible()).toBe(false);

    const [shouldNotRender] = createSignal(false);
    const second = createPresence(shouldNotRender, { transitionDuration: 50 });
    expect(second.isAnimating()).toBe(false);
    expect(second.isEntering()).toBe(false);
    expect(second.isExiting()).toBe(false);
    expect(second.isMounted()).toBe(false);
    expect(second.isVisible()).toBe(false);
  });

  test("createPresence initializes requested switching state as expected", () => {
    const [data] = createSignal("foo");
    const first = createPresence(data, { transitionDuration: 50, initialEnter: true });
    expect(first.mountedItem()).toBe("foo");
    expect(first.isAnimating()).toBe(true);
    expect(first.isEntering()).toBe(true);
    expect(first.isExiting()).toBe(false);
    expect(first.isMounted()).toBe(true);
    expect(first.isVisible()).toBe(false);

    const [noData] = createSignal();
    const second = createPresence(noData, { transitionDuration: 50 });
    expect(second.mountedItem()).toBe(undefined);
    expect(second.isAnimating()).toBe(false);
    expect(second.isEntering()).toBe(false);
    expect(second.isExiting()).toBe(false);
    expect(second.isMounted()).toBe(false);
    expect(second.isVisible()).toBe(false);
  });
});
