import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { push, remove, removeItems } from "@solid-primitives/immutable";
import {
  elements,
  getAddedItems,
  getChangedItems,
  getRemovedItems,
  mapRemoved,
  refs,
  resolveElements
} from "../src";

const el1 = document.createElement("div");
const el2 = document.createElement("span");
const el3 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const el4 = document.createElement("h1");
const el5 = document.createElement("h1");

describe("get changes helpers", () => {
  test("getAddedItems", () => {
    const from = Array.from({ length: 5 }, () => new Date());
    const add = Array.from({ length: 2 }, () => new Date());
    const to = [from[0], from[1], add[0], from[3], add[1]];
    const added = getAddedItems(from, to);
    expect(added).toEqual(add);
  });

  test("getRemovedItems", () => {
    const from = Array.from({ length: 5 }, () => new Date());
    const add = Array.from({ length: 2 }, () => new Date());
    const to = [from[0], from[1], add[0], from[3], add[1]];
    const removed = getRemovedItems(from, to);
    expect(removed).toEqual([from[2], from[4]]);
  });

  test("getChangedItems", () => {
    const from = Array.from({ length: 5 }, () => new Date());
    const add = Array.from({ length: 2 }, () => new Date());
    const to = [from[0], from[1], add[0], from[3], add[1]];
    const [added, removed] = getChangedItems(from, to);
    expect(removed).toEqual([from[2], from[4]]);
    expect(added).toEqual(add);
  });
});

describe("elements()", () => {
  test("get a signal of elements array", () =>
    createRoot(dispose => {
      const _arr = [123456, undefined, el2, NaN, el1, null, "HELLO", el3, el4, [1, 2, 3]];
      const [arr, setArr] = createSignal(_arr);
      const els = elements(arr);

      expect(els().length).toBe(4);
      els().forEach(el => {
        expect(el).instanceOf(Element);
      });

      setArr([]);
      expect(els().length).toBe(0);

      const htmlEls = elements(arr, HTMLElement);
      expect(htmlEls().length).toBe(0);

      setArr(_arr);
      expect(htmlEls().length).toBe(3);
      htmlEls().forEach(el => {
        expect(el).instanceOf(HTMLElement);
      });

      dispose();
    }));
});

describe("refs()", () => {
  test("returned signals reflect changes to source", () => {
    const _source = [undefined, el2, el1, "HELLO", el3];
    const [source, setSource] = createSignal(_source);

    const [els, added, removed] = refs(source);
    expect(els()).toEqual([el2, el1, el3]);
    expect(added()).toEqual([el2, el1, el3]);
    expect(removed()).toEqual([]);

    setSource(p => [...p, el4]);
    expect(els()).toEqual([el2, el1, el3, el4]);
    expect(added()).toEqual([el4]);
    expect(removed()).toEqual([]);

    setSource(p => removeItems(p, el1, el2, undefined));
    expect(els(), "3 1").toEqual([el3, el4]);
    expect(added(), "3 2").toEqual([]);
    expect(removed(), "3 3").toEqual([el2, el1]);
  });
});

describe("mapRemoved()", () => {
  test("mapFn get's called on each item remove", () =>
    createRoot(dispose => {
      const _source = [el2, el1, el2, el3, el4];
      const [source, setSource] = createSignal(_source);

      const captured_els: Element[] = [];
      mapRemoved(source, el => {
        captured_els.push(el);
      });
      expect(captured_els.length).toBe(0);

      setSource(p => remove(p, el3));
      expect(captured_els).toEqual([el3]);

      setSource(p => remove(p, el2));
      expect(captured_els).toEqual([el3]);

      setSource(p => removeItems(p, el2, el1));
      expect(captured_els).toEqual([el3, el1, el2]);

      dispose();
    }));

  test("returns combined array", () =>
    createRoot(dispose => {
      const _source = [el1, el2, el3, el5];
      const [source, setSource] = createSignal(_source);

      let returns = true;
      const res = mapRemoved(source, el => (returns ? () => el : undefined));

      setSource(p => remove(p, el3));
      expect(res()).toEqual([el1, el2, el3, el5]);

      returns = false;
      setSource(p => remove(p, el2));
      expect(res()).toEqual([el1, el3, el5]);

      setSource(p => push(p, el4));
      expect(res()).toEqual([el1, el3, el5, el4]);

      setSource(() => [el4, el5, el1]);
      expect(res()).toEqual([el4, el3, el5, el1]);

      dispose();
    }));

  test("removeing saved element", () =>
    createRoot(dispose => {
      const _source = [el1, el2, el3, el5];
      const [source, setSource] = createSignal(_source);
      const fns: VoidFunction[] = [];

      const res = mapRemoved<Element | undefined>(source, ref => {
        const [el, setEl] = createSignal<Element | undefined>(ref);
        fns.push(() => setEl(undefined));
        return el;
      });

      setSource(p => remove(p, el3));
      expect(res()).toEqual([el1, el2, el3, el5]);

      fns.forEach(fn => fn());
      expect(res()).toEqual([el1, el2, el5]);

      setSource(p => removeItems(p, el2, el1));
      expect(res()).toEqual([el1, el2, el5]);

      fns.forEach(fn => fn());
      expect(res()).toEqual([el5]);

      dispose();
    }));

  test("index signal", () =>
    createRoot(dispose => {
      const _source = [el1, el2, el3, el5];
      const [source, setSource] = createSignal(_source);
      const saved = new Map<Element, () => number>();

      let returns = true;
      mapRemoved(source, (el, index) => {
        saved.set(el, index);
        return returns ? () => el : undefined;
      });

      setSource(p => remove(p, el3));
      expect(saved.get(el3)!()).toBe(2);

      returns = false;
      setSource(p => remove(p, el2));
      expect(saved.get(el3)!()).toBe(1);

      setSource(p => [el4, ...p]);
      expect(saved.get(el3)!()).toBe(2);

      setSource([]);
      expect(saved.get(el3)!()).toBe(0);

      setSource([el1, el2, el4, el5]);
      expect(saved.get(el3)!()).toBe(0);

      dispose();
    }));
});

describe("resolveElements", () => {
  test("resolves elements", () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    const el3 = document.createElement("div");
    const el4 = document.createElement("div");
    const el5 = document.createElement("div");
    const el6 = document.createElement("div");

    expect(resolveElements(el1)).toEqual(el1);
    expect(resolveElements("hello")).toEqual(null);
    expect(resolveElements(() => el1)).toBe(el1);
    expect(resolveElements([el1, () => undefined])).toEqual([el1]);
    expect(
      resolveElements([
        el1,
        () => undefined,
        () => () => el2,
        [el3, () => el4, () => 123, (a: number) => el5],
        el6
      ])
    ).toEqual([el1, el2, el3, el4, el6]);
  });
});
