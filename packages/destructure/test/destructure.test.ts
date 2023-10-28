import { createComputed, createRoot, createSignal } from "solid-js";
import { describe, expect, test } from "vitest";
import { destructure } from "../src/index.js";

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
        _c: (a: number, b: number) => a * b,
        __c: () => () => (a: number, b: number) => a * b,
        d: toggle() ? 1 : 0, //intentionally wrongly not reactive
        onClick: (e: MouseEvent) => e.type,
        nested: {
          sum: (a: number, b: number) => a + b,
          num: 1,
        },
      });

      const {
        a,
        b,
        c,
        _c,
        __c,
        d,
        onClick,
        nested: { sum, num },
      } = destructure(_numbers, {
        normalize: true,
        memo: false,
        deep: true,
      });

      const updates = {
        a: 0,
        b: 0,
        c: 0,
        _c: 0,
        d: 0,
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
      createComputed(() => {
        __c()()(a(), b());
        updates._c++;
      });

      expect(a()).toBe(3);
      expect(b()).toBe(2);
      expect(c.length).toBe(2);
      expect(c(a(), b())).toBe(6);
      expect(_c.length).toBe(2);
      expect(_c(a(), b())).toBe(6);
      expect(__c()().length).toBe(2);
      expect(__c()()(a(), b())).toBe(6);
      expect(d()).toBe(1);
      expect(onClick.length).toBe(1);
      expect(onClick(new MouseEvent("click"))).toBe("click");
      expect(sum.length).toBe(2);
      expect(sum(1, 2)).toBe(3);
      expect(num()).toBe(1);

      expect(updates.a).toBe(1);
      expect(updates.b).toBe(1);
      expect(updates.c).toBe(1);
      setToggle(false);
      expect(updates.b).toBe(2);
      expect(b()).toBe(3);
      //@ts-ignore
      setNumbers(prev => ({ ...prev, a: () => 4, b: 6 }));

      expect(b()).toBe(6);
      //d is static.
      expect(d()).toBe(1);
      expect(c(a(), b())).toBe(24);
      expect(_c(a(), b())).toBe(24);
      expect(__c()()(a(), b())).toBe(24);
      expect(updates.a).toBe(2);
      expect(updates.b).toBe(3);
      expect(updates.c).toBe(3); // as we change a and b we compute c 2x
      dispose();
    }));
  test("normalize - effects are triggered correctly", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(1);

      const { x, y } = destructure(
        {
          get x() {
            return count() > 5;
          },
          y: () => count() > 5,
        },
        { memo: true, normalize: true },
      );
      const { _x, _y } = destructure(
        {
          get _x() {
            return count() > 5;
          },
          _y: () => count() > 5,
        },
        { normalize: true },
      );

      const updates = {
        x: 0,
        y: 0,
        _x: 0,
        _y: 0,
      };

      createComputed(() => {
        x();
        updates.x++;
      });
      createComputed(() => {
        y();
        updates.y++;
      });
      createComputed(() => {
        _x();
        updates._x++;
      });
      createComputed(() => {
        _y();
        updates._y++;
      });

      //@thetarnav's stuff
      expect(updates.x).toBe(1);
      expect(updates.y).toBe(1);
      expect(updates._x).toBe(1);
      expect(updates._y).toBe(1);

      setCount(2); // shouldn't rerun effects for x and y but for _x and _y
      expect(updates.x).toBe(1);
      expect(updates.y).toBe(1);
      expect(updates._x).toBe(2);
      expect(updates._y).toBe(2);

      setCount(6); // should rerun effects for x,y,_x,_y
      expect(updates.x).toBe(2);
      expect(updates.y).toBe(2);
      expect(updates._x).toBe(3);
      expect(updates._y).toBe(3);

      dispose();
    }));
});
