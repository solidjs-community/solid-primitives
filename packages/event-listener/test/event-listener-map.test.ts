import { dispatchFakeEvent } from "./setup";
import { describe, test, expect } from "vitest";
import { createRoot, onMount } from "solid-js";
import { createEventListenerMap } from "../src";

describe("createEventListenerMap", () => {
  test("will listen to multiple events", () =>
    createRoot(dispose => {
      const testEvent = new Event("map_0");
      const testEvent1 = new Event("map_1");
      let captured: any;
      let captured1: any;
      createEventListenerMap(window, {
        map_0: e => (captured = e),
        map_1: e => (captured1 = e),
      });

      dispatchFakeEvent("map_0", testEvent);
      dispatchFakeEvent("map_1", testEvent1);

      expect(captured).toBe(testEvent);
      expect(captured1).toBe(testEvent1);
      dispose();
    }));

  test("target accessor", () =>
    createRoot(dispose => {
      const testEvent = new Event("map_0");
      const testEvent1 = new Event("map_1");
      let captured: any;
      let captured1: any;
      createEventListenerMap(() => window, {
        map_0: e => (captured = e),
        map_1: e => (captured1 = e),
      });

      onMount(() => {
        dispatchFakeEvent("map_0", testEvent);
        dispatchFakeEvent("map_1", testEvent1);

        expect(captured).toBe(testEvent);
        expect(captured1).toBe(testEvent1);
        dispose();
      });
    }));

  test("stops listeneing after disposing of root", () =>
    createRoot(dispose => {
      const testEvent = new Event("map_0");
      const testEvent1 = new Event("map_1");
      let captured: any;
      let captured1: any;
      createEventListenerMap(window, {
        map_0: e => (captured = e),
        map_1: e => (captured1 = e),
      });

      onMount(() => {
        dispose();

        dispatchFakeEvent("map_0", testEvent);
        dispatchFakeEvent("map_1", testEvent1);

        expect(captured).toBe(undefined);
        expect(captured1).toBe(undefined);
      });
    }));

  test("target can be a signal", () =>
    createRoot(dispose => {
      const testEvent = new Event("map_0");
      let captured: any;
      createEventListenerMap<{ map_0: Event }>(() => window, {
        map_0: e => (captured = e),
      });

      onMount(() => {
        dispatchFakeEvent("map_0", testEvent);
        expect(captured).toBe(testEvent);
        dispose();
      });
    }));
});
