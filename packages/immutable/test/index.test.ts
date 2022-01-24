import { update, concat, split } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { cloneDeep } from "lodash";

const testUpdate = suite("update");

testUpdate("update()", () => {
  const original = {
    a: 123,
    b: { inner: { c: "yo", d: [0, 1, 2], fn: () => {} } },
    arr: [1, 2, 3]
  };
  const originalClone = cloneDeep(original);

  let captirePrev: any;
  const x = update(original, "a", prev => {
    captirePrev = prev;
    return "69";
  });
  assert.is(x.a, "69");
  assert.is(captirePrev, 123);
  assert.equal(original, originalClone, "0. original shouldn't be modified");
  const y = update(original, "b", "inner", "69");
  assert.is(y.b.inner, "69");
  assert.equal(original, originalClone, "1. original shouldn't be modified");
  const z = update(original, "b", "inner", "c", { aha: 123 });
  assert.is(z.b.inner.c.aha, 123);
  assert.equal(z.b.inner.d, [0, 1, 2]);
  assert.equal(original, originalClone, "2. original shouldn't be modified");
  const a = update(original, "arr", 0, "yoo");
  assert.equal(a.arr, ["yoo", 2, 3]);
  const fn = update(original, "b", "inner", "fn", () => () => 123);
  assert.is(fn.b.inner.fn(), 123);
  assert.equal(original, originalClone, "3. original shouldn't be modified");
  const theSame = update(original, "b", "inner", "c", "yo");
  assert.equal(theSame, originalClone);
});

testUpdate.run();

const testConcat = suite("concat");

testConcat("concat()", () => {
  const originalArgs = [1, 2, ["a", "b"], "c", [3, [4, 5]]];
  const copiedArgs = cloneDeep(originalArgs);

  const a = concat(...originalArgs);
  assert.equal(a, [1, 2, "a", "b", "c", 3, [4, 5]]);
  assert.equal(originalArgs, copiedArgs);
});

testConcat.run();

const testSplit = suite("split");

testSplit("split()", () => {
  const original = { a: 123, b: "foo", c: { inner: 1 }, d: [1, 2, 3] };
  const originalCopy = cloneDeep(original);

  const [a, b] = split(original, "a", "c");
  assert.equal(a, { a: 123, c: { inner: 1 } });
  assert.equal(b, { b: "foo", d: [1, 2, 3] });

  const [c, d, e] = split(original, ["a"], ["c", "b"]);
  assert.equal(c, { a: 123 });
  assert.equal(d, { b: "foo", c: { inner: 1 } });
  assert.equal(e, { d: [1, 2, 3] });

  assert.equal(original, originalCopy);
});

testSplit.run();
