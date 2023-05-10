import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createPresence } from "../src";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// The state transitions often take an extra ~20ms to changeover
// because the transition currently has an awaited animation frame
// which Vitest seems to just assume is (1 / 60Hz) seconds
// So 50 is added onto wait times for safety
const transitionTimeOffset = 50;

describe("createPresence", () => {
  it("initially marks the element's mounted & visibility status based on the initial state", () =>
    createRoot(dispose => {
      const [shouldRender] = createSignal(true);
      const first = createPresence(shouldRender, {
        transitionDuration: 50,
      });
      expect(first.isMounted()).toBe(true);
      expect(first.isVisible()).toBe(true);

      const [shouldNotRender] = createSignal(false);
      const second = createPresence(shouldNotRender, {
        transitionDuration: 50,
      });
      expect(second.isMounted()).toBe(false);
      expect(second.isVisible()).toBe(false);
      dispose();
    }));

  it("initially is never animating by default", () =>
    createRoot(dispose => {
      const [shouldRender] = createSignal(true);
      const first = createPresence(shouldRender, {
        transitionDuration: 50,
      });
      expect(first.isAnimating()).toBe(false);

      const [shouldNotRender] = createSignal(false);
      const second = createPresence(shouldNotRender, {
        transitionDuration: 50,
      });
      expect(second.isAnimating()).toBe(false);
      dispose();
    }));

  it("is animating if the initial render state is true and the initialEnter option is provided as true", () =>
    createRoot(dispose => {
      const [shouldRender] = createSignal(true);
      const first = createPresence(shouldRender, {
        transitionDuration: 50,
        initialEnter: true,
      });
      expect(first.isAnimating()).toBe(true);

      const [shouldNotRender] = createSignal(false);
      const second = createPresence(shouldNotRender, {
        transitionDuration: 50,
        initialEnter: true,
      });
      // not animating because it doesn't exist initially
      expect(second.isAnimating()).toBe(false);
      dispose();
    }));

  it("is in a mounted & animating state for the transitionDuration and then it is only in a mounted state", () =>
    createRoot(async dispose => {
      const [shouldRender, setShouldRender] = createSignal(false);
      const transitionDuration = 50;
      const { isMounted, isAnimating } = createPresence(shouldRender, {
        transitionDuration,
      });
      expect(isMounted()).toBe(false);
      expect(isAnimating()).toBe(false);
      setShouldRender(true);
      await sleep(0);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(true);
      await sleep(transitionDuration + transitionTimeOffset);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(false);
      setShouldRender(false);
      await sleep(0);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(true);
      await sleep(transitionDuration + transitionTimeOffset);
      expect(isMounted()).toBe(false);
      expect(isAnimating()).toBe(false);
      dispose();
    }));

  it("swaps between a mounted & unmounted state based on unique enter & exit transition states", () =>
    createRoot(async dispose => {
      const [shouldRender, setShouldRender] = createSignal(false);
      // using longer durations to ensure that the transitionTimeOffset
      // is doesn't play into the test timings
      const enterDuration = 300;
      const exitDuration = 150;
      const { isMounted, isAnimating } = createPresence(shouldRender, {
        enterDuration,
        exitDuration,
      });
      expect(isMounted()).toBe(false);
      expect(isAnimating()).toBe(false);
      setShouldRender(true);
      await sleep(0);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(true);
      // ensure that we're not done animating after the shorter time
      await sleep(exitDuration + transitionTimeOffset);
      expect(isAnimating()).toBe(true);
      await sleep(exitDuration + transitionTimeOffset);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(false);
      setShouldRender(false);
      await sleep(0);
      expect(isMounted()).toBe(true);
      expect(isAnimating()).toBe(true);
      await sleep(exitDuration + transitionTimeOffset);
      expect(isMounted()).toBe(false);
      expect(isAnimating()).toBe(false);
      dispose();
    }));

  // data switching tests

  type Data = "foo" | "bar" | "baz" | undefined;

  it("initially identifies as not mounted if the initial data is undefined", () =>
    createRoot(dispose => {
      const [data] = createSignal<Data>();
      const { mountedItem, isMounted } = createPresence(data, {
        transitionDuration: 50,
      });
      expect(mountedItem()).toBe(undefined);
      expect(isMounted()).toBe(false);
      dispose();
    }));

  it("initially identifies as mounted if the initial data is defined", () =>
    createRoot(dispose => {
      const [data] = createSignal<Data>("foo");
      const { mountedItem, isMounted } = createPresence(data, {
        transitionDuration: 50,
      });
      expect(mountedItem()).toBe("foo");
      expect(isMounted()).toBe(true);
      dispose();
    }));

  it("initially animates if the initial data is defined", () =>
    createRoot(async dispose => {
      const [data] = createSignal<Data>("foo");
      const transitionDuration = 50;
      const { mountedItem, isAnimating } = createPresence(data, {
        transitionDuration,
        initialEnter: true,
      });
      expect(mountedItem()).toBe("foo");
      expect(isAnimating()).toBe(true);
      await sleep(transitionDuration + transitionTimeOffset);
      expect(isAnimating()).toBe(false);
      dispose();
    }));

  it("initially exchanges the data over the transition time", () =>
    createRoot(async dispose => {
      const [data, setData] = createSignal<Data>("foo");
      const transitionDuration = 150;
      const { mountedItem, isAnimating, isEntering, isExiting } = createPresence(data, {
        transitionDuration,
      });
      expect(isAnimating()).toBe(false);
      setData("bar");
      await sleep(0);
      expect(isAnimating()).toBe(true);
      expect(mountedItem()).toBe("foo");
      expect(isExiting()).toBe(true);
      expect(isEntering()).toBe(false);
      await sleep(transitionDuration + transitionTimeOffset);
      expect(isAnimating()).toBe(true);
      expect(mountedItem()).toBe("bar");
      expect(isEntering()).toBe(true);
      expect(isExiting()).toBe(false);
      await sleep(transitionDuration + transitionTimeOffset);
      expect(isAnimating()).toBe(false);
      expect(isEntering()).toBe(false);
      expect(isExiting()).toBe(false);
      dispose();
    }));
});
