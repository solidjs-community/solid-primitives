import { describe, it, expect } from "vitest";
import { filterInstance, filterOutInstance, push, sort, template } from "../src/index.js";
import { type Accessor, createRoot, createSignal, flush } from "solid-js";
import { compare } from "@solid-primitives/utils";

describe("signal builders", () => {
  it("push + sort", () => {
    const [list, setList] = createSignal([4, 3, 2, 1]);
    const [item, setItem] = createSignal(0);
    let res!: Accessor<number[]>;
    const dispose = createRoot(d => {
      res = sort(push(list, item), compare);
      return d;
    });

    expect(res()).toEqual([0, 1, 2, 3, 4]);
    setList([1, 2, 3, 5, 4]);
    setItem(1);
    flush();
    expect(res()).toEqual([1, 1, 2, 3, 4, 5]);
    dispose();
  });

  it("filter instances", () =>
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

  it("template", () => {
    const [a, _setA] = createSignal("Hello");
    const [b, setB] = createSignal("World");
    let result!: Accessor<string>;
    const dispose = createRoot(d => {
      result = template`${a} ${b}!!!`;
      return d;
    });

    expect(result()).toBe("Hello World!!!");
    setB("Solid");
    flush();
    expect(result()).toBe("Hello Solid!!!");
    dispose();
  });
});
