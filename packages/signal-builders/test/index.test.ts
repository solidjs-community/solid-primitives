import { describe, it, expect } from "vitest";
import {
  string,
  float,
  int,
  join,
  lowercase,
  uppercase,
  capitalize,
  substring,
  template,
  add,
  substract,
  multiply,
  divide,
  power,
  round,
  ceil,
  floor,
  clamp,
  push,
  drop,
  dropRight,
  filter,
  filterOut,
  sort,
  map,
  slice,
  splice,
  remove,
  removeItems,
  concat,
  flatten,
  filterInstance,
  filterOutInstance,
  omit,
  pick,
  get,
  merge,
  update,
} from "../src/index.js";
import { createRoot, createSignal, flush } from "solid-js";
import { compare } from "@solid-primitives/utils";

// ─── CONVERT ────────────────────────────────────────────────────────────────

describe("string()", () => {
  it("coerces a number to string", () =>
    createRoot(dispose => {
      expect(string(42)()).toBe("42");
      dispose();
    }));

  it("coerces a boolean to string", () =>
    createRoot(dispose => {
      expect(string(true)()).toBe("true");
      dispose();
    }));

  it("updates when signal changes", () => {
    const [val, setVal] = createSignal<any>(1);
    const { result, dispose } = createRoot(d => ({ result: string(val), dispose: d }));
    expect(result()).toBe("1");
    setVal(null);
    flush();
    expect(result()).toBe("null");
    dispose();
  });
});

describe("float()", () => {
  it("parses a float string", () =>
    createRoot(dispose => {
      expect(float(() => "3.14")()).toBe(3.14);
      dispose();
    }));

  it("returns NaN for a non-numeric string", () =>
    createRoot(dispose => {
      expect(float(() => "abc")()).toBeNaN();
      dispose();
    }));

  it("updates when signal changes", () => {
    const [val, setVal] = createSignal("1.5");
    const { result, dispose } = createRoot(d => ({ result: float(val), dispose: d }));
    expect(result()).toBe(1.5);
    setVal("2.75");
    flush();
    expect(result()).toBe(2.75);
    dispose();
  });
});

describe("int()", () => {
  it("parses a decimal integer", () =>
    createRoot(dispose => {
      expect(int(() => "42")()).toBe(42);
      dispose();
    }));

  it("truncates fractional digits", () =>
    createRoot(dispose => {
      expect(int(() => "3.9")()).toBe(3);
      dispose();
    }));

  it("parses hex with radix 16", () =>
    createRoot(dispose => {
      expect(int(() => "ff", 16)()).toBe(255);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [val, setVal] = createSignal("10");
    const { result, dispose } = createRoot(d => ({ result: int(val), dispose: d }));
    expect(result()).toBe(10);
    setVal("99");
    flush();
    expect(result()).toBe(99);
    dispose();
  });
});

describe("join()", () => {
  it("joins with a separator", () =>
    createRoot(dispose => {
      expect(join(() => ["a", "b", "c"], ",")()).toBe("a,b,c");
      dispose();
    }));

  it("defaults to comma when separator is omitted", () =>
    createRoot(dispose => {
      expect(join(() => [1, 2, 3])()).toBe("1,2,3");
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal(["x", "y"]);
    const { result, dispose } = createRoot(d => ({ result: join(list, "-"), dispose: d }));
    expect(result()).toBe("x-y");
    setList(["a", "b", "c"]);
    flush();
    expect(result()).toBe("a-b-c");
    dispose();
  });

  it("updates when separator signal changes", () => {
    const [sep, setSep] = createSignal(",");
    const { result, dispose } = createRoot(d => ({
      result: join(() => ["a", "b"], sep),
      dispose: d,
    }));
    expect(result()).toBe("a,b");
    setSep(" | ");
    flush();
    expect(result()).toBe("a | b");
    dispose();
  });
});

// ─── STRING ─────────────────────────────────────────────────────────────────

describe("lowercase()", () => {
  it("lowercases a string", () =>
    createRoot(dispose => {
      expect(lowercase(() => "HELLO WORLD")()).toBe("hello world");
      dispose();
    }));

  it("updates when signal changes", () => {
    const [s, setS] = createSignal("HELLO");
    const { result, dispose } = createRoot(d => ({ result: lowercase(s), dispose: d }));
    expect(result()).toBe("hello");
    setS("WORLD");
    flush();
    expect(result()).toBe("world");
    dispose();
  });
});

describe("uppercase()", () => {
  it("uppercases a string", () =>
    createRoot(dispose => {
      expect(uppercase(() => "hello world")()).toBe("HELLO WORLD");
      dispose();
    }));

  it("updates when signal changes", () => {
    const [s, setS] = createSignal("hello");
    const { result, dispose } = createRoot(d => ({ result: uppercase(s), dispose: d }));
    expect(result()).toBe("HELLO");
    setS("world");
    flush();
    expect(result()).toBe("WORLD");
    dispose();
  });
});

describe("capitalize()", () => {
  it("uppercases first char and lowercases the rest", () =>
    createRoot(dispose => {
      expect(capitalize(() => "hELLO wORLD")()).toBe("Hello world");
      dispose();
    }));

  it("returns empty string unchanged", () =>
    createRoot(dispose => {
      expect(capitalize(() => "")()).toBe("");
      dispose();
    }));

  it("updates when signal changes", () => {
    const [s, setS] = createSignal("fOO");
    const { result, dispose } = createRoot(d => ({ result: capitalize(s), dispose: d }));
    expect(result()).toBe("Foo");
    setS("bAR");
    flush();
    expect(result()).toBe("Bar");
    dispose();
  });
});

describe("substring()", () => {
  it("extracts a range with start and end", () =>
    createRoot(dispose => {
      expect(substring(() => "Hello, world!", () => 7, () => 12)()).toBe("world");
      dispose();
    }));

  it("extracts to end when end is omitted", () =>
    createRoot(dispose => {
      expect(substring(() => "Hello, world!", () => 7)()).toBe("world!");
      dispose();
    }));

  it("updates when string signal changes", () => {
    const [s, setS] = createSignal("abcdef");
    const { result, dispose } = createRoot(d => ({
      result: substring(s, () => 1, () => 4),
      dispose: d,
    }));
    expect(result()).toBe("bcd");
    setS("xyz123");
    flush();
    expect(result()).toBe("yz1");
    dispose();
  });
});

describe("template`...`", () => {
  it("interpolates plain values", () =>
    createRoot(dispose => {
      expect(template`Hello, ${"World"}!`()).toBe("Hello, World!");
      dispose();
    }));

  it("interpolates signals and updates reactively", () => {
    const [name, setName] = createSignal("Solid");
    const [ver, setVer] = createSignal(2);
    const { result, dispose } = createRoot(d => ({
      result: template`${name} v${ver}`,
      dispose: d,
    }));
    expect(result()).toBe("Solid v2");
    setName("World");
    setVer(3);
    flush();
    expect(result()).toBe("World v3");
    dispose();
  });
});

// ─── NUMBER ─────────────────────────────────────────────────────────────────

describe("add()", () => {
  it("adds two numbers", () =>
    createRoot(dispose => {
      expect(add(() => 2, () => 3)()).toBe(5);
      dispose();
    }));

  it("adds multiple numbers", () =>
    createRoot(dispose => {
      expect(add(() => 1, () => 2, () => 3, () => 4)()).toBe(10);
      dispose();
    }));

  it("coerces to string when a string arg is present (starts from 0)", () =>
    createRoot(dispose => {
      // add() starts accumulating from 0, so number args sum first, then string coercion kicks in
      expect(add(() => 5, () => " items")()).toBe("5 items");
      dispose();
    }));

  it("updates when signal changes", () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    const { result, dispose } = createRoot(d => ({ result: add(a, b), dispose: d }));
    expect(result()).toBe(3);
    setA(10);
    flush();
    expect(result()).toBe(12);
    dispose();
  });
});

describe("substract()", () => {
  it("subtracts two values", () =>
    createRoot(dispose => {
      expect(substract(() => 10, () => 3)()).toBe(7);
      dispose();
    }));

  it("subtracts multiple values left-to-right", () =>
    createRoot(dispose => {
      expect(substract(() => 10, () => 3, () => 2)()).toBe(5);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [a, setA] = createSignal(10);
    const { result, dispose } = createRoot(d => ({
      result: substract(a, () => 4),
      dispose: d,
    }));
    expect(result()).toBe(6);
    setA(20);
    flush();
    expect(result()).toBe(16);
    dispose();
  });
});

describe("multiply()", () => {
  it("multiplies two values", () =>
    createRoot(dispose => {
      expect(multiply(() => 3, () => 4)()).toBe(12);
      dispose();
    }));

  it("multiplies multiple values", () =>
    createRoot(dispose => {
      expect(multiply(() => 2, () => 3, () => 4)()).toBe(24);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [a, setA] = createSignal(3);
    const { result, dispose } = createRoot(d => ({ result: multiply(a, () => 5), dispose: d }));
    expect(result()).toBe(15);
    setA(2);
    flush();
    expect(result()).toBe(10);
    dispose();
  });
});

describe("divide()", () => {
  it("divides two values", () =>
    createRoot(dispose => {
      expect(divide(() => 12, () => 4)()).toBe(3);
      dispose();
    }));

  it("divides multiple values left-to-right", () =>
    createRoot(dispose => {
      expect(divide(() => 100, () => 5, () => 4)()).toBe(5);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [a, setA] = createSignal(20);
    const { result, dispose } = createRoot(d => ({ result: divide(a, () => 4), dispose: d }));
    expect(result()).toBe(5);
    setA(40);
    flush();
    expect(result()).toBe(10);
    dispose();
  });
});

describe("power()", () => {
  it("raises to a power", () =>
    createRoot(dispose => {
      expect(power(() => 2, () => 10)()).toBe(1024);
      dispose();
    }));

  it("applies exponent chain left-to-right: (2**3)**2 = 64", () =>
    createRoot(dispose => {
      expect(power(() => 2, () => 3, () => 2)()).toBe(64);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [exp, setExp] = createSignal(2);
    const { result, dispose } = createRoot(d => ({ result: power(() => 3, exp), dispose: d }));
    expect(result()).toBe(9);
    setExp(3);
    flush();
    expect(result()).toBe(27);
    dispose();
  });
});

describe("round()", () => {
  it("rounds to nearest integer", () =>
    createRoot(dispose => {
      expect(round(() => 2.7)()).toBe(3);
      expect(round(() => 2.3)()).toBe(2);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [v, setV] = createSignal(2.4);
    const { result, dispose } = createRoot(d => ({ result: round(v), dispose: d }));
    expect(result()).toBe(2);
    setV(2.6);
    flush();
    expect(result()).toBe(3);
    dispose();
  });
});

describe("ceil()", () => {
  it("rounds up to next integer", () =>
    createRoot(dispose => {
      expect(ceil(() => 2.1)()).toBe(3);
      expect(ceil(() => 3.0)()).toBe(3);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [v, setV] = createSignal(1.1);
    const { result, dispose } = createRoot(d => ({ result: ceil(v), dispose: d }));
    expect(result()).toBe(2);
    setV(3.2);
    flush();
    expect(result()).toBe(4);
    dispose();
  });
});

describe("floor()", () => {
  it("rounds down to previous integer", () =>
    createRoot(dispose => {
      expect(floor(() => 2.9)()).toBe(2);
      expect(floor(() => 3.0)()).toBe(3);
      dispose();
    }));

  it("updates when signal changes", () => {
    const [v, setV] = createSignal(3.9);
    const { result, dispose } = createRoot(d => ({ result: floor(v), dispose: d }));
    expect(result()).toBe(3);
    setV(4.1);
    flush();
    expect(result()).toBe(4);
    dispose();
  });
});

describe("clamp()", () => {
  it("clamps a value above max to max", () =>
    createRoot(dispose => {
      expect(clamp(() => 15, () => 0, () => 10)()).toBe(10);
      dispose();
    }));

  it("clamps a value below min to min", () =>
    createRoot(dispose => {
      expect(clamp(() => -5, () => 0, () => 10)()).toBe(0);
      dispose();
    }));

  it("keeps a value already within range unchanged", () =>
    createRoot(dispose => {
      expect(clamp(() => 7, () => 0, () => 10)()).toBe(7);
      dispose();
    }));

  it("updates when value signal changes", () => {
    const [val, setVal] = createSignal(5);
    const { result, dispose } = createRoot(d => ({
      result: clamp(val, () => 0, () => 10),
      dispose: d,
    }));
    expect(result()).toBe(5);
    setVal(15);
    flush();
    expect(result()).toBe(10);
    setVal(-3);
    flush();
    expect(result()).toBe(0);
    dispose();
  });

  it("updates when max signal changes", () => {
    const [max, setMax] = createSignal(10);
    const { result, dispose } = createRoot(d => ({
      result: clamp(() => 5, () => 0, max),
      dispose: d,
    }));
    expect(result()).toBe(5);
    setMax(3); // value 5 now above new max
    flush();
    expect(result()).toBe(3);
    dispose();
  });

  it("updates when min signal changes", () => {
    const [min, setMin] = createSignal(0);
    const { result, dispose } = createRoot(d => ({
      result: clamp(() => 5, min, () => 10),
      dispose: d,
    }));
    expect(result()).toBe(5);
    setMin(8); // value 5 now below new min
    flush();
    expect(result()).toBe(8);
    dispose();
  });
});

// ─── ARRAY ──────────────────────────────────────────────────────────────────

describe("push()", () => {
  it("appends items to the array", () =>
    createRoot(dispose => {
      expect(push(() => [1, 2], () => 3, () => 4)()).toEqual([1, 2, 3, 4]);
      dispose();
    }));

  it("does not mutate the original array", () =>
    createRoot(dispose => {
      const original = [1, 2, 3];
      push(() => original, () => 4)();
      expect(original).toEqual([1, 2, 3]);
      dispose();
    }));

  it("updates when list or item signals change", () => {
    const [list, setList] = createSignal([4, 3, 2, 1]);
    const [item, setItem] = createSignal(0);
    const { result, dispose } = createRoot(d => ({
      result: sort(push(list, item), compare),
      dispose: d,
    }));
    expect(result()).toEqual([0, 1, 2, 3, 4]);
    setList([1, 2, 3, 5, 4]);
    setItem(1);
    flush();
    expect(result()).toEqual([1, 1, 2, 3, 4, 5]);
    dispose();
  });
});

describe("drop()", () => {
  it("drops the first element by default", () =>
    createRoot(dispose => {
      expect(drop(() => [1, 2, 3, 4])()).toEqual([2, 3, 4]);
      dispose();
    }));

  it("drops n elements from the front", () =>
    createRoot(dispose => {
      expect(drop(() => [1, 2, 3, 4], 2)()).toEqual([3, 4]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3, 4, 5]);
    const { result, dispose } = createRoot(d => ({ result: drop(list, 2), dispose: d }));
    expect(result()).toEqual([3, 4, 5]);
    setList([10, 20, 30]);
    flush();
    expect(result()).toEqual([30]);
    dispose();
  });
});

describe("dropRight()", () => {
  it("drops the last element by default", () =>
    createRoot(dispose => {
      expect(dropRight(() => [1, 2, 3, 4])()).toEqual([1, 2, 3]);
      dispose();
    }));

  it("drops n elements from the end", () =>
    createRoot(dispose => {
      expect(dropRight(() => [1, 2, 3, 4], 2)()).toEqual([1, 2]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3, 4, 5]);
    const { result, dispose } = createRoot(d => ({ result: dropRight(list, 2), dispose: d }));
    expect(result()).toEqual([1, 2, 3]);
    setList([10, 20, 30]);
    flush();
    expect(result()).toEqual([10]);
    dispose();
  });
});

describe("filter()", () => {
  // The underlying immutable filter attaches a `.removed` count to the returned array.
  // Spread into a plain array before comparing to avoid property mismatch in toEqual.
  it("keeps items that match a predicate", () =>
    createRoot(dispose => {
      const result = filter(() => [1, 2, 3, 4, 5], n => n % 2 === 0)();
      expect([...result]).toEqual([2, 4]);
      expect(result.removed).toBe(3);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3, 4, 5, 6]);
    const { result, dispose } = createRoot(d => ({
      result: filter(list, n => n > 3),
      dispose: d,
    }));
    expect([...result()]).toEqual([4, 5, 6]);
    setList([1, 2, 10, 20]);
    flush();
    expect([...result()]).toEqual([10, 20]);
    dispose();
  });
});

describe("filterOut()", () => {
  // filterOut delegates to filter, so it also attaches a `.removed` property.
  it("removes all occurrences of the item", () =>
    createRoot(dispose => {
      const result = filterOut(() => [1, 2, 3, 2, 1], () => 2)();
      expect([...result]).toEqual([1, 3, 1]);
      expect(result.removed).toBe(2);
      dispose();
    }));

  it("updates when item signal changes", () => {
    const [item, setItem] = createSignal(2);
    const { result, dispose } = createRoot(d => ({
      result: filterOut(() => [1, 2, 3, 2, 1], item),
      dispose: d,
    }));
    expect([...result()]).toEqual([1, 3, 1]);
    setItem(1);
    flush();
    expect([...result()]).toEqual([2, 3, 2]);
    dispose();
  });
});

describe("sort()", () => {
  it("sorts with a compareFn", () =>
    createRoot(dispose => {
      expect(sort(() => [3, 1, 4, 1, 5], compare)()).toEqual([1, 1, 3, 4, 5]);
      dispose();
    }));

  it("does not mutate the original array", () =>
    createRoot(dispose => {
      const original = [3, 1, 2];
      sort(() => original, compare)();
      expect(original).toEqual([3, 1, 2]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([3, 1, 2]);
    const { result, dispose } = createRoot(d => ({ result: sort(list, compare), dispose: d }));
    expect(result()).toEqual([1, 2, 3]);
    setList([5, 4, 3, 2, 1]);
    flush();
    expect(result()).toEqual([1, 2, 3, 4, 5]);
    dispose();
  });
});

describe("map()", () => {
  it("maps items to new values", () =>
    createRoot(dispose => {
      expect(map(() => [1, 2, 3], n => n * 2)()).toEqual([2, 4, 6]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3]);
    const { result, dispose } = createRoot(d => ({
      result: map(list, n => n * 10),
      dispose: d,
    }));
    expect(result()).toEqual([10, 20, 30]);
    setList([4, 5]);
    flush();
    expect(result()).toEqual([40, 50]);
    dispose();
  });
});

describe("slice()", () => {
  it("extracts a range with start and end", () =>
    createRoot(dispose => {
      expect(slice(() => [1, 2, 3, 4, 5], 1, 4)()).toEqual([2, 3, 4]);
      dispose();
    }));

  it("slices to end when end is omitted", () =>
    createRoot(dispose => {
      expect(slice(() => [1, 2, 3, 4, 5], 2)()).toEqual([3, 4, 5]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([10, 20, 30, 40, 50]);
    const { result, dispose } = createRoot(d => ({ result: slice(list, 1, 3), dispose: d }));
    expect(result()).toEqual([20, 30]);
    setList([1, 2, 3, 4, 5]);
    flush();
    expect(result()).toEqual([2, 3]);
    dispose();
  });
});

describe("splice()", () => {
  it("removes elements at a position", () =>
    createRoot(dispose => {
      expect(splice(() => [1, 2, 3, 4, 5], () => 1, () => 2)()).toEqual([1, 4, 5]);
      dispose();
    }));

  it("replaces elements", () =>
    createRoot(dispose => {
      expect(splice(() => [1, 2, 3], () => 1, () => 1, () => 99)()).toEqual([1, 99, 3]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3, 4, 5]);
    const { result, dispose } = createRoot(d => ({
      result: splice(list, () => 0, () => 2),
      dispose: d,
    }));
    expect(result()).toEqual([3, 4, 5]);
    setList([10, 20, 30, 40]);
    flush();
    expect(result()).toEqual([30, 40]);
    dispose();
  });
});

describe("remove()", () => {
  it("removes the first occurrence of the item", () =>
    createRoot(dispose => {
      expect(remove(() => [1, 2, 3, 2, 1], () => 2)()).toEqual([1, 3, 2, 1]);
      dispose();
    }));

  it("updates when item signal changes", () => {
    const [item, setItem] = createSignal(1);
    const { result, dispose } = createRoot(d => ({
      result: remove(() => [1, 2, 1, 3], item),
      dispose: d,
    }));
    expect(result()).toEqual([2, 1, 3]);
    setItem(2);
    flush();
    expect(result()).toEqual([1, 1, 3]);
    dispose();
  });
});

describe("removeItems()", () => {
  // removeItems removes the FIRST occurrence of each provided item (not all occurrences).
  // Once a provided item is matched once, subsequent occurrences in the list are kept.
  it("removes the first occurrence of each provided item", () =>
    createRoot(dispose => {
      expect(removeItems(() => [1, 2, 3, 2, 1], () => 1, () => 2)()).toEqual([3, 2, 1]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([1, 2, 3, 4, 5]);
    const { result, dispose } = createRoot(d => ({
      result: removeItems(list, () => 2, () => 4),
      dispose: d,
    }));
    expect(result()).toEqual([1, 3, 5]);
    setList([2, 2, 4, 6]);
    flush();
    expect(result()).toEqual([2, 6]); // first 2 removed, first 4 removed; second 2 kept
    dispose();
  });
});

describe("concat()", () => {
  it("concatenates two arrays", () =>
    createRoot(dispose => {
      expect(concat(() => [1, 2], () => [3, 4])()).toEqual([1, 2, 3, 4]);
      dispose();
    }));

  it("concatenates more than two arrays", () =>
    createRoot(dispose => {
      expect(concat(() => [1], () => [2], () => [3])()).toEqual([1, 2, 3]);
      dispose();
    }));

  it("updates when any signal changes", () => {
    const [a, setA] = createSignal([1, 2]);
    const [b, setB] = createSignal([3, 4]);
    const { result, dispose } = createRoot(d => ({ result: concat(a, b), dispose: d }));
    expect(result()).toEqual([1, 2, 3, 4]);
    setA([10]);
    flush();
    expect(result()).toEqual([10, 3, 4]);
    setB([20, 30]);
    flush();
    expect(result()).toEqual([10, 20, 30]);
    dispose();
  });
});

describe("flatten()", () => {
  it("flattens one level deep", () =>
    createRoot(dispose => {
      expect(flatten(() => [[1, 2], [3, 4]])()).toEqual([1, 2, 3, 4]);
      dispose();
    }));

  it("flattens deeply (recursive, not just one level)", () =>
    createRoot(dispose => {
      expect(flatten(() => [[1, [2]], [3]])()).toEqual([1, 2, 3]);
      dispose();
    }));

  it("updates when list signal changes", () => {
    const [list, setList] = createSignal([[1, 2], [3, 4]]);
    const { result, dispose } = createRoot(d => ({ result: flatten(list), dispose: d }));
    expect(result()).toEqual([1, 2, 3, 4]);
    setList([[5, 6], [7]]);
    flush();
    expect(result()).toEqual([5, 6, 7]);
    dispose();
  });
});

describe("filterInstance()", () => {
  it("keeps only instances of the specified class", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      const list = [1, "hello", el, "world"];
      expect(filterInstance(() => list, Element)()).toEqual([el]);
      dispose();
    }));

  it("keeps instances of any of multiple classes", () =>
    createRoot(dispose => {
      const num = 12345;
      const el = document.createElement("div");
      const svg = document.createElement("svg");
      const list = [num, "hello", el, svg, "world", null, undefined, NaN];
      const result = filterInstance(() => list, Element, Number)();
      expect(result).toEqual([num, el, svg]);
      dispose();
    }));

  it("does not mutate the original array", () =>
    createRoot(dispose => {
      const list = [1, "two", 3];
      const copy = [...list];
      filterInstance(() => list, Number)();
      expect(list).toEqual(copy);
      dispose();
    }));
});

describe("filterOutInstance()", () => {
  it("removes instances of the specified class", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      const list = [1, "hello", el, 2, "world"];
      expect(filterOutInstance(() => list, Element)()).toEqual([1, "hello", 2, "world"]);
      dispose();
    }));

  it("removes instances of any of multiple classes", () =>
    createRoot(dispose => {
      const num = 12345;
      const el = document.createElement("div");
      const svg = document.createElement("svg");
      const list = [num, "hello", el, svg, "world", null, undefined, NaN];
      const result = filterOutInstance(() => list, Element, Number)();
      expect(result).toEqual(["hello", "world"]);
      dispose();
    }));
});

// ─── OBJECT ─────────────────────────────────────────────────────────────────

describe("omit()", () => {
  it("omits a single key", () =>
    createRoot(dispose => {
      expect(omit(() => ({ a: 1, b: 2, c: 3 }), "b")()).toEqual({ a: 1, c: 3 });
      dispose();
    }));

  it("omits multiple keys", () =>
    createRoot(dispose => {
      expect(omit(() => ({ a: 1, b: 2, c: 3, d: 4 }), "a", "c")()).toEqual({ b: 2, d: 4 });
      dispose();
    }));

  it("updates when object signal changes", () => {
    const [obj, setObj] = createSignal({ x: 1, y: 2, z: 3 });
    const { result, dispose } = createRoot(d => ({ result: omit(obj, "y"), dispose: d }));
    expect(result()).toEqual({ x: 1, z: 3 });
    setObj({ x: 10, y: 20, z: 30 });
    flush();
    expect(result()).toEqual({ x: 10, z: 30 });
    dispose();
  });
});

describe("pick()", () => {
  it("picks specified keys", () =>
    createRoot(dispose => {
      expect(pick(() => ({ a: 1, b: 2, c: 3 }), "a", "c")()).toEqual({ a: 1, c: 3 });
      dispose();
    }));

  it("updates when object signal changes", () => {
    const [obj, setObj] = createSignal({ x: 1, y: 2, z: 3 });
    const { result, dispose } = createRoot(d => ({ result: pick(obj, "x", "z"), dispose: d }));
    expect(result()).toEqual({ x: 1, z: 3 });
    setObj({ x: 10, y: 20, z: 30 });
    flush();
    expect(result()).toEqual({ x: 10, z: 30 });
    dispose();
  });
});

describe("get()", () => {
  it("reads a top-level key", () =>
    createRoot(dispose => {
      expect(get(() => ({ a: 1, b: 2 }), "a")()).toBe(1);
      dispose();
    }));

  it("reads a two-level key path", () =>
    createRoot(dispose => {
      expect(get(() => ({ user: { name: "Alice" } }), "user", "name")()).toBe("Alice");
      dispose();
    }));

  it("reads a three-level key path", () =>
    createRoot(dispose => {
      const obj = { a: { b: { c: 42 } } };
      expect(get(() => obj, "a", "b", "c")()).toBe(42);
      dispose();
    }));

  it("updates when object signal changes", () => {
    const [obj, setObj] = createSignal({ name: "Alice", age: 30 });
    const { result, dispose } = createRoot(d => ({ result: get(obj, "name"), dispose: d }));
    expect(result()).toBe("Alice");
    setObj({ name: "Bob", age: 25 });
    flush();
    expect(result()).toBe("Bob");
    dispose();
  });
});

describe("merge()", () => {
  it("merges two objects, later keys override earlier", () =>
    createRoot(dispose => {
      expect(merge(() => ({ a: 1, b: 2 }), () => ({ b: 99, c: 3 }))()).toEqual({
        a: 1,
        b: 99,
        c: 3,
      });
      dispose();
    }));

  it("merges three objects", () =>
    createRoot(dispose => {
      expect(merge(() => ({ a: 1 }), () => ({ b: 2 }), () => ({ c: 3 }))()).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
      dispose();
    }));

  it("updates when any signal changes", () => {
    const [overrides, setOverrides] = createSignal({ size: 16 });
    const { result, dispose } = createRoot(d => ({
      result: merge(() => ({ color: "blue", size: 12 }), overrides),
      dispose: d,
    }));
    expect(result()).toEqual({ color: "blue", size: 16 });
    setOverrides({ size: 24 });
    flush();
    expect(result()).toEqual({ color: "blue", size: 24 });
    dispose();
  });
});

// ─── UPDATE ─────────────────────────────────────────────────────────────────

describe("update()", () => {
  it("sets a top-level key to a plain value", () =>
    createRoot(dispose => {
      expect(update(() => ({ a: 1, b: 2 }), "a", 99)()).toEqual({ a: 99, b: 2 });
      dispose();
    }));

  it("sets a nested key path", () =>
    createRoot(dispose => {
      expect(
        update(() => ({ user: { name: "Alice", age: 30 } }), "user", "name", "Bob")(),
      ).toEqual({ user: { name: "Bob", age: 30 } });
      dispose();
    }));

  it("does not mutate the original object", () =>
    createRoot(dispose => {
      const original = { a: 1, b: 2 };
      update(() => original, "a", 99)();
      expect(original).toEqual({ a: 1, b: 2 });
      dispose();
    }));

  it("updates when the object signal changes", () => {
    const [obj, setObj] = createSignal({ x: 10, y: 2 });
    const { result, dispose } = createRoot(d => ({
      result: update(obj, "y", 99),
      dispose: d,
    }));
    expect(result()).toEqual({ x: 10, y: 99 });
    setObj({ x: 20, y: 5 });
    flush();
    expect(result()).toEqual({ x: 20, y: 99 });
    dispose();
  });

  it("supports a key accessor that updates reactively", () => {
    const [key, setKey] = createSignal<"a" | "b">("a");
    const { result, dispose } = createRoot(d => ({
      result: update(() => ({ a: 1, b: 2 }), key, 99),
      dispose: d,
    }));
    expect(result()).toEqual({ a: 99, b: 2 });
    setKey("b");
    flush();
    expect(result()).toEqual({ a: 1, b: 99 });
    dispose();
  });
});
