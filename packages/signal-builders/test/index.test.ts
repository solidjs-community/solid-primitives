import { describe, test, expect } from "vitest";
import { filterInstance, filterOutInstance, push, sort, template } from "../src";
import { createRoot, createSignal } from "solid-js";
import { compare } from "@solid-primitives/utils";

describe("all primitives", () => {
  test("composition", () =>
    createRoot(dispose => {
      const [list, setList] = createSignal([4, 3, 2, 1]);
      const [item, setItem] = createSignal(0);
      const res = sort(push(list, item), compare);
      expect(res()).toEqual([0, 1, 2, 3, 4]);
      setList([1, 2, 3, 5, 4]);
      setItem(1);
      expect(res()).toEqual([1, 1, 2, 3, 4, 5]);
      dispose();
    }));

  test("filter instances", () =>
    createRoot(dispose => {
      const num = 12345;
      const string = "hello";
      const el = document.createElement("div");
      const svg = document.createElement("svg");
      const list = [num, string, el, svg, string, null, undefined, NaN];
      const copy = [num, string, el, svg, string, null, undefined, NaN];

      const a = filterInstance(() => list, Element, Number);
      expect(a()).toEqual([num, el, svg]);
      const b = filterOutInstance(() => list, Element, Number);
      expect(b()).toEqual([string, string]);
      expect(list, "nonmutable").toEqual(copy);
      dispose();
    }));

  test("teamplate", () =>
    createRoot(dispose => {
      const [a] = createSignal("Hello");
      const [b, setB] = createSignal("World");
      const result = template`${a} ${b}!!!`;
      expect(result()).toEqual("Hello World!!!");

      setB("Solid");
      expect(result()).toEqual("Hello Solid!!!");

      dispose();
    }));
});
