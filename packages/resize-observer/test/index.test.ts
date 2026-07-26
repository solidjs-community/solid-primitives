import { describe, test, expect, afterAll } from "vitest";
import { createRoot, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  Size,
  createElementSize,
  createResizeObserver,
  getElementSize,
  getWindowSize,
} from "../src/index.js";

declare global {
  interface HTMLElement {
    __mock_size?: Size;
  }
}

const real_getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
HTMLElement.prototype.getBoundingClientRect = function (this) {
  return { ...real_getBoundingClientRect.call(this), ...this.__mock_size };
};

afterAll(() => {
  HTMLElement.prototype.getBoundingClientRect = real_getBoundingClientRect;
});

let _targets: Set<Element>;
let disconnect_count = 0;
class TestResizeObserver {
  _targets: Set<Element>;
  constructor() {
    this._targets = _targets;
  }
  observe(target: Element): void {
    this._targets.add(target);
  }
  unobserve(target: Element): void {
    this._targets.delete(target);
  }
  disconnect() {
    this._targets.clear();
    disconnect_count++;
  }
}
global.ResizeObserver = TestResizeObserver;

describe("createResizeObserver", () => {
  const div1 = document.createElement("div");
  const div2 = document.createElement("div");
  const div3 = document.createElement("div");

  test("disposes on cleanup", () =>
    createRoot(dispose => {
      _targets = new Set<Element>();
      createResizeObserver(div1, () => {});
      expect(disconnect_count).toBe(0);
      dispose();
      expect(disconnect_count).toBe(1);
    }));

  test("adds initial target", () => {
    const targets = (_targets = new Set<Element>());
    const dispose = createRoot(dispose => {
      createResizeObserver(div1, () => {});
      return dispose;
    });

    expect(targets.size).toBe(1);
    expect(targets.has(div1)).toBeTruthy();
    dispose();
    expect(targets.size).toBe(0);
  });

  test("adds initial targets", () => {
    const targets = (_targets = new Set<Element>());
    const dispose = createRoot(dispose => {
      createResizeObserver([div1, div2], () => {});
      return dispose;
    });
    expect(targets.size).toBe(2);
    expect(targets.has(div1)).toBeTruthy();
    expect(targets.has(div2)).toBeTruthy();
    dispose();
    expect(targets.size).toBe(0);
  });

  test("observes signal targets", () => {
    const targets = (_targets = new Set<Element>());
    const { dispose, setRefs } = createRoot(dispose => {
      const [refs, setRefs] = createSignal([div1]);
      createResizeObserver(refs, () => {});
      expect(targets.size, "targets shouldn't be connected synchronously").toBe(0);
      return { dispose, setRefs };
    });

    expect(targets.size).toBe(1);
    expect(targets.has(div1)).toBeTruthy();

    setRefs([div2, div3]);
    expect(targets.size).toBe(2);
    expect(targets.has(div2)).toBeTruthy();
    expect(targets.has(div3)).toBeTruthy();

    dispose();
  });

  test("observes store top-level targets", () => {
    const targets = (_targets = new Set<Element>());
    const { dispose, setRefs } = createRoot(dispose => {
      const [refs, setRefs] = createStore([div1]);
      createResizeObserver(refs, () => {});
      expect(targets.size, "targets shouldn't be connected synchronously").toBe(0);
      return { dispose, setRefs };
    });

    expect(targets.size).toBe(1);
    expect(targets.has(div1)).toBeTruthy();

    setRefs([div2, div3]);
    expect(targets.size).toBe(2);
    expect(targets.has(div2)).toBeTruthy();
    expect(targets.has(div3)).toBeTruthy();

    dispose();
  });
});

describe("getWindowSize", () => {
  test("returns window size", () => {
    // values predefined by jsdom
    expect(getWindowSize()).toEqual({ width: 1024, height: 768 });
  });
});

describe("getElementSize", () => {
  test("returns window size", () => {
    expect(getElementSize(document.createElement("div"))).toEqual({
      width: 0,
      height: 0,
      clientWidth: 0,
      clientHeight: 0,
    });
    expect(getElementSize(undefined)).toEqual({
      width: null,
      height: null,
      clientWidth: null,
      clientHeight: null,
    });
  });
});

describe("createElementSize", () => {
  const div = document.createElement("div");
  div.__mock_size = { width: 100, height: 200 };

  test("will return element size immediately", () => {
    createRoot(dispose => {
      const { width, height } = createElementSize(div);
      expect(width).toBe(100);
      expect(height).toBe(200);
      dispose();
    });
  });

  test("will get signal size on mount", () => {
    createRoot(dispose => {
      const size = createElementSize(() => div);
      expect(size.width).toBe(null);
      expect(size.height).toBe(null);

      onMount(() => {
        expect(size.width).toBe(100);
        expect(size.height).toBe(200);
        dispose();
      });
    });
  });
});
