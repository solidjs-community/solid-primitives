import { describe, test, expect } from "vitest";
import { createComputed, createRoot, createSignal } from "solid-js";
import { destructure } from "../src/index.js";

describe("destructure", () => {
  test("props", () => {
    const [get_count, set_count] = createSignal(0)
    const [get_label, set_label] = createSignal("foo")
    const [get_highlight, set_highlight] = createSignal(false)

    const props: { count: number; label: string; highlight: boolean } = {
      get count()     {return get_count()},
      get label()     {return get_label()},
      get highlight() {return get_highlight()},
    }

    const [{count, label, highlight}, dispose] = createRoot(dispose => [destructure(props), dispose])
    
    expect(count()).toBe(0);
    expect(label()).toBe("foo");
    expect(highlight()).toBe(false);

    set_count(10);
    set_label("bar");
    set_highlight(true);

    expect(count()).toBe(10);
    expect(label()).toBe("bar");
    expect(highlight()).toBe(true);

    dispose();
  })

  test("spread array", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal([1, 2, 3] as [number, number, number]);
      const [first, second, last] = destructure(numbers);

      const updates = {
        a: 0,
        b: 0,
        c: 0,
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

      expect(first()).toBe(1);
      expect(second()).toBe(2);
      expect(last()).toBe(3);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);

      setNumbers([1, 6, 7]);
      expect(first()).toBe(1);
      expect(second()).toBe(6);
      expect(last()).toBe(7);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(2);
      expect(updates.c).toBe(2);

      dispose();
    }));

  test("spread object", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal({
        a: 1,
        b: 2,
        c: 3,
      });
      const { a, b, c } = destructure(numbers);

      const updates = {
        a: 0,
        b: 0,
        c: 0,
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

      expect(a()).toBe(1);
      expect(b()).toBe(2);
      expect(c()).toBe(3);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);

      setNumbers({
        a: 1,
        b: 6,
        c: 7,
      });
      expect(a()).toBe(1);
      expect(b()).toBe(6);
      expect(c()).toBe(7);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(2);
      expect(updates.c).toBe(2);

      dispose();
    }));

  test("spread is eager", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({
        a: 0,
      });

      const { a, b } = destructure(numbers);

      expect(a()).toBe(0);
      expect(b).toBe(undefined);

      setNumbers({
        a: 2,
        b: 3,
      });

      expect(a()).toBe(2);
      expect(b).toBe(undefined);

      dispose();
    }));

  test("destructure object", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal({
        a: 1,
        b: 2,
        c: 3,
      });
      const { a, b, c } = destructure(numbers, { lazy: true });

      const updates = {
        a: 0,
        b: 0,
        c: 0,
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

      expect(a()).toBe(1);
      expect(b()).toBe(2);
      expect(c()).toBe(3);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);

      setNumbers({
        a: 1,
        b: 6,
        c: 7,
      });
      expect(a()).toBe(1);
      expect(b()).toBe(6);
      expect(c()).toBe(7);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(2);
      expect(updates.c).toBe(2);

      dispose();
    }));

  test("destructure is lazy", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal<{ a: number; b?: number }>({
        a: 0,
      });

      const { a, b } = destructure(numbers, { lazy: true });

      expect(a()).toBe(0);
      expect(b()).toBe(undefined);

      setNumbers({
        a: 2,
        b: 3,
      });

      expect(a()).toBe(2);
      expect(b()).toBe(3);

      dispose();
    }));

  test("destructure recursively nested objects", () =>
    createRoot(dispose => {
      const [numbers, setNumbers] = createSignal({
        nested: {
          a: 1,
          b: 2,
          c: 3,
        },
      });
      const {
        nested: { a, b, c },
      } = destructure(numbers, { deep: true });

      const updates = {
        a: 0,
        b: 0,
        c: 0,
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

      expect(a()).toBe(1);
      expect(b()).toBe(2);
      expect(c()).toBe(3);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);

      setNumbers({
        nested: {
          a: 1,
          b: 6,
          c: 7,
        },
      });
      expect(a()).toBe(1);
      expect(b()).toBe(6);
      expect(c()).toBe(7);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(2);
      expect(updates.c).toBe(2);

      dispose();
    }));
});
