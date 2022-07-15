import { createComputed, createRoot } from "solid-js";
import {
  createStaticStore,
  handleDiffArray,
  arrayEquals,
  createWeakTriggerCache,
  createTriggerCache
} from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const tss = suite("createStaticStore");

tss("individual keys only update when changed", () =>
  createRoot(dispose => {
    const _shape = {
      a: 1,
      b: 2,
      c: 3,
      d: [0, 1, 2]
    };
    const [state, setState] = createStaticStore(_shape);

    assert.equal(state, _shape);
    assert.equal(_shape, { a: 1, b: 2, c: 3, d: [0, 1, 2] }, "original input shouldn't be mutated");

    setState({
      a: 9,
      d: [3, 2, 1]
    });

    assert.equal(state, { a: 9, b: 2, c: 3, d: [3, 2, 1] });
    assert.equal(_shape, { a: 1, b: 2, c: 3, d: [0, 1, 2] }, "original input shouldn't be mutated");

    let aUpdates = -1;
    createComputed(() => {
      state.a;
      aUpdates++;
    });
    assert.is(aUpdates, 0);

    setState({
      b: 3
    });
    assert.is(aUpdates, 0);
    setState("a", 4);
    assert.is(aUpdates, 1);

    dispose();
  })
);

// tss("able to listen to key, not yet added", () =>
//   createRoot(dispose => {
//     const _shape = {};
//     const [state, setState] = createShallowStore<{ a?: number }>(_shape);

//     let captured: any[] = [];
//     createComputed(() => captured.push(state.a));

//     assert.equal(captured, [undefined]);

//     setState("a", 1);

//     assert.equal(captured, [undefined, 1]);

//     dispose();
//   })
// );

tss.run();

const da = suite("handleDiffArray");

da("handleAdded called for new array", () => {
  const a: string[] = [];
  const b = ["foo", "bar", "baz", "hello", "world"];
  const captured: any[] = [];
  handleDiffArray(
    b,
    a,
    item => {
      captured.push(item);
    },
    () => {
      throw "Should never run";
    }
  );
  assert.is(captured.length, 5);
  assert.ok(captured.includes("foo"));
  assert.ok(captured.includes("bar"));
  assert.ok(captured.includes("baz"));
  assert.ok(captured.includes("hello"));
  assert.ok(captured.includes("world"));
});

da("handleRemoved for cleared array", () => {
  const a = ["foo", "bar", "baz", "hello", "world"];
  const b: string[] = [];
  const captured: any[] = [];
  handleDiffArray(
    b,
    a,
    () => {
      throw "Should never run";
    },
    item => {
      captured.push(item);
    }
  );
  assert.is(captured.length, 5);
  assert.ok(captured.includes("foo"));
  assert.ok(captured.includes("bar"));
  assert.ok(captured.includes("baz"));
  assert.ok(captured.includes("hello"));
  assert.ok(captured.includes("world"));
});

da("callbacks shouldn't run for same array", () => {
  const a = ["foo", "bar", "baz", "hello", "world"];
  const b = ["foo", "bar", "baz", "hello", "world"];
  handleDiffArray(
    b,
    a,
    () => {
      throw "Should never run";
    },
    () => {
      throw "Should never run";
    }
  );
});

da("calls callbacks for added and removed items", () => {
  const a = ["foo", "baz", "hello"];
  const b = ["foo", "bar", "hello", "world"];
  const capturedAdded: any[] = [];
  const capturedRemoved: any[] = [];
  handleDiffArray(
    b,
    a,
    item => capturedAdded.push(item),
    item => capturedRemoved.push(item)
  );
  assert.is(capturedAdded.length, 2);
  assert.ok(capturedAdded.includes("bar"));
  assert.ok(capturedAdded.includes("world"));

  assert.is(capturedRemoved.length, 1);
  assert.ok(capturedRemoved.includes("baz"));
});

da.run();

const ae = suite("arrayEquals");

ae("arrayEquals", () => {
  const _1: any[] = [];
  assert.ok(arrayEquals(_1, _1));
  assert.ok(arrayEquals(_1, []));
  assert.ok(arrayEquals([1, 2, 3], [1, 2, 3]));
  assert.ok(arrayEquals([1, 2, _1], [1, 2, _1]));

  assert.not.ok(arrayEquals([1, 2, 3], [1, 2, 3, 4]));
  assert.not.ok(arrayEquals([1, 2, 3], [1, 0, 3]));
  assert.not.ok(arrayEquals([1, 2, _1], [1, 2, []]));
});

ae.run();

const testTriggerCache = suite("createTriggerCache");

testTriggerCache("weak trigger cache", () =>
  createRoot(dispose => {
    const { dirty, track } = createWeakTriggerCache();
    let runs = -1;
    const key1 = {};
    const key2 = {};
    createComputed(() => {
      track(key1);
      runs++;
    });
    assert.is(runs, 0);
    dirty(key2);
    assert.is(runs, 0);
    dirty(key1);
    assert.is(runs, 1);

    dispose();
  })
);

testTriggerCache("weak trigger cache", () =>
  createRoot(dispose => {
    const { dirty, track, dirtyAll } = createTriggerCache();
    let runs1 = -1;
    let runs2 = -1;
    const key1 = "key1";
    const key2 = "key2";
    createComputed(() => {
      track(key1);
      runs1++;
    });
    createComputed(() => {
      track(key2);
      runs2++;
    });
    assert.is(runs1, 0);
    assert.is(runs2, 0);
    dirty(key2);
    assert.is(runs1, 0);
    assert.is(runs2, 1);
    dirty(key1);
    assert.is(runs1, 1);
    assert.is(runs2, 1);
    dirtyAll();
    assert.is(runs1, 2);
    assert.is(runs2, 2);

    dispose();
  })
);

testTriggerCache.run();
