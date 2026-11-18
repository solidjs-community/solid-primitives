import assert from "node:assert/strict";
import { test } from "node:test";
import { createRoot } from "solid-js";
import { isServer } from "@solidjs/web";
import { getProjectionTrace } from "solid-js/internal";
import { createReactiveWeakMap } from "../../src/weak.ts";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

async function collectUntil(check: () => boolean) {
  const deadline = Date.now() + 3000;
  while (!check()) {
    assert.ok(Date.now() < deadline, "finalizer did not queue the expected slot");
    await new Promise<void>(resolve =>
      setTimeout(() => {
        global.gc!();
        resolve();
      }, 0),
    );
  }
}

// Keep the key out of the generator's suspended lexical environment.
function insert(draft: WeakMap<object, unknown>) {
  const key = {};
  draft.set(key, { key });
}

for (const optimistic of [false, true]) {
  test(`server streams acknowledge finalized slots on each successful commit, optimistic=${optimistic}`, async () => {
    assert.equal(isServer, true);
    assert.equal(typeof global.gc, "function");
    const gates = Array.from({ length: 4 }, deferred);
    let stop = false;
    let dispose!: () => void;
    const map = createRoot(d => {
      dispose = d;
      return createReactiveWeakMap<object, unknown>(
        async function* (draft) {
          for (const gate of gates) {
            if (stop) return;
            insert(draft);
            yield;
            await gate.promise;
          }
        },
        { optimistic },
      );
    });
    const { state, slots } = (map as any).data;
    const iterator = getProjectionTrace(state)!.subscribe()[Symbol.asyncIterator]();
    try {
      for (let i = 0; i < gates.length; i++) {
        assert.equal((await iterator.next()).done, false);
        const metadata = Object.keys(state).filter(k => k.startsWith("k:"));
        assert.equal(metadata.length, 1, "previous committed cleanup must remove metadata");
        assert.equal(slots.dead.length, 0, "successful server cleanup must retire queued IDs");
        const slot = metadata[0]!.slice(2);
        await collectUntil(() => slots.dead.includes(slot));
        gates[i]!.resolve();
      }
      // A terminal cleanup-only value publishes deletion of the final slot.
      assert.equal((await iterator.next()).done, false);
      assert.equal(Object.keys(state).filter(k => k.startsWith("k:")).length, 0);
      assert.equal(slots.dead.length, 0);
      assert.equal((await iterator.next()).done, true);
    } finally {
      stop = true;
      for (const gate of gates) gate.resolve();
      await iterator.return?.();
      dispose();
    }
  });

  for (const replacement of [false, true])
    test(`server failed first pulls retain cleanup IDs, optimistic=${optimistic}, replacement=${replacement}`, async () => {
      const gate = deferred();
      const error = new Error("first commit failed");
      let dispose!: () => void;
      const map = createRoot(d => {
        dispose = d;
        const key = {};
        return createReactiveWeakMap<object, unknown>(
          async function* () {
            await gate.promise;
            if (!replacement) throw error;
            yield {
              [Symbol.iterator](): Iterator<readonly [object, unknown]> {
                throw error;
              },
            };
          },
          { optimistic, loadingValue: [[key, 1]] },
        );
      });
      const { state, slots } = (map as any).data;
      const iterator = getProjectionTrace(state)!.subscribe()[Symbol.asyncIterator]();
      try {
        await collectUntil(() => slots.dead.length > 0);
        gate.resolve();
        await assert.rejects(iterator.next(), error);
        assert.ok(slots.dead.length > 0, "a failed first commit must not acknowledge cleanup");
      } finally {
        gate.resolve();
        await iterator.return?.();
        dispose();
      }
    });
}
