import { update } from "../src";
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
