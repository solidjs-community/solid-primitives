import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createPresenceSwitch } from "../src";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// The state transitions often take an extra ~20ms to changeover
// So 50 is added onto wait times for safety
const transitionTimeOffset = 50;
type Data = "foo" | "bar" | "baz" | undefined;

describe("createPresenceSwitch", () => {
  it("initially identifies as not mounted if the initial data is undefined", () =>
    createRoot(dispose => {
      const [data] = createSignal<Data>();
      const { mountedItem, isMounted } = createPresenceSwitch(data, {
        transitionDuration: 50,
      });
      expect(mountedItem()).toBe(undefined);
      expect(isMounted()).toBe(false);
      dispose();
    }));

  it("initially identifies as mounted if the initial data is defined", () =>
    createRoot(dispose => {
      const [data] = createSignal<Data>("foo");
      const { mountedItem, isMounted } = createPresenceSwitch(data, {
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
      const { mountedItem, isAnimating } = createPresenceSwitch(data, {
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
      const { mountedItem, isAnimating, isEntering, isExiting } = createPresenceSwitch(data, {
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
