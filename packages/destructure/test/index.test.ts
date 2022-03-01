import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createComputed, createRoot, createSignal } from "solid-js";
import { tuple } from "@solid-primitives/utils";
import { destructure, spread } from "../src";

const testSpread = suite("spread");

testSpread("spread array", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal(tuple([1, 2, 3]));
    const [first, second, last] = spread(numbers);

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      first();
      updates.a++;
    });
    createComputed(() => {
      second();
      updates.b++;
    });
    createComputed(() => {
      last();
      updates.c++;
    });

    assert.is(first(), 1);
    assert.is(second(), 2);
    assert.is(last(), 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers([1, 6, 7]);
    assert.is(first(), 1);
    assert.is(second(), 6);
    assert.is(last(), 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  })
);

testSpread("spread object", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal({
      a: 1,
      b: 2,
      c: 3
    });
    const { a, b, c } = spread(numbers);

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      a();
      updates.a++;
    });
    createComputed(() => {
      b();
      updates.b++;
    });
    createComputed(() => {
      c();
      updates.c++;
    });

    assert.is(a(), 1);
    assert.is(b(), 2);
    assert.is(c(), 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers({
      a: 1,
      b: 6,
      c: 7
    });
    assert.is(a(), 1);
    assert.is(b(), 6);
    assert.is(c(), 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  })
);

testSpread("spread is lazy", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({
      a: 0
    });

    const { a, b } = spread(numbers);

    assert.is(a(), 0);
    assert.is(b, undefined);

    setNumbers({
      a: 2,
      b: 3
    });

    assert.is(a(), 2);
    assert.is(b, undefined);

    dispose();
  })
);

testSpread.run();

const testDest = suite("destructure");

testDest("destructure object", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal({
      a: 1,
      b: 2,
      c: 3
    });
    const { a, b, c } = destructure(numbers);

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      a();
      updates.a++;
    });
    createComputed(() => {
      b();
      updates.b++;
    });
    createComputed(() => {
      c();
      updates.c++;
    });

    assert.is(a(), 1);
    assert.is(b(), 2);
    assert.is(c(), 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers({
      a: 1,
      b: 6,
      c: 7
    });
    assert.is(a(), 1);
    assert.is(b(), 6);
    assert.is(c(), 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  })
);

testDest("destructure is lazy", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({
      a: 0
    });

    const { a, b } = destructure(numbers);

    assert.is(a(), 0);
    assert.is(b(), undefined);

    setNumbers({
      a: 2,
      b: 3
    });

    assert.is(a(), 2);
    assert.is(b(), 3);

    dispose();
  })
);

testDest.run();
