import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  action,
  createEffect,
  createRoot,
  createSignal,
  flush,
  isPending,
  latest,
} from "@solidjs/signals";
import { createReactiveWeakMap, createReactiveWeakSet } from "../../../src/weak.js";

const disposers: (() => void)[] = [];
function root<T>(fn: () => T): T {
  return createRoot(dispose => {
    disposers.push(dispose);
    return fn();
  });
}
afterEach(() => {
  while (disposers.length) disposers.pop()!();
  flush();
});
function observe(read: () => unknown) {
  createEffect(read, () => {});
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}
async function tick() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
  flush();
}
async function collect() {
  assert.equal(typeof global.gc, "function", "GC tests require --expose-gc");
  for (let i = 0; i < 12; i++) {
    await new Promise<void>(resolve =>
      setTimeout(() => {
        flush();
        global.gc!();
        resolve();
      }, 0),
    );
  }
}
function inspect(map: object): Record<string, unknown> {
  // Test-only inspection of representation; all runtime imports are public.
  return (map as { data: { state: Record<string, unknown> } }).data.state;
}
function emptyCompute(): void {}
function installValue(write: (value: object) => void): WeakRef<object> {
  const value = { old: true };
  write(value);
  flush();
  return new WeakRef(value);
}

for (const computed of [false, true]) {
  for (const companion of ["ordinary", "latest", "isPending"] as const) {
    for (const operation of ["overwrite", "delete"] as const) {
      test(`${computed ? "computed" : "static"} disposed ${companion} reader releases the old value after ${operation} for a live key`, async () => {
        const key = {};
        const map = root(() =>
          computed
            ? createReactiveWeakMap<object, object>(emptyCompute)
            : createReactiveWeakMap<object, object>(),
        );
        const old = installValue(value => {
          map.set(key, value);
        });
        const disposeReader = createRoot(dispose => {
          const read = () => Boolean(map.get(key));
          observe(() =>
            companion === "latest"
              ? latest(read)
              : companion === "isPending"
                ? isPending(read)
                : read(),
          );
          return dispose;
        });
        flush();
        disposeReader();
        flush();
        if (operation === "overwrite") map.set(key, { next: true });
        else map.delete(key);
        flush();
        await collect();
        assert.equal(old.deref(), undefined);
        assert.equal(map.has(key), operation === "overwrite");
      });
    }
  }
}

function ephemeral(map: WeakMap<object, unknown>, cyclic: boolean) {
  const key = {};
  const value = cyclic ? { key } : 123;
  map.set(key, value);
  flush();
  return { key: new WeakRef(key), value: cyclic ? new WeakRef(value as object) : undefined };
}

for (const optimistic of [false, true]) {
  for (const cyclic of [false, true]) {
    test(`${optimistic ? "optimistic" : "plain"} static map releases ${cyclic ? "value-key cycles" : "primitive-value keys"}`, async () => {
      const fixture = root(() => {
        const key = {};
        const value = cyclic ? { key } : 123;
        return {
          map: createReactiveWeakMap([[key, value]], { optimistic }),
          key: new WeakRef(key),
          value: cyclic ? new WeakRef(value as object) : undefined,
        };
      });
      await collect();
      assert.equal(fixture.key.deref(), undefined);
      assert.equal(fixture.value?.deref(), undefined);
      assert.equal(fixture.map.has({}), false);
    });
  }

  test(`${optimistic ? "optimistic" : "plain"} computed map releases internally generated key while producer lives`, async () => {
    let refs!: { key: WeakRef<object>; value: WeakRef<object> };
    const map = root(() =>
      createReactiveWeakMap<object, object>(
        draft => {
          const key = {};
          const value = { key };
          draft.set(key, value);
          refs = { key: new WeakRef(key), value: new WeakRef(value) };
        },
        { optimistic },
      ),
    );
    assert.equal(map.has({}), false);
    flush();
    await collect();
    assert.equal(refs.key.deref(), undefined);
    assert.equal(refs.value.deref(), undefined);
    assert.equal(map.has({}), false);
  });

  for (const companion of ["ordinary", "isPending", "latest"] as const) {
    test(`${optimistic ? "optimistic" : "plain"} disposed ${companion} readers release keys and values`, async () => {
      const fixture = root(() => {
        const key = {};
        const value = { key };
        const map = createReactiveWeakMap<object, object>([[key, value]], { optimistic });
        const disposeReader = createRoot(dispose => {
          const read = () => map.get(key);
          observe(() => map.has(key));
          observe(() =>
            companion === "isPending"
              ? isPending(read)
              : companion === "latest"
                ? latest(read)
                : read(),
          );
          return dispose;
        });
        flush();
        disposeReader();
        flush();
        return { map, key: new WeakRef(key), value: new WeakRef(value) };
      });
      await collect();
      assert.equal(fixture.key.deref(), undefined);
      assert.equal(fixture.value.deref(), undefined);
      assert.equal(fixture.map.has({}), false);
    });
  }

  test(`${optimistic ? "optimistic" : "plain"} WeakSet does not retain initializer or keys`, async () => {
    const fixture = root(() => {
      const key = {};
      const input = [key];
      return {
        set: createReactiveWeakSet(input, { optimistic }),
        key: new WeakRef(key),
        input: new WeakRef(input),
      };
    });
    await collect();
    assert.equal(fixture.key.deref(), undefined);
    assert.equal(fixture.input.deref(), undefined);
    assert.equal(fixture.set.has({}), false);
  });
}

test("computed reader companions do not retain unreachable keys and values", async () => {
  const fixture = root(() => {
    const key = {};
    const value = { key };
    const map = createReactiveWeakMap<object, object>(emptyCompute);
    map.set(key, value);
    const disposeReader = createRoot(dispose => {
      observe(() => isPending(() => map.get(key)));
      observe(() => latest(() => map.get(key)));
      return dispose;
    });
    flush();
    disposeReader();
    flush();
    return { map, key: new WeakRef(key), value: new WeakRef(value) };
  });
  await collect();
  assert.equal(fixture.key.deref(), undefined);
  assert.equal(fixture.value.deref(), undefined);
  assert.equal(fixture.map.has({}), false);
});

test("values are collectible before metadata cleanup; next ordinary write prunes finalized slots", async () => {
  const map = root(() => createReactiveWeakMap<object, unknown>());
  const refs = ephemeral(map, true);
  const count = () => Object.keys(inspect(map)).filter(key => key.startsWith("k:")).length;
  assert.equal(count(), 1);
  await collect();
  assert.equal(refs.key.deref(), undefined);
  assert.equal(refs.value!.deref(), undefined);
  assert.equal(count(), 1, "a finalizer must only queue maintenance, never invoke the setter");
  const survivor = {};
  map.set(survivor, 1);
  flush();
  assert.equal(count(), 1, "ordinary writes prune finalized metadata before inserting");
  assert.equal(map.get(survivor), 1);
});

test("optimistic action releases its captured key and value after settlement", async () => {
  const map = root(() => createReactiveWeakMap<object, object>(undefined, { optimistic: true }));
  const gate = deferred();
  const fixture = (() => {
    const key = {};
    const value = { key };
    return {
      key: new WeakRef(key),
      value: new WeakRef(value),
      pending: action(function* () {
        map.set(key, value);
        yield gate.promise;
      })(),
    };
  })();
  flush();
  gate.resolve();
  await fixture.pending;
  await tick();
  await collect();
  assert.equal(fixture.key.deref(), undefined);
  assert.equal(fixture.value.deref(), undefined);
  assert.equal(map.has({}), false);
});

test("settled async draft releases ephemeral keys while the computed collection remains live", async () => {
  let refs!: { key: WeakRef<object>; value: WeakRef<object> };
  const gate = deferred();
  const map = root(() =>
    createReactiveWeakMap<object, object>(
      async draft => {
        await gate.promise;
        const key = {};
        const value = { key };
        draft.set(key, value);
        refs = { key: new WeakRef(key), value: new WeakRef(value) };
      },
      { loadingValue: [] },
    ),
  );
  assert.equal(map.has({}), false);
  gate.resolve();
  await tick();
  await collect();
  assert.equal(refs.key.deref(), undefined);
  assert.equal(refs.value.deref(), undefined);
  assert.equal(map.has({}), false);
});

test("pending loading seed releases its initializer and key without waiting for a flight", async () => {
  const gate = deferred();
  // Construct the async callback outside the key's lexical environment.
  const compute = async () => {
    await gate.promise;
  };
  const fixture = root(() => {
    const key = {};
    const value = { key };
    const seed: [object, object][] = [[key, value]];
    return {
      map: createReactiveWeakMap<object, object>(compute, { loadingValue: seed }),
      key: new WeakRef(key),
      value: new WeakRef(value),
      seed: new WeakRef(seed),
    };
  });
  assert.equal(fixture.map.has({}), false);
  await collect();
  assert.equal(fixture.key.deref(), undefined);
  assert.equal(fixture.value.deref(), undefined);
  assert.equal(fixture.seed.deref(), undefined);
  gate.resolve();
  await tick();
});

for (const operation of ["overwrite", "delete"] as const) {
  test(`${operation} releases the obsolete value while the key remains live`, async () => {
    const key = {};
    const map = root(() => createReactiveWeakMap<object, object>());
    const old = (() => {
      const value = { key };
      map.set(key, value);
      flush();
      return new WeakRef(value);
    })();
    if (operation === "overwrite") map.set(key, { next: true });
    else map.delete(key);
    flush();
    await collect();
    assert.equal(old.deref(), undefined);
    assert.equal(map.has(key), operation === "overwrite");
  });
}

test("computed WeakSet releases internally created members after an async commit", async () => {
  let ref!: WeakRef<object>;
  const gate = deferred();
  const set = root(() =>
    createReactiveWeakSet<object>(
      async draft => {
        await gate.promise;
        const key = {};
        draft.add(key);
        ref = new WeakRef(key);
      },
      { loadingValue: [] },
    ),
  );
  assert.equal(set.has({}), false);
  gate.resolve();
  await tick();
  await collect();
  assert.equal(ref.deref(), undefined);
  assert.equal(set.has({}), false);
});

test("async iterable replacement result does not retain its returned entries", async () => {
  let refs!: { key: WeakRef<object>; value: WeakRef<object>; entries: WeakRef<object> };
  const gate = deferred();
  const map = root(() =>
    createReactiveWeakMap<object, object>(
      async () => {
        await gate.promise;
        const key = {};
        const value = { key };
        const entries: [object, object][] = [[key, value]];
        refs = { key: new WeakRef(key), value: new WeakRef(value), entries: new WeakRef(entries) };
        return entries;
      },
      { loadingValue: [] },
    ),
  );
  assert.equal(map.has({}), false);
  gate.resolve();
  await tick();
  await collect();
  assert.equal(refs.key.deref(), undefined);
  assert.equal(refs.value.deref(), undefined);
  assert.equal(refs.entries.deref(), undefined);
  assert.equal(map.has({}), false);
});

test("dependency reruns do not retain internally generated keys from prior synchronous drafts", async () => {
  const refs: WeakRef<object>[] = [];
  const fixture = root(() => {
    const [version, next] = createSignal(0);
    const map = createReactiveWeakMap<object, object>(draft => {
      version();
      const key = {};
      draft.set(key, { key });
      refs.push(new WeakRef(key));
    });
    return { map, next };
  });
  assert.equal(fixture.map.has({}), false);
  flush();
  fixture.next(1);
  flush();
  assert.equal(fixture.map.has({}), false);
  assert.equal(refs.length, 2);
  await collect();
  assert.ok(refs.every(ref => ref.deref() === undefined));
  assert.equal(fixture.map.has({}), false);
});

test("static optimistic maintenance remains committed across later action rollbacks", async () => {
  const fixture = root(() => {
    const key = {};
    return {
      map: createReactiveWeakMap<object, unknown>([[key, { key }]], { optimistic: true }),
      key: new WeakRef(key),
    };
  });
  await collect();
  assert.equal(fixture.key.deref(), undefined);
  const count = () => Object.keys(inspect(fixture.map)).filter(key => key.startsWith("k:")).length;
  assert.equal(count(), 0, "maintenance projection authoritatively prunes finalized seed metadata");
  const gate = deferred();
  const survivor = {};
  const pending = action(function* () {
    fixture.map.set(survivor, 1);
    yield gate.promise;
  })();
  flush();
  assert.equal(count(), 1, "only the optimistic insertion remains visible");
  gate.resolve();
  await pending;
  await tick();
  assert.equal(count(), 0, "rollback cannot restore the pruned metadata");
  const secondGate = deferred();
  const second = action(function* () {
    fixture.map.set(survivor, 2);
    yield secondGate.promise;
  })();
  flush();
  assert.equal(count(), 1);
  secondGate.resolve();
  await second;
  await tick();
  assert.equal(count(), 0);
});

test("static optimistic maintenance during an unrelated action preserves its override", async () => {
  const survivor = {};
  const fixture = root(() => {
    const key = {};
    return {
      map: createReactiveWeakMap<object, unknown>(
        [
          [key, { key }],
          [survivor, 0],
        ],
        { optimistic: true },
      ),
      key: new WeakRef(key),
    };
  });
  const count = () => Object.keys(inspect(fixture.map)).filter(key => key.startsWith("k:")).length;
  const gate = deferred();
  const pending = action(function* () {
    fixture.map.set(survivor, 1);
    yield gate.promise;
  })();
  flush();
  await collect();
  assert.equal(fixture.key.deref(), undefined);
  assert.equal(
    fixture.map.get(survivor),
    1,
    "maintenance must preserve the live action's visible edit",
  );
  gate.resolve();
  await pending;
  await tick();
  assert.equal(fixture.map.get(survivor), 0);
  assert.equal(count(), 1, "after settlement only the live key's metadata remains");
});

test("computed optimistic ordinary writes preserve maintenance IDs for the next authoritative derive", async () => {
  let dead!: WeakRef<object>;
  const survivor = {};
  const fixture = root(() => {
    const [version, next] = createSignal(0);
    const map = createReactiveWeakMap<object, unknown>(
      draft => {
        if (version() === 0) {
          const key = {};
          draft.set(key, { key });
          dead = new WeakRef(key);
        }
      },
      { optimistic: true },
    );
    return { map, next };
  });
  assert.equal(fixture.map.has({}), false);
  flush();
  await collect();
  assert.equal(dead.deref(), undefined);
  const count = () => Object.keys(inspect(fixture.map)).filter(key => key.startsWith("k:")).length;
  assert.equal(count(), 1);
  const gate = deferred();
  const pending = action(function* () {
    fixture.map.set(survivor, 1);
    yield gate.promise;
  })();
  flush();
  assert.equal(count(), 2, "ordinary optimistic edits defer authoritative cleanup");
  gate.resolve();
  await pending;
  await tick();
  assert.equal(count(), 1);
  fixture.next(1);
  flush();
  assert.equal(fixture.map.has({}), false);
  assert.equal(count(), 0, "next derive still receives the queued dead-slot ID");
});

test("a key explicitly captured by a live compute remains reachable by design", async () => {
  const fixture = root(() => {
    const key = {};
    const map = createReactiveWeakMap<object, { key: object }>(draft => {
      draft.set(key, { key });
    });
    assert.equal(map.get(key)?.key, key);
    return { map, key: new WeakRef(key) };
  });
  await collect();
  assert.ok(fixture.key.deref());
  assert.equal(fixture.map.has(fixture.key.deref()!), true);
});
