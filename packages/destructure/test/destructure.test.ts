import { createComputed, createRoot, createSignal } from "solid-js";
import { describe, expect, test } from "vitest";
import { destructure } from "../src/index.js";
import { MaybeAccessor } from "@solid-primitives/utils";
import { normalize } from "path";

describe("destructure", () => {
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
  test("spread object normalize and deep", () =>
    createRoot(dispose => {
      const [toggle, setToggle] = createSignal(true);
      const [_numbers, setNumbers] = createSignal({
        a: 3,
        b: () => (toggle() ? 2 : 3),
        c: (a: number, b: number) => a * b,
        d: toggle() ? 1 : 0, //intentionally wrongly not reactive
        onClick: (_e: MouseEvent) => null,
        nested: {
          sum: (a: number, b: number) => a + b,
        },
      });

      const {
        a,
        b,
        c,
        d,
        onClick,
        nested: { sum },
      } = destructure(_numbers, {
        // normalize: true,
        memo: "normalize",
        deep: true,
      });

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
        c(a(), b());
        updates.c++;
      });

      expect(a()).toBe(3);
      expect(b()).toBe(2);
      expect(c(a(), b())).toBe(6);
      expect(d()).toBe(1);
      expect(onClick.length).toBe(1);
      expect(sum.length).toBe(2);
      expect(sum(1, 2)).toBe(3);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);
      setToggle(false);
      //@ts-ignore
      setNumbers(prev => ({ ...prev, a: () => 4, b: 3 }));

      expect(b()).toBe(3);
      //d is static.
      expect(d()).toBe(1);
      expect(c(a(), b())).toBe(12);
      expect(updates.a).toBe(2);
      expect(updates.b).toBe(2);
      expect(updates.c).toBe(3); // as we change a and b we compute c 2x
      dispose();
    }));
});
