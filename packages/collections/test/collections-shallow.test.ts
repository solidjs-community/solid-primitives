import { describe, expect, it } from "vitest";
import { createRoot, createStore, createOptimisticStore, flush } from "solid-js";

const tick = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
  flush();
};
describe("shallow store integration", () => {
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
});
