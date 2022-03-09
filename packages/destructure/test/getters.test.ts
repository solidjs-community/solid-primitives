import { wrapGetters } from "../src";
import { createComputed, createRoot, createSignal } from "solid-js";
import { tuple } from "@solid-primitives/utils";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("wrapGetters");

test("spread array", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal(tuple([1, 2, 3]));
    const list = wrapGetters(numbers);

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      list[0];
      updates.a++;
    });
    createComputed(() => {
      list[1];
      updates.b++;
    });
    createComputed(() => {
      list[2];
      updates.c++;
    });

    assert.is(list[0], 1);
    assert.is(list[1], 2);
    assert.is(list[2], 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers([1, 6, 7]);
    assert.is(list[0], 1);
    assert.is(list[1], 6);
    assert.is(list[2], 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  }));

test("spread object", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal({
      a: 1,
      b: 2,
      c: 3
    });
    const obj = wrapGetters(numbers);

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      obj.a;
      updates.a++;
    });
    createComputed(() => {
      obj.b;
      updates.b++;
    });
    createComputed(() => {
      obj.c;
      updates.c++;
    });

    assert.is(obj.a, 1);
    assert.is(obj.b, 2);
    assert.is(obj.c, 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers({
      a: 1,
      b: 6,
      c: 7
    });
    assert.is(obj.a, 1);
    assert.is(obj.b, 6);
    assert.is(obj.c, 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  }));

test("wrapGetters is lazy", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({
      a: 0
    });

    const obj = wrapGetters(numbers);

    assert.is(obj.a, 0);
    assert.is(obj.b, undefined);

    setNumbers({
      a: 2,
      b: 3
    });

    assert.is(obj.a, 2);
    assert.is(obj.b, 3);

    dispose();
  }));

test("wrap recursively nested objects", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal({
      nested: {
        a: 1,
        b: 2,
        c: 3
      }
    });
    const { nested: obj } = wrapGetters(numbers, { deep: true });

    const updates = {
      a: 0,
      b: 0,
      c: 0
    };
    createComputed(() => {
      obj.a;
      updates.a++;
    });
    createComputed(() => {
      obj.b;
      updates.b++;
    });
    createComputed(() => {
      obj.c;
      updates.c++;
    });

    assert.is(obj.a, 1);
    assert.is(obj.b, 2);
    assert.is(obj.c, 3);

    assert.is(updates.a, 1);
    assert.is(updates.b, 1);
    assert.is(updates.c, 1);

    setNumbers({
      nested: {
        a: 1,
        b: 6,
        c: 7
      }
    });
    assert.is(obj.a, 1);
    assert.is(obj.b, 6);
    assert.is(obj.c, 7);

    assert.is(updates.a, 1);
    assert.is(updates.b, 2);
    assert.is(updates.c, 2);

    dispose();
  }));

test.run();
