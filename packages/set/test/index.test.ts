import { ReactiveSet, ReactiveWeakSet } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testSet = suite("ReactiveSet");

testSet("behaves like Set", () => {
  const set = new ReactiveSet([1, 1, 2, 3]);
  assert.equal([...set], [1, 2, 3]);

  set.add(4);
  assert.equal([...set], [1, 2, 3, 4]);

  set.add(4);
  assert.equal([...set], [1, 2, 3, 4]);

  assert.ok(set.has(2) === true);
  assert.ok(set.delete(2) === true);
  assert.ok(set.has(2) === false);

  set.clear();
  assert.ok(set.size === 0);

  assert.instance(set, Set);
  assert.instance(set, ReactiveSet);
});

// testSet("has() is reactive", () =>
//   createRoot(dispose => {
//     const set = new ReactiveSet([1, 1, 2, 3]);

//     let captured = [];
//     createComputed(() => {
//       captured.push(set.has(2));
//     });
//     assert.equal(captured, [true], "1");

//     set.add(4);
//     assert.equal(captured, [true], "2");

//     set.delete(4);
//     assert.equal(captured, [true], "3");

//     set.delete(2);
//     assert.equal(captured, [true, false], "4");

//     set.add(2);
//     assert.equal(captured, [true, false, true], "5");

//     set.clear();
//     assert.equal(captured, [true, false, true, false], "6");

//     dispose();
//   })
// );

testSet.run();

const testWeakSet = suite("ReactiveWeakSet");

testWeakSet("behaves like a WeakSet", () => {
  const a = {};
  const b = {};
  const c = {};
  const d = {};
  const e = {};

  const set = new ReactiveWeakSet([a, a, b, c, d]);
  assert.ok(set.has(a));
  assert.ok(set.has(b));
  assert.ok(set.has(c));
  assert.ok(set.has(d));
  assert.not.ok(set.has(e));

  set.add(e);
  assert.ok(set.has(e));
  set.add(e);

  assert.ok(set.delete(a));
  assert.not.ok(set.has(a));

  assert.instance(set, WeakSet);
  assert.instance(set, ReactiveWeakSet);
});

testWeakSet.run();
