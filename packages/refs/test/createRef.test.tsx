/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  describe,
  it,
  expect,
  vi,
  afterAll,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";
import { createRoot } from "solid-js";
import { createRef, RefRef } from "../src/createRef";

function newDiv() {
  return document.createElement("div");
}

/* ---------------------------------------------------------------- *\
 * 1. Basic behaviours
\* ---------------------------------------------------------------- */

describe("createRef – basic", () => {
  it("fires persistent listener on every change", () =>
    createRoot(dispose => {
      const spy = vi.fn();
      const { setter, addEventOnChange } = createRef<HTMLDivElement>();

      addEventOnChange(spy, "spy"); // once = false (default)

      setter(newDiv());
      setter(newDiv());
      expect(spy).toHaveBeenCalledTimes(2);
      dispose();
    }));

  it("fires `once` listener only once", () =>
    createRoot(dispose => {
      const spy = vi.fn();
      const { setter } = createRef<HTMLDivElement>(spy, true);
      setter(newDiv());
      setter(newDiv());
      expect(spy).toHaveBeenCalledTimes(1);
      dispose();
    }));

  it("element() always returns current element", () =>
    createRoot(dispose => {
      const { setter, element } = createRef<HTMLDivElement>();
      const el1 = newDiv();
      const el2 = newDiv();
      setter(el1);
      expect(element()).toBe(el1);
      setter(el2);
      expect(element()).toBe(el2);
      dispose();
    }));
});

/* ---------------------------------------------------------------- *\
 * 2. Listeners add/remove after mount
\* ---------------------------------------------------------------- */

describe("createRef – dynamic listeners", () => {
  it("listener added AFTER mount fires on next change", () =>
    createRoot(dispose => {
      const spy = vi.fn();
      const { setter, addEventOnChange } = createRef<HTMLDivElement>();

      setter(newDiv()); // mount ― no listener yet
      addEventOnChange(spy, "late");
      setter(newDiv()); // change ― should trigger
      expect(spy).toHaveBeenCalledTimes(1);
      dispose();
    }));

  it("removeEventOnChange prevents future calls", () =>
    createRoot(dispose => {
      const spy = vi.fn();
      const { setter, addEventOnChange, removeEventOnChange } =
        createRef<HTMLDivElement>();

      addEventOnChange(spy, "x");
      setter(newDiv());
      removeEventOnChange("x");
      setter(newDiv());
      expect(spy).toHaveBeenCalledTimes(1);
      dispose();
    }));
});

/* ---------------------------------------------------------------- *\
 * 3. cleanup() variations
\* ---------------------------------------------------------------- */

describe("createRef – cleanup()", () => {
  it("eventsOnly=true keeps element intact", () =>
    createRoot(dispose => {
      const { setter, element, cleanup } = createRef<HTMLDivElement>();
      const el = newDiv();
      setter(el);
      cleanup(true, false, true); // remove events only
      expect(element()).toBe(el);
      dispose();
    }));

  it("cleanup(false) resets element", () =>
    createRoot(dispose => {
      const { setter, element, cleanup } = createRef<HTMLDivElement>();
      setter(newDiv());
      cleanup(); // default clears element + events
      expect(element()).toBeUndefined();
      dispose();
    }));

  it("cleanup throws on incompatible params", () =>
    createRoot(dispose => {
      const { cleanup } = createRef();
      expect(() => cleanup(false, false, true)).toThrow();
      dispose();
    }));
});

/* ---------------------------------------------------------------- *\
 * 4. RefRef composition
\* ---------------------------------------------------------------- */

describe("RefRef", () => {
  it("calls both refs in order", () => {
    const log: string[] = [];
    const a = (el?: HTMLElement) => log.push("a");
    const b = (el?: HTMLElement) => log.push("b");
    const combo = RefRef(a, b);
    combo(newDiv());
    expect(log).toEqual(["a", "b"]);
  });
});

/* ---------------------------------------------------------------- *\
 * 5. SSR fallback
\* ---------------------------------------------------------------- */

describe("createRef – SSR", () => {
  const origWindow = globalThis.window;
  beforeAll(() => {
    // @ts-expect-error – simulate SSR
    delete globalThis.window;
  });
  afterAll(() => {
    globalThis.window = origWindow;
  });

  it("returns noop object when window is undefined", () => {
    const ref = createRef();
    expect(ref.element()).toBeUndefined();
    expect(() => ref.setter(newDiv())).not.toThrow();
    expect(ref.cleanup()).toBeUndefined();
  });
});

/* ---------------------------------------------------------------- *\
 * 6. Stress test
\* ---------------------------------------------------------------- */

describe("createRef – stress", () => {
  it("handles 10k listeners without leaking", () =>
    createRoot(dispose => {
      const { setter, addEventOnChange, removeEventOnChange } =
        createRef<HTMLElement>();

      const listeners: Array<() => void> = [];
      for (let i = 0; i < 10_000; i++) {
        const id = `l${i}`;
        const fn = vi.fn();
        listeners.push(fn);
        addEventOnChange(fn, id);
      }

      setter(newDiv());
      listeners.forEach(fn => expect(fn).toHaveBeenCalledTimes(1));

      // remove half, change element again
      for (let i = 0; i < 5_000; i++) removeEventOnChange(`l${i}`);

      setter(newDiv());

      // first half should stay at 1, second half at 2
      listeners.forEach((fn, i) =>
        expect(fn).toHaveBeenCalledTimes(i < 5_000 ? 1 : 2),
      );

      dispose();
    }),
    { timeout: 5_000 }); // keep CI safe
});
