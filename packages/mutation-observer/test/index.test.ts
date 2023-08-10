import { MutationObserver, getLastInstance, instances } from "./setup.js";
import { createMutationObserver, mutationObserver } from "../src/index.js";
import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";

describe("mutation-observer", () => {
  const config = { childList: true },
    parent = document.createElement("div"),
    parent1 = document.createElement("div"),
    parent2 = document.createElement("div"),
    parent3 = document.createElement("div");

  it("returns correct values", () =>
    createRoot(dispose => {
      const [add, { start, stop, instance, isSupported }] = createMutationObserver(
        parent,
        config,
        _ => {},
      );

      expect(add).toBeInstanceOf(Function);
      expect(start).toBeInstanceOf(Function);
      expect(stop).toBeInstanceOf(Function);
      expect(instance).toBeInstanceOf(MutationObserver);
      expect([true, false]).toContain(isSupported);

      dispose();
    }));

  it("creates a new MutationObserver instance", () =>
    createRoot(dispose => {
      const prevLength = instances.length;
      const [, { instance }] = createMutationObserver(parent, config, _ => {});

      expect(instances.length).toBe(prevLength + 1);
      expect(instance).toBe(instances[prevLength]);

      dispose();
    }));

  it("single initial element is observed", () =>
    createRoot(dispose => {
      const [, { instance, start, stop }] = createMutationObserver(parent, config, _ => {});
      start();

      expect((instance as MutationObserver).elements[0]).toEqual([parent, config]);

      stop();
      expect((instance as MutationObserver).elements).toHaveLength(0);

      dispose();
    }));

  it("initial elements are being observed", () =>
    createRoot(dispose => {
      const [, { instance, start, stop }] = createMutationObserver(
        [parent, parent1, parent2],
        config,
        _ => {},
      );
      start();

      expect((instance as MutationObserver).elements).toEqual([
        [parent, config],
        [parent1, config],
        [parent2, config],
      ]);

      stop();
      expect((instance as MutationObserver).elements).toHaveLength(0);

      dispose();
    }));

  it("initial elements with individual configs", () =>
    createRoot(dispose => {
      const config1 = {},
        config2 = { attributes: true };

      const [, { instance, start, stop }] = createMutationObserver(
        [
          [parent, config],
          [parent1, config1],
          [parent2, config2],
        ],
        _ => {},
      );
      start();

      expect((instance as MutationObserver).elements).toEqual([
        [parent, config],
        [parent1, config1],
        [parent2, config2],
      ]);

      stop();
      expect((instance as MutationObserver).elements).toHaveLength(0);

      dispose();
    }));

  it("observe method", () =>
    createRoot(dispose => {
      const config1 = {},
        config2 = { attributes: true };

      const [add, { instance, start, stop }] = createMutationObserver(parent, config, _ => {});
      start();
      expect((instance as MutationObserver).elements[0]).toEqual([parent, config]);

      add(parent1, config1);
      expect((instance as MutationObserver).elements[1]).toEqual([parent1, config1]);

      add(parent2);
      expect((instance as MutationObserver).elements[2]).toEqual([parent2, config]);

      add(parent3, () => config2);
      expect((instance as MutationObserver).elements[3]).toEqual([parent3, config2]);

      stop();
      expect((instance as MutationObserver).elements).toHaveLength(0);

      dispose();
    }));

  it("standalone mutationObserver directive", () =>
    createRoot(dispose => {
      mutationObserver(parent, () => [config, () => {}]);

      expect(getLastInstance()!.elements).toEqual([[parent, config]]);

      dispose();
    }));

  it("fire mutation events", async () => {
    let count = 0;

    const dispose = createRoot(dispose => {
      const [, { start }] = createMutationObserver(parent, config, _ => {
        count++;
      });
      start();

      return dispose;
    });

    getLastInstance()!.__simulateMutation();

    await Promise.resolve();
    expect(count).toBe(1);

    dispose();
  });

  it("stop firing on stop", async () => {
    let count = 0;

    const { start, stop, dispose } = createRoot(dispose => {
      const [, { start, stop }] = createMutationObserver(parent, config, _ => {
        count++;
      });

      return { start, stop, dispose };
    });

    start();

    getLastInstance()!.__simulateMutation();
    await Promise.resolve();
    expect(count).toBe(1);

    stop();

    getLastInstance()!.__simulateMutation();
    await Promise.resolve();
    expect(count).toBe(1);

    dispose();
  });

  it("stop firing on dispose", async () => {
    let count = 0;

    const { start, dispose } = createRoot(dispose => {
      const [, { start }] = createMutationObserver(parent, config, _ => {
        count++;
      });

      return { start, dispose };
    });

    start();
    dispose();

    getLastInstance()!.__simulateMutation();
    await Promise.resolve();
    expect(count).toBe(0);
  });

  it("stop firing on stop while still have pending records", async () => {
    let count = 0;

    const { start, stop, dispose } = createRoot(dispose => {
      const [, { start, stop }] = createMutationObserver(parent, config, _ => {
        count++;
      });

      return { start, stop, dispose };
    });

    start();
    getLastInstance()!.__simulateMutation();
    stop();
    await Promise.resolve();
    expect(count).toBe(0);

    dispose();
  });
});
