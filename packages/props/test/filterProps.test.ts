import { createComputed, createRoot, createSignal, mergeProps } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { filterProps, createPropsPredicate } from "../src";

const test = suite("filterProps");

test("filters props", () => {
  const props = {
    a: 1,
    b: 2,
    c: 3,
    d: 4
  };
  const filtered = filterProps(props, key => key !== "b");
  assert.equal(filtered, {
    a: 1,
    c: 3,
    d: 4
  });
  assert.equal(Object.keys(filtered), ["a", "c", "d"]);
});

test("predicate runs for every read", () => {
  const checked: string[] = [];
  const filtered: any = filterProps(
    {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    },
    key => {
      checked.push(key);
      return true;
    }
  );
  assert.is(checked.length, 0);
  filtered.a;
  assert.equal(checked, ["a"]);
  checked.length = 0;

  filtered["not-existing"];
  assert.is(checked.length, 0, "predicate is not run for non-existing keys");
  checked.length = 0;

  filtered.b;
  filtered.a;
  filtered.a;
  assert.equal(checked, ["b", "a", "a"]);
  checked.length = 0;

  Object.keys(filtered);
  assert.equal(checked, ["a", "b", "c", "d"]);
});

test("supports dynamic props", () =>
  createRoot(dispose => {
    const [props, setProps] = createSignal<Record<string, number>>({
      a: 1,
      b: 2,
      c: 3
    });
    const proxy = mergeProps(props);
    const filtered = filterProps(proxy, key => key !== "b" && key !== "d");
    let captured: any;
    createComputed(() => {
      captured = { ...filtered };
    });
    assert.equal(captured, {
      a: 1,
      c: 3
    });

    setProps({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    });

    assert.equal(captured, {
      a: 1,
      c: 3,
      e: 5
    });

    dispose();
  }));

test.run();

const testCached = suite("filterProps + createPropsPredicate");

testCached("filters props", () =>
  createRoot(dispose => {
    const props = {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    };
    const filtered = filterProps(
      props,
      createPropsPredicate(props, key => key !== "b")
    );
    assert.equal(filtered, {
      a: 1,
      c: 3,
      d: 4
    });
    assert.equal(Object.keys(filtered), ["a", "c", "d"]);

    dispose();
  })
);

testCached("predicate is cached", () =>
  createRoot(dispose => {
    const props = {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    };
    const checked: string[] = [];
    const filtered: any = filterProps(
      props,
      createPropsPredicate(props, key => {
        checked.push(key);
        return true;
      })
    );
    assert.is(checked.length, 0);

    filtered.a;
    assert.equal(checked, ["a"]);

    filtered.b;
    filtered.a;
    filtered.a;
    assert.equal(checked, ["a", "b"]);

    Object.keys(filtered);
    assert.equal(checked, ["a", "b", "c", "d"]);

    dispose();
  })
);

testCached("supports dynamic props", () =>
  createRoot(dispose => {
    const checked: string[] = [];
    const [props, setProps] = createSignal<Record<string, number>>({
      a: 1,
      b: 2,
      c: 3
    });
    const proxy = mergeProps(props);
    const filtered = filterProps(
      proxy,
      createPropsPredicate(proxy, key => {
        checked.push(key);
        return key !== "b" && key !== "d";
      })
    );
    let captured: any;
    createComputed(() => {
      captured = { ...filtered };
    });
    assert.equal(captured, {
      a: 1,
      c: 3
    });
    assert.equal(checked, ["a", "b", "c"]);
    checked.length = 0;

    setProps({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    });

    assert.equal(captured, {
      a: 1,
      c: 3,
      e: 5
    });
    assert.equal(checked, ["a", "b", "c", "d", "e"]);

    dispose();
  })
);

testCached.run();
