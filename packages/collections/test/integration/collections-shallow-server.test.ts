import { describe, expect, it } from "vitest";
import { createRoot, createStore } from "solid-js";
import { getProjectionTrace } from "solid-js/internal";

const tick = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
};

describe("server shallow store integration", () => {
  it("SSR shallow draft reads return raw leaves instead of deep proxies", () => {
    const value = Object.freeze({ key: {} });
    createRoot(() => {
      const [state] = createStore(
        (draft: { value: typeof value }) => {
          expect(draft.value).toBe(value);
          expect(draft.value.key).toBe(value.key);
        },
        { value },
        { shallow: true },
      );
      expect(state.value).toBe(value);
    });
  });

  it("SSR stream snapshots preserve raw identity and the first visible answer", async () => {
    const key = {},
      value = Object.freeze({ key, time: new Date(0), n: NaN });
    const replacement = Object.freeze({ key, time: new Date(1), n: NaN });
    let dispose!: () => void;
    const [state] = createRoot((d: () => void) => {
      dispose = d;
      return createStore(
        async function* (draft: { value: typeof value | undefined }) {
          draft.value = value;
          yield;
          draft.value = replacement;
          yield;
        },
        { value: undefined },
        { shallow: true },
      );
    });
    try {
      await tick();
      expect(state.value).toBe(value);
      const iterator = getProjectionTrace(state)!.subscribe()[Symbol.asyncIterator]();
      const first = await iterator.next();
      expect(first.value.value).toBe(value);
      const next = await iterator.next();
      expect(next.value).toEqual([[["value"], replacement]]);
      expect(state.value).toBe(value);
      await iterator.return?.();
    } finally {
      dispose();
    }
  });
});
