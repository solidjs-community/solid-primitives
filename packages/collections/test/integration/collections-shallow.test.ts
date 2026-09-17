import { describe, expect, it } from "vitest";
import { createRoot, createStore, createOptimisticStore, flush } from "solid-js";
import * as server from "collection-test-server";
import { getProjectionTrace } from "collection-test-server-signals";

const tick = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
  flush();
};
describe("shallow store prerequisites for collection hydration", () => {
  for (const optimistic of [false, true]) {
    it(`loading drafts retain raw leaf identity, optimistic=${optimistic}`, async () => {
      const original = Object.freeze({ id: 1 });
      const replacement = Object.freeze({ id: 2 });
      let release!: () => void;
      const gate = new Promise<void>(r => {
        release = r;
      });
      let seen: unknown;
      let dispose!: () => void;
      const [state] = createRoot(d => {
        dispose = d;
        return (optimistic ? createOptimisticStore : createStore)(
          async draft => {
            seen = draft.value;
            draft.value = replacement;
            await gate;
          },
          { value: original },
          { shallow: true, seedLoadingValue: true },
        );
      });
      try {
        expect(seen).toBe(original);
        expect(state.value).toBe(original);
        release();
        await tick();
        expect(state.value).toBe(replacement);
      } finally {
        release();
        dispose();
      }
    });
  }

  it("SSR shallow draft reads return raw leaves instead of deep proxies", () => {
    const value = Object.freeze({ key: {} });
    server.createRoot(() => {
      const [state] = server.createStore(
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
    const [state] = server.createRoot((d: () => void) => {
      dispose = d;
      return server.createStore(
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
