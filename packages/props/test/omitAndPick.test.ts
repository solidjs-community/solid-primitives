import { createComputed, createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { omitProps, pickProps } from "../src";

const testOmit = suite("omitProps");

testOmit("omits selected props", () => {
  const props = { a: 123, b: "foo", c: "bar" };
  const res1 = omitProps(props, "a", "b", "non-existing" as any);
  assert.equal(res1, { c: "bar" });
  const res2 = omitProps(props, "a", "c");
  assert.equal(res2, { b: "foo" });
  assert.equal(props, { a: 123, b: "foo", c: "bar" });
});

testOmit("respects getters", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const props = {
      get count() {
        return count();
      },
      a: 123,
      b: "foo"
    };
    const res = omitProps(props, "a", "b");
    assert.equal(res, { count: 0 });
    setCount(1);
    assert.equal(res, { count: 1 });
    dispose();
  })
);

testOmit("props are reactive", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const props = {
      get count() {
        return count();
      },
      a: 123,
      b: "foo"
    };
    const res = omitProps(props, "a", "b");
    const captured: any[] = [];
    createComputed(() => captured.push(res.count));
    assert.equal(captured, [0]);
    setCount(1);
    assert.equal(captured, [0, 1]);
    dispose();
  })
);

testOmit.run();

const testPick = suite("pickProps");

testPick("omits selected props", () => {
  const props = { a: 123, b: "foo", c: "bar" };
  const res1 = pickProps(props, "a", "b", "non-existing" as any);
  assert.equal(res1, { a: 123, b: "foo" });
  const res2 = pickProps(props, "a", "c");
  assert.equal(res2, { a: 123, c: "bar" });
  assert.equal(props, { a: 123, b: "foo", c: "bar" });
});

testPick("respects getters", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const props = {
      get count() {
        return count();
      },
      a: 123,
      b: "foo"
    };
    const res = pickProps(props, "count");
    assert.equal(res, { count: 0 });
    setCount(1);
    assert.equal(res, { count: 1 });
    dispose();
  })
);

testPick("props are reactive", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const props = {
      get count() {
        return count();
      },
      a: 123,
      b: "foo"
    };
    const res = pickProps(props, "count");
    const captured: any[] = [];
    createComputed(() => captured.push(res.count));
    assert.equal(captured, [0]);
    setCount(1);
    assert.equal(captured, [0, 1]);
    dispose();
  })
);

testPick.run();
