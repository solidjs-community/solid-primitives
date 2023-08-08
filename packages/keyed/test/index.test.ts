import { createComputed, createMemo, createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { update } from "@solid-primitives/utils/immutable";
import { describe, expect, test } from "vitest";
import { keyArray } from "../src/index.js";

const el1 = { id: 1, value: "bread" };
const el2 = { id: 2, value: "milk" };
const el3 = { id: 3, value: "honey" };
const el4 = { id: 4, value: "chips" };

describe("keyArray", () => {
  test("maps and returns all initial items", () =>
    createRoot(dispose => {
      const mapped = keyArray(
        () => [el1, el2, el3],
        v => v.id,
        v => ({ ...v(), key: v().id }),
      );
      expect(mapped().length).toBe(3);
      expect(mapped()[0].key).toBe(1);
      expect(mapped()[1].key).toBe(2);
      expect(mapped()[2].key).toBe(3);

      dispose();
    }));

  test("cloning list should have no effect", () =>
    createRoot(dispose => {
      const [list, setList] = createSignal([el1, el2, el3]);
      let changes = 0;
      const mapped = keyArray(
        list,
        v => v.id,
        v => v().id,
      );
      createComputed(() => mapped(), changes++);
      expect(mapped()).toEqual([1, 2, 3]);
      expect(changes).toBe(1);

      setList(p => p.slice());
      expect(mapped()).toEqual([1, 2, 3]);
      expect(changes).toBe(1);

      dispose();
    }));

  test("mapFn is reactive", () =>
    createRoot(dispose => {
      const [list, setList] = createSignal([el1, el2, el3]);
      let changes = 0;
      const mapped = keyArray(
        list,
        v => v.id,
        v => {
          const item = { value: v().value };
          createComputed(() => (item.value = v().value));
          return item;
        },
      );
      createComputed(() => mapped(), changes++);

      expect(mapped()).toEqual([{ value: "bread" }, { value: "milk" }, { value: "honey" }]);
      expect(changes).toBe(1);

      setList(p => update(p, 0, "value", "bananas"));
      expect(mapped()).toEqual([{ value: "bananas" }, { value: "milk" }, { value: "honey" }]);
      expect(changes).toBe(1);

      dispose();

      setList(p => update(p, 1, "value", "orange juice"));
      expect(mapped()).toEqual([{ value: "bananas" }, { value: "milk" }, { value: "honey" }]);
      expect(changes).toBe(1);
      expect(changes).toBe(1);
    }));

  test("index is reactive", () =>
    createRoot(dispose => {
      const [list, setList] = createSignal([el1, el2, el3]);
      let changes = 0;
      let maprun = 0;
      const mapped = keyArray(
        list,
        v => v.id,
        (v, i) => {
          maprun++;
          const item = { i: i(), v: v().value };
          createComputed(() => (item.i = i()), (item.v = v().value));
          return item;
        },
      );
      createComputed(() => {
        mapped();
        changes++;
      });

      expect(mapped()).toEqual([
        { i: 0, v: "bread" },
        { i: 1, v: "milk" },
        { i: 2, v: "honey" },
      ]);
      expect(changes).toBe(1);
      expect(maprun).toBe(3);

      setList([el1, el3, el2]);
      expect(mapped()).toEqual([
        { i: 0, v: "bread" },
        { i: 1, v: "honey" },
        { i: 2, v: "milk" },
      ]);
      expect(changes).toBe(2);
      expect(maprun).toBe(3);

      setList([el1, el4, el3, el2]);
      expect(mapped()).toEqual([
        { i: 0, v: "bread" },
        { i: 1, v: "chips" },
        { i: 2, v: "honey" },
        { i: 3, v: "milk" },
      ]);
      expect(changes).toBe(3);
      expect(maprun).toBe(4);

      dispose();
    }));

  test("supports top-level store arrays", () =>
    createRoot(dispose => {
      const [list, setList] = createStore([
        { i: 0, v: "foo" },
        { i: 1, v: "bar" },
        { i: 2, v: "baz" },
      ]);

      const mapped = keyArray(
        () => list,
        e => e.i,
        (item, index) => [item, index] as const,
      );

      const getUnwrapped = (): [number, string, number][] =>
        mapped().map(([e, index]) => {
          const { i, v } = e();
          return [i, v, index()];
        });

      expect(mapped().length).toBe(3);
      expect(getUnwrapped()).toEqual([
        [0, "foo", 0],
        [1, "bar", 1],
        [2, "baz", 2],
      ]);

      const [a0, a1, a2] = mapped();

      setList([
        { i: 2, v: "foo" },
        { i: 0, v: "bar" },
        { i: 1, v: "baz" },
      ]);

      expect(mapped().length).toBe(3);
      expect(getUnwrapped()).toEqual([
        [2, "foo", 0],
        [0, "bar", 1],
        [1, "baz", 2],
      ]);

      const [b0, b1, b2] = mapped();
      expect(a0).toBe(b1);
      expect(a1).toBe(b2);
      expect(a2).toBe(b0);

      dispose();
    }));

  test("key entries by prop name", () =>
    createRoot(dispose => {
      const entriesFrom: [string, {}][] = [
        ["0", 0],
        ["1", 1],
        ["2", 2],
        ["3", 3],
      ];
      const entriesTo: [string, {}][] = [
        ["0", 0],
        ["1", 1],
        ["2", 2],
      ];

      const [list, setList] = createSignal<[string, {}][]>(entriesFrom);
      const mapped = createMemo(
        keyArray(
          list,
          v => v[0],
          v => v()[1],
        ),
      );
      expect(mapped().length).toBe(4);
      expect(mapped()).toEqual([0, 1, 2, 3]);

      setList(entriesTo);
      expect(mapped().length).toBe(3);
      expect(mapped()).toEqual([0, 1, 2]);

      dispose();
    }));
});
