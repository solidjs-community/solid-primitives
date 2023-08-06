import { describe, test, expect, vi } from "vitest";
import { createMemo, createRoot, onCleanup, untrack } from "solid-js";
import { createMachine } from "../src";

describe("createMachine", () => {
  test("switches state", () =>
    createRoot(() => {
      const state = createMachine<{
        idle: { value: "foo" };
        loading: { value: "bar" };
      }>({
        initial: "idle",
        states: {
          idle: () => "foo",
          loading: () => "bar",
        },
      });
      const memo = createMemo(() => {
        // track only the signal
        const v = state();
        return untrack(() => ({ ...v }));
      });

      expect(state.type).toBe("idle");
      expect(state.value).toBe("foo");
      expect(state.type).toBe(memo().type);
      expect(state.value).toBe(memo().value);

      // @ts-expect-error need to check if state is idle
      state.to.loading();

      expect(state.type).toBe("loading");
      expect(state.value).toBe("bar");
      expect(state.type).toBe(memo().type);
      expect(state.value).toBe(memo().value);

      if (state.type === "loading") {
        // @ts-expect-error can't go from loading to loading
        state.to.loading();

        state.to.idle();
      }

      expect(state.type).toBe("idle");
      expect(state.value).toBe("foo");
      expect(state.type).toBe(memo().type);
      expect(state.value).toBe(memo().value);
    }));

  test("switches state with input", () => {
    createRoot(() => {
      const state = createMachine<{
        idle: { input: string; value: any };
        loading: { input: number; value: any };
      }>({
        initial: {
          type: "idle",
          input: "foo",
        },
        states: {
          idle: i => i,
          loading: i => i,
        },
      });

      expect(state.type).toBe("idle");
      expect(state.value).toBe("foo");

      if (state.type === "idle") {
        state.to.loading(1);
      }

      expect(state.type).toBe("loading");
      expect(state.value).toBe(1);

      if (state.type === "loading") {
        state.to.idle("a");
        state.to.idle("b");
      }

      expect(state.type).toBe("idle");
      expect(state.value).toBe("a");
    });
  });

  test("switches state from the callback", () => {
    createRoot(() => {
      const state = createMachine<{
        idle: { value: "foo" };
        loading: { value: "bar" };
      }>({
        initial: "idle",
        states: {
          idle: (input, to) => {
            to.loading();
            return "foo";
          },
          loading: () => "bar",
        },
      });

      expect(state.type).toBe("loading");
      expect(state.value).toBe("bar");

      if (state.type === "loading") {
        state.to.idle();
      }

      expect(state.type).toBe("loading");
      expect(state.value).toBe("bar");
    });
  });

  test("cleanup on switch", () => {
    createRoot(dispose => {
      const cleanups = {
        idle: vi.fn(),
        loading: vi.fn(),
      };

      const state = createMachine<{
        idle: {};
        loading: {};
      }>({
        initial: "idle",
        states: {
          idle: () => {
            onCleanup(cleanups.idle);
          },
          loading: () => {
            onCleanup(cleanups.loading);
          },
        },
      });

      expect(state.type).toBe("idle");
      expect(cleanups.idle).not.toHaveBeenCalled();
      expect(cleanups.loading).not.toHaveBeenCalled();

      if (state.type === "idle") {
        state.to.loading();
      }

      expect(state.type).toBe("loading");
      expect(cleanups.idle).toHaveBeenCalledOnce();
      expect(cleanups.loading).not.toHaveBeenCalled();

      if (state.type === "loading") {
        state.to.idle();
      }

      expect(state.type).toBe("idle");
      expect(cleanups.idle).toHaveBeenCalledOnce();
      expect(cleanups.loading).toHaveBeenCalledOnce();

      dispose();

      expect(cleanups.idle).toHaveBeenCalledTimes(2);
      expect(cleanups.loading).toHaveBeenCalledTimes(1);
    });
  });
});
