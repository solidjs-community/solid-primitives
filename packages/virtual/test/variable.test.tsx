import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";

import { createVirtualList, VirtualList } from "../src/index.jsx";

const LIST = Array.from({ length: 100 }, (_, i) => i);
const scrollEvent = (el: Element) => ({ ...new Event("scroll"), target: el }) as unknown as Event;

// row i is 10px tall for even i, 30px tall for odd i => offsets 0,10,40,50,80,90,...
const heightOf = (i: number) => (i % 2 === 0 ? 10 : 30);
const offsetOf = (i: number) => {
  let sum = 0;
  for (let k = 0; k < i; k++) sum += heightOf(k);
  return sum;
};

const scrollTo = (onScroll: (e: Event) => void, top: number) => {
  const el = document.createElement("div");
  el.scrollTop = top;
  onScroll(scrollEvent(el));
  flush();
  return el;
};

describe("createVirtualList with a rowHeight function", () => {
  test("computes total height, viewerTop and offsets from per-row heights", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 50,
        rowHeight: heightOf,
        overscanCount: 1,
      });
      expect(virtual().containerHeight).toBe(offsetOf(100));
      expect(virtual().firstIndex).toBe(0);
      expect(virtual().viewerTop).toBe(0);
      // rows 0..2 start before 50, +1 overscan => 0..3
      expect(virtual().lastIndex).toBe(3);
      expect(virtual().offsets).toEqual([0, 10, 40, 50]);
      expect(helpers.getRowOffset(3)).toBe(50);
      expect(helpers.getRowOffset(100)).toBe(offsetOf(100));
      expect(helpers.getRowOffset(1000)).toBe(offsetOf(100));
      expect(helpers.getRowHeight(1)).toBe(30);
      dispose();
    }));

  test("finds the visible range with binary search while scrolling", () =>
    createRoot(dispose => {
      const [virtual, onScroll] = createVirtualList({
        items: LIST,
        rootHeight: 50,
        rowHeight: heightOf,
      });
      scrollTo(onScroll, 45); // inside row 2 (40..50)
      // visible rows: 2 (40..50), 3 (50..80), 4 (80..90) starts < 95 => rows 2,3,4,5? 5 starts at 90 < 95
      expect(virtual().firstIndex).toBe(1); // 2 - overscan
      expect(virtual().viewerTop).toBe(10);
      expect(virtual().lastIndex).toBe(6); // rows with start < 95 are 0..5 => +1
      expect(virtual().visibleItems).toEqual([1, 2, 3, 4, 5, 6]);
      expect(virtual().offsets[0]).toBe(10);
      dispose();
    }));

  test("a row boundary exactly at the viewport top starts at that row", () =>
    createRoot(dispose => {
      const [virtual, onScroll] = createVirtualList({
        items: LIST,
        rootHeight: 20,
        rowHeight: heightOf,
        overscanCount: 1,
      });
      scrollTo(onScroll, 40); // row 2 starts at 40
      expect(virtual().firstIndex).toBe(1);
      dispose();
    }));

  test("overscanCount widens the rendered window", () =>
    createRoot(dispose => {
      const [virtual, onScroll] = createVirtualList({
        items: LIST,
        rootHeight: 20,
        rowHeight: heightOf,
        overscanCount: 3,
      });
      scrollTo(onScroll, 40);
      expect(virtual().firstIndex).toBe(0); // 2 - 3 clamped
      expect(virtual().lastIndex).toBe(6); // rows start<60: 0..3 => end 4, +3 => 7, last 6
      dispose();
    }));

  test("handles the end of the list and empty lists", () =>
    createRoot(dispose => {
      const [virtual, onScroll] = createVirtualList({
        items: LIST,
        rootHeight: 50,
        rowHeight: heightOf,
      });
      scrollTo(onScroll, offsetOf(100) - 50);
      expect(virtual().lastIndex).toBe(99);
      expect(virtual().visibleItems.at(-1)).toBe(99);
      const [empty] = createVirtualList({ items: [], rootHeight: 50, rowHeight: heightOf });
      expect(empty().containerHeight).toBe(0);
      expect(empty().visibleItems).toEqual([]);
      expect(empty().lastIndex).toBeUndefined();
      dispose();
    }));

  test("a rowHeight accessor returning a function is supported and reactive", () => {
    const [mode, setMode] = createSignal<"tall" | "short">("short");
    let virtual!: ReturnType<typeof createVirtualList>[0];
    const dispose = createRoot(d => {
      [virtual] = createVirtualList({
        items: LIST,
        rootHeight: 50,
        rowHeight: () => (mode() === "tall" ? (_i: number) => 20 : (_i: number) => 10),
      });
      return d;
    });
    expect(virtual().containerHeight).toBe(1000);
    setMode("tall");
    flush();
    expect(virtual().containerHeight).toBe(2000);
    dispose();
  });

  test("a zero-arg rowHeight accessor still means a fixed height", () => {
    const [h, setH] = createSignal(10);
    let virtual!: ReturnType<typeof createVirtualList>[0];
    const dispose = createRoot(d => {
      [virtual] = createVirtualList({ items: LIST, rootHeight: 20, rowHeight: h });
      return d;
    });
    expect(virtual().containerHeight).toBe(1000);
    setH(20);
    flush();
    expect(virtual().containerHeight).toBe(2000);
    dispose();
  });

  test("fixed numeric heights produce the same range as an equivalent function", () =>
    createRoot(dispose => {
      const [fixed, onFixed] = createVirtualList({ items: LIST, rootHeight: 35, rowHeight: 10 });
      const [fn, onFn] = createVirtualList({
        items: LIST,
        rootHeight: 35,
        rowHeight: (_i: number) => 10,
      });
      for (const top of [0, 5, 10, 95, 333, 965]) {
        scrollTo(onFixed, top);
        scrollTo(onFn, top);
        expect(fn().firstIndex).toBe(fixed().firstIndex);
        expect(fn().lastIndex).toBe(fixed().lastIndex);
        expect(fn().viewerTop).toBe(fixed().viewerTop);
        expect(fn().containerHeight).toBe(fixed().containerHeight);
        expect(fn().offsets).toEqual(fixed().offsets);
      }
      dispose();
    }));

  test("fixed mode exposes offsets and getRowOffset", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 20,
        rowHeight: 10,
      });
      expect(virtual().offsets).toEqual([0, 10, 20]);
      expect(helpers.getRowOffset(7)).toBe(70);
      expect(helpers.getRowHeight(7)).toBe(10);
      dispose();
    }));

  test("reacts to items changing", () => {
    const [items, setItems] = createSignal<number[]>([0, 1, 2]);
    let virtual!: ReturnType<typeof createVirtualList>[0];
    const dispose = createRoot(d => {
      [virtual] = createVirtualList({ items, rootHeight: 50, rowHeight: heightOf });
      return d;
    });
    expect(virtual().containerHeight).toBe(50);
    setItems([0, 1, 2, 3]);
    flush();
    expect(virtual().containerHeight).toBe(80);
    dispose();
  });

  test("scrollToIndex moves the window and the given scroller", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 50,
        rowHeight: heightOf,
      });
      const el = document.createElement("div");
      helpers.scrollToIndex(4, el);
      flush();
      expect(el.scrollTop).toBe(80);
      expect(virtual().firstIndex).toBe(3);
      helpers.scrollToIndex(10_000, el);
      flush();
      expect(el.scrollTop).toBe(offsetOf(99));
      helpers.scrollToIndex(-5, el);
      flush();
      expect(el.scrollTop).toBe(0);
      dispose();
    }));
});

// ---- measured mode ----

type ROCallback = (entries: any[]) => void;
let observers: MockRO[] = [];
class MockRO {
  targets = new Set<Element>();
  disconnected = false;
  constructor(public cb: ROCallback) {
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }
}

const makeRow = (index: number, height: number) => {
  const el = document.createElement("div");
  el.setAttribute("data-index", String(index));
  el.getBoundingClientRect = () => ({ height }) as DOMRect;
  document.body.appendChild(el);
  return el;
};

describe("createVirtualList measured mode", () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal("ResizeObserver", MockRO);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  test("uses the estimate until rows are measured", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      expect(virtual().containerHeight).toBe(2000);
      expect(helpers.getRowHeight(3)).toBe(20);
      expect(virtual().lastIndex).toBe(5); // rows start<100: 0..4 => 5, +1 => 6 rows
      dispose();
    }));

  test("measured heights update offsets, total height and visible range", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      expect(virtual().containerHeight).toBe(2000);
      helpers.measureElement(makeRow(0, 60));
      helpers.measureElement(makeRow(1, 50));
      flush();
      expect(helpers.getRowHeight(0)).toBe(60);
      expect(helpers.getRowOffset(1)).toBe(60);
      expect(helpers.getRowOffset(2)).toBe(110);
      expect(helpers.getRowOffset(3)).toBe(130);
      expect(virtual().containerHeight).toBe(2000 + 40 + 30);
      // rows starting before 100: 0 (0), 1 (60) => end 2, +1 overscan
      expect(virtual().lastIndex).toBe(2);
      expect(virtual().offsets).toEqual([0, 60, 110]);
      dispose();
    }));

  test("ResizeObserver callbacks re-measure and ignore unchanged or zero heights", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      const row = makeRow(2, 20);
      helpers.measureElement(row);
      flush();
      expect(observers).toHaveLength(1);
      expect(observers[0]!.targets.has(row)).toBe(true);
      const total = virtual().containerHeight;

      observers[0]!.cb([{ target: row, borderBoxSize: [{ blockSize: 45 }], contentRect: {} }]);
      flush();
      expect(helpers.getRowHeight(2)).toBe(45);
      expect(virtual().containerHeight).toBe(total + 25);

      observers[0]!.cb([{ target: row, borderBoxSize: [{ blockSize: 0 }], contentRect: {} }]);
      flush();
      expect(helpers.getRowHeight(2)).toBe(45);

      // falls back to contentRect when borderBoxSize is missing
      observers[0]!.cb([{ target: row, contentRect: { height: 30 } }]);
      flush();
      expect(helpers.getRowHeight(2)).toBe(30);
      dispose();
    }));

  test("an explicit index wins over data-index and disconnected elements are dropped", () =>
    createRoot(dispose => {
      const [, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      const row = makeRow(0, 33);
      helpers.measureElement(row, 5);
      flush();
      expect(helpers.getRowHeight(5)).toBe(33);
      expect(helpers.getRowHeight(0)).toBe(20);

      row.remove();
      observers[0]!.cb([{ target: row, borderBoxSize: [{ blockSize: 99 }], contentRect: {} }]);
      flush();
      expect(helpers.getRowHeight(5)).toBe(33);
      expect(observers[0]!.targets.has(row)).toBe(false);
      dispose();
    }));

  test("unmeasureElement stops observing", () =>
    createRoot(dispose => {
      const [, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      const row = makeRow(1, 25);
      helpers.measureElement(row);
      helpers.unmeasureElement(row);
      expect(observers[0]!.targets.has(row)).toBe(false);
      helpers.measureElement(null);
      helpers.unmeasureElement(undefined);
      dispose();
    }));

  test("disconnects the observer on dispose", () => {
    createRoot(dispose => {
      const [, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      helpers.measureElement(makeRow(0, 20));
      dispose();
    });
    expect(observers[0]!.disconnected).toBe(true);
  });

  test("works without ResizeObserver (one-shot measure)", () => {
    vi.unstubAllGlobals();
    const original = (globalThis as any).ResizeObserver;
    delete (globalThis as any).ResizeObserver;
    createRoot(dispose => {
      const [, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      helpers.measureElement(makeRow(0, 70));
      flush();
      expect(helpers.getRowHeight(0)).toBe(70);
      dispose();
    });
    if (original) (globalThis as any).ResizeObserver = original;
  });

  test("measured heights beyond a shrunken list are dropped", () => {
    const [items, setItems] = createSignal<number[]>([0, 1, 2, 3]);
    let virtual!: ReturnType<typeof createVirtualList>[0];
    const dispose = createRoot(d => {
      let helpers;
      [virtual, , helpers] = createVirtualList({
        items,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      helpers.measureElement(makeRow(3, 100));
      return d;
    });
    flush();
    expect(virtual().containerHeight).toBe(160);
    setItems([0, 1]);
    flush();
    expect(virtual().containerHeight).toBe(40);
    setItems([0, 1, 2, 3]);
    flush();
    expect(virtual().containerHeight).toBe(80);
    dispose();
  });

  test("resetMeasurements clears and re-measures observed rows", () =>
    createRoot(dispose => {
      const [virtual, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        estimatedRowHeight: 20,
      });
      const row = makeRow(0, 50);
      helpers.measureElement(row);
      helpers.measureElement(makeRow(1, 50), 1);
      flush();
      expect(virtual().containerHeight).toBe(2000 + 60);
      row.remove();
      helpers.unmeasureElement(row);
      helpers.resetMeasurements();
      flush();
      expect(helpers.getRowHeight(0)).toBe(20);
      expect(helpers.getRowHeight(1)).toBe(50);
      dispose();
    }));

  test("a rowHeight function is used as the estimate and measurements override it", () =>
    createRoot(dispose => {
      const [, , helpers] = createVirtualList({
        items: LIST,
        rootHeight: 100,
        rowHeight: heightOf,
        estimatedRowHeight: 15,
      });
      expect(helpers.getRowHeight(1)).toBe(30);
      helpers.measureElement(makeRow(1, 44));
      flush();
      expect(helpers.getRowHeight(1)).toBe(44);
      expect(helpers.getRowOffset(2)).toBe(10 + 44);
      dispose();
    }));
});

describe("VirtualList", () => {
  const ROOT = document.createElement("div");
  afterEach(() => {
    ROOT.innerHTML = "";
  });

  test("accepts a rowHeight function", () => {
    const dispose = render(
      () => (
        <VirtualList each={LIST} rootHeight={50} rowHeight={heightOf}>
          {item => <div id={"v-" + item()} />}
        </VirtualList>
      ),
      ROOT,
    );
    expect(ROOT.querySelector("#v-3")).not.toBeNull();
    expect(ROOT.querySelector("#v-4")).toBeNull();
    const container = ROOT.querySelectorAll("div")[1] as HTMLElement;
    expect(container.style.height).toBe(`${offsetOf(100)}px`);
    dispose();
  });

  test("measured mode wraps rows and measures them", () => {
    observers = [];
    vi.stubGlobal("ResizeObserver", MockRO);
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({ height: 40 }) as DOMRect);
    const dispose = render(
      () => (
        <VirtualList each={LIST} rootHeight={100} estimatedRowHeight={20}>
          {item => <span id={"m-" + item()} />}
        </VirtualList>
      ),
      ROOT,
    );
    flush();
    const wrapper = ROOT.querySelector("#m-0")!.parentElement!;
    expect(wrapper.getAttribute("data-index")).toBe("0");
    // measured 40px rows shrink the window: rows with start < 100 are 0,1,2 => +1 overscan
    expect(ROOT.querySelector("#m-3")).not.toBeNull();
    expect(ROOT.querySelector("#m-4")).toBeNull();
    const container = ROOT.querySelectorAll("div")[1] as HTMLElement;
    expect(container.style.height).toBe(`${40 * 6 + 20 * 94}px`);
    dispose();
    expect(observers[0]!.disconnected).toBe(true);
    rect.mockRestore();
    vi.unstubAllGlobals();
  });
});
