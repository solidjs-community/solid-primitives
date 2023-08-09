import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { removeItems } from "@solid-primitives/utils/immutable";
import { getResolvedElements, resolveElements } from "../src/index.js";

const el1 = document.createElement("div");
const el2 = document.createElement("span");
const el3 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const el4 = document.createElement("h1");

describe("resolveElements", () => {
  test("resolves elements", () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    const el3 = document.createElement("div");
    const el4 = document.createElement("div");
    const el5 = document.createElement("div");
    const el6 = document.createElement("div");

    const predicate = (el: unknown | Element): el is Element => el instanceof Element;

    expect(getResolvedElements(el1, predicate)).toEqual(el1);
    expect(getResolvedElements("hello", predicate)).toEqual(null);
    expect(getResolvedElements(() => el1, predicate)).toBe(el1);
    expect(getResolvedElements([el1, () => undefined], predicate)).toEqual([el1]);
    expect(
      getResolvedElements(
        [
          el1,
          () => undefined,
          () => () => el2,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          [el3, () => el4, () => 123, ((_: number) => el5) as any],
          el6,
        ],
        predicate,
      ),
    ).toEqual([el1, el2, el3, el4, el6]);
  });

  test("returned signals reflect changes to source", () => {
    createRoot(dispose => {
      const _source = [undefined, el2, el1, "HELLO", el3];
      const [source, setSource] = createSignal(_source);

      const els = resolveElements(source);
      expect(els()).toEqual([el2, el1, el3]);

      setSource(p => [...p, el4]);
      expect(els()).toEqual([el2, el1, el3, el4]);

      setSource(p => removeItems(p, el1, el2, undefined));
      expect(els(), "3 1").toEqual([el3, el4]);

      dispose();
    });
  });
});
