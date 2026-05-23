import { describe, test, expect } from "vitest";
import { createRoot, createSignal, createTrackedEffect, flush } from "solid-js";
import { destructure } from "../src/index.js";

describe("destructure", () => {
  test("props", () => {
    const [get_count, set_count] = createSignal(0);
    const [get_label, set_label] = createSignal("foo");
    const [get_highlight, set_highlight] = createSignal(false);

    const props: { count: number; label: string; highlight: boolean } = {
      get count() {
        return get_count();
      },
      get label() {
        return get_label();
      },
      get highlight() {
        return get_highlight();
      },
    };

    const [{ count, label, highlight }, dispose] = createRoot(dispose => [
      destructure(props),
      dispose,
    ]);

    expect(count()).toBe(0);
    expect(label()).toBe("foo");
    expect(highlight()).toBe(false);

    set_count(10);
    set_label("bar");
    set_highlight(true);
    flush();

    expect(count()).toBe(10);
    expect(label()).toBe("bar");
    expect(highlight()).toBe(true);

    dispose();
  });

  test("spread array", () => {
    const [numbers, setNumbers] = createSignal([1, 2, 3] as [number, number, number]);
    const updates = { a: 0, b: 0, c: 0 };

    const { first, second, last, dispose } = createRoot(d => {
      const [first, second, last] = destructure(numbers);
      createTrackedEffect(() => {
        first();
        updates.a++;
      });
      createTrackedEffect(() => {
        second();
        updates.b++;
      });
      createTrackedEffect(() => {
        last();
        updates.c++;
      });
      return { first, second, last, dispose: d };
    });
    flush();

    expect(first()).toBe(1);
    expect(second()).toBe(2);
    expect(last()).toBe(3);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(1);
    expect(updates.c).toBe(1);

    setNumbers([1, 6, 7]);
    flush();
    expect(first()).toBe(1);
    expect(second()).toBe(6);
    expect(last()).toBe(7);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(2);
    expect(updates.c).toBe(2);

    dispose();
  });

  test("spread object", () => {
    const [numbers, setNumbers] = createSignal({ a: 1, b: 2, c: 3 });
    const updates = { a: 0, b: 0, c: 0 };

    const { a, b, c, dispose } = createRoot(d => {
      const { a, b, c } = destructure(numbers);
      createTrackedEffect(() => {
        a();
        updates.a++;
      });
      createTrackedEffect(() => {
        b();
        updates.b++;
      });
      createTrackedEffect(() => {
        c();
        updates.c++;
      });
      return { a, b, c, dispose: d };
    });
    flush();

    expect(a()).toBe(1);
    expect(b()).toBe(2);
    expect(c()).toBe(3);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(1);
    expect(updates.c).toBe(1);

    setNumbers({ a: 1, b: 6, c: 7 });
    flush();
    expect(a()).toBe(1);
    expect(b()).toBe(6);
    expect(c()).toBe(7);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(2);
    expect(updates.c).toBe(2);

    dispose();
  });

  test("spread is eager", () => {
    const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({ a: 0 });

    const { a, b, dispose } = createRoot(d => {
      const { a, b } = destructure(numbers);
      return { a, b, dispose: d };
    });

    expect(a()).toBe(0);
    expect(b).toBe(undefined);

    setNumbers({ a: 2, b: 3 });
    flush();

    expect(a()).toBe(2);
    expect(b).toBe(undefined);

    dispose();
  });

  test("destructure object", () => {
    const [numbers, setNumbers] = createSignal({ a: 1, b: 2, c: 3 });
    const updates = { a: 0, b: 0, c: 0 };

    const { a, b, c, dispose } = createRoot(d => {
      const { a, b, c } = destructure(numbers, { lazy: true });
      createTrackedEffect(() => {
        a();
        updates.a++;
      });
      createTrackedEffect(() => {
        b();
        updates.b++;
      });
      createTrackedEffect(() => {
        c();
        updates.c++;
      });
      return { a, b, c, dispose: d };
    });
    flush();

    expect(a()).toBe(1);
    expect(b()).toBe(2);
    expect(c()).toBe(3);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(1);
    expect(updates.c).toBe(1);

    setNumbers({ a: 1, b: 6, c: 7 });
    flush();
    expect(a()).toBe(1);
    expect(b()).toBe(6);
    expect(c()).toBe(7);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(2);
    expect(updates.c).toBe(2);

    dispose();
  });

  test("destructure is lazy", () => {
    const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({ a: 0 });

    const { a, b, dispose } = createRoot(d => {
      const { a, b } = destructure(numbers, { lazy: true });
      return { a, b, dispose: d };
    });

    expect(a()).toBe(0);
    expect(b()).toBe(undefined);

    setNumbers({ a: 2, b: 3 });
    flush();

    expect(a()).toBe(2);
    expect(b()).toBe(3);

    dispose();
  });

  test("destructure recursively nested objects", () => {
    const [numbers, setNumbers] = createSignal({ nested: { a: 1, b: 2, c: 3 } });
    const updates = { a: 0, b: 0, c: 0 };

    const { a, b, c, dispose } = createRoot(d => {
      const {
        nested: { a, b, c },
      } = destructure(numbers, { deep: true });
      createTrackedEffect(() => {
        a();
        updates.a++;
      });
      createTrackedEffect(() => {
        b();
        updates.b++;
      });
      createTrackedEffect(() => {
        c();
        updates.c++;
      });
      return { a, b, c, dispose: d };
    });
    flush();

    expect(a()).toBe(1);
    expect(b()).toBe(2);
    expect(c()).toBe(3);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(1);
    expect(updates.c).toBe(1);

    setNumbers({ nested: { a: 1, b: 6, c: 7 } });
    flush();
    expect(a()).toBe(1);
    expect(b()).toBe(6);
    expect(c()).toBe(7);

    expect(updates.a).toBe(1);
    expect(updates.b).toBe(2);
    expect(updates.c).toBe(2);

    dispose();
  });
});
