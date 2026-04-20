import { createRoot, createSignal, createEffect, flush } from "solid-js";
import { describe, test, expect, beforeEach } from "vitest";

import {
  makeIntersectionObserver,
  createIntersectionObserver,
  createViewportObserver,
  createVisibilityObserver,
  withOccurrence,
  withDirection,
} from "../src/index.js";

const intersectionObserverInstances: any[] = [];

const _getLastIOInstance = () =>
  intersectionObserverInstances[intersectionObserverInstances.length - 1] as IntersectionObserver;

const createMockIOEntry = ({
  target,
  isIntersecting = Math.random() > 0.5,
  boundingClientRect = target.getBoundingClientRect(),
}: {
  target: Element;
  isIntersecting?: boolean;
  boundingClientRect?: DOMRectReadOnly;
}): IntersectionObserverEntry => ({
  target,
  time: Date.now(),
  rootBounds: {} as any,
  isIntersecting,
  intersectionRect: {} as any,
  intersectionRatio: Math.random(),
  boundingClientRect,
});

class IntersectionObserver {
  public onChange: IntersectionObserverCallback;
  public options: IntersectionObserverInit;
  public elements: HTMLElement[] = [];
  readonly root = document;
  readonly rootMargin = "0";
  readonly thresholds = [0];
  constructor(onChange: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.onChange = onChange;
    this.options = options;
    intersectionObserverInstances.push(this);
  }
  disconnect() {
    this.elements = [];
  }
  observe(el: HTMLElement) {
    this.elements.push(el);
  }
  unobserve(el: HTMLElement) {
    for (let index; (index = this.elements.indexOf(el)) !== -1; ) {
      this.elements.splice(index, 1);
    }
  }
  takeRecords() {
    return this.elements.map(el => createMockIOEntry({ target: el }));
  }
  // simulates intersection change and calls onChange callback
  __TEST__onChange(entry: { isIntersecting?: boolean; boundingClientRect?: DOMRectReadOnly } = {}) {
    const entries = this.elements.map(el => createMockIOEntry({ target: el, ...entry }));
    this.onChange(entries, this);
  }
}
// @ts-ignore
global.IntersectionObserver = IntersectionObserver;

describe("makeIntersectionObserver", () => {
  let div!: HTMLDivElement;
  let img!: HTMLImageElement;

  beforeEach(() => {
    div = document.createElement("div");
    img = document.createElement("img");
  });

  test("creates a new IntersectionObserver instance", () => {
    const previousInstanceCount = intersectionObserverInstances.length;
    createRoot(dispose => {
      makeIntersectionObserver([div], () => {});
      dispose();
    });
    const newInstanceCount = intersectionObserverInstances.length;
    expect(previousInstanceCount + 1, "new instance was not created").toBe(newInstanceCount);
  });

  test("returns the created IntersectionObserver instance", () => {
    createRoot(dispose => {
      const { instance } = makeIntersectionObserver([], () => {});
      expect(
        intersectionObserverInstances[intersectionObserverInstances.length - 1],
        "returned instance doesn't match instance created",
      ).toBe(instance);

      dispose();
    });
  });

  test("options are passed to IntersectionObserver", () => {
    createRoot(dispose => {
      const options: IntersectionObserverInit = {
        threshold: 0.6,
        root: div,
        rootMargin: "10px 10px 10px 10px",
      };
      const { instance } = makeIntersectionObserver([], () => {}, options);

      expect(
        (instance as IntersectionObserver).options,
        "options in IntersectionObserver don't match",
      ).toBe(options);

      dispose();
    });
  });

  test("add function observes an element", () => {
    createRoot(dispose => {
      const { add, instance } = makeIntersectionObserver([], () => {});
      add(div);

      expect(
        (instance as IntersectionObserver).elements[0],
        "element wasn't added to the IntersectionObserver",
      ).toBe(div);

      dispose();
    });
  });

  test("remove function removes observed element", () => {
    createRoot(dispose => {
      const { add, instance, remove } = makeIntersectionObserver([], () => {});
      add(div);
      remove(div);

      expect(
        (instance as IntersectionObserver).elements.length,
        "element wasn't removed from the IntersectionObserver",
      ).toBe(0);

      dispose();
    });
  });

  test("start function observes initial elements", () => {
    createRoot(dispose => {
      const { start, instance, stop } = makeIntersectionObserver([div, img], () => {});

      expect(
        (instance as IntersectionObserver).elements.length,
        "elements in array were not added to the IntersectionObserver",
      ).toBe(2);

      stop();
      start();

      expect(
        (instance as IntersectionObserver).elements.length,
        "elements were not added to the IntersectionObserver on restart",
      ).toBe(2);

      const { instance: instance2 } = makeIntersectionObserver([div, img], () => {});

      expect(
        (instance2 as IntersectionObserver).elements.length,
        "elements passed with accessor were not added to the IntersectionObserver",
      ).toBe(2);

      dispose();
    });
  });

  test("stop function unobserves all elements", () => {
    createRoot(dispose => {
      const { instance, start, stop } = makeIntersectionObserver([div, img], () => {});
      start();
      stop();

      expect(
        (instance as IntersectionObserver).elements.length,
        "elements weren't removed from the IntersectionObserver",
      ).toBe(0);

      dispose();
    });
  });

  test("onChange callback", () => {
    createRoot(dispose => {
      let cbEntries!: IntersectionObserverEntry[];
      let cbInstance!: IntersectionObserver;
      const { instance } = makeIntersectionObserver([div, img], (entries, observer) => {
        cbEntries = entries;
        cbInstance = observer as IntersectionObserver;
      });
      (instance as IntersectionObserver).__TEST__onChange();
      expect(cbInstance, "IntersectionObserver instance is not passed to the callback").toBe(
        instance,
      );

      expect(cbEntries.length, "IntersectionObserver Entries are not passed to the callback").toBe(
        2,
      );
      expect(cbEntries[0].isIntersecting, "Entry is missing isIntersecting property").toBeTypeOf(
        "boolean",
      );
      expect(cbEntries[0].target, "Entry target doesn't match the correct element").toBe(div);
      dispose();
    });
  });

  test("add function works as a directive", () => {
    createRoot(dispose => {
      const el = document.createElement("div");
      const { add, instance } = makeIntersectionObserver([], e => {
        expect(e[0].target, "Element added to the IntersectionObserver").toBe(el);
      });
      const [props] = createSignal(true);
      // @ts-ignore
      add(el, props);

      (instance as IntersectionObserver).__TEST__onChange();

      dispose();
    });
  });
});

describe("createIntersectionObserver", () => {
  let div!: HTMLDivElement;
  let img!: HTMLImageElement;

  beforeEach(() => {
    div = document.createElement("div");
    img = document.createElement("img");
  });

  test("creates a new IntersectionObserver instance", () => {
    const previousInstanceCount = intersectionObserverInstances.length;
    createRoot(dispose => {
      createIntersectionObserver(() => [div]);
      dispose();
    });
    expect(intersectionObserverInstances.length).toBe(previousInstanceCount + 1);
  });

  test("returns a store array of entries", () => {
    createRoot(dispose => {
      const [entries] = createIntersectionObserver(() => [div, img]);
      expect(Array.isArray(entries)).toBe(true);
      dispose();
    });
  });

  test("store is updated when IO fires", () => {
    createRoot(dispose => {
      const [els] = createSignal([div]);
      const [entries] = createIntersectionObserver(els);
      const instance = _getLastIOInstance();

      // flush() lets the deferred element effect run so div is actually observed
      flush();

      instance.__TEST__onChange({ isIntersecting: true });
      flush();

      expect(entries.length).toBe(1);
      expect(entries[0]?.isIntersecting).toBe(true);

      instance.__TEST__onChange({ isIntersecting: false });
      flush();

      expect(entries[0]?.isIntersecting).toBe(false);

      dispose();
    });
  });

  test("each element occupies its own store slot", () => {
    createRoot(dispose => {
      const [entries] = createIntersectionObserver(() => [div, img]);
      const instance = _getLastIOInstance();

      flush(); // let the element effect observe both elements

      instance.__TEST__onChange({ isIntersecting: true });
      flush();

      expect(entries.length).toBe(2);
      expect(entries[0]?.target).toBe(div);
      expect(entries[1]?.target).toBe(img);
      // Each slot tracks its own element independently
      expect(entries[0]?.isIntersecting).toBe(true);
      expect(entries[1]?.isIntersecting).toBe(true);

      dispose();
    });
  });

  test("options are passed to IntersectionObserver", () => {
    createRoot(dispose => {
      const options: IntersectionObserverInit = { threshold: 0.5 };
      createIntersectionObserver(() => [div], options);
      const instance = _getLastIOInstance();
      expect(instance.options).toBe(options);
      dispose();
    });
  });

  test("isVisible throws before first observation, returns boolean after", () => {
    createRoot(dispose => {
      const [, isVisible] = createIntersectionObserver(() => [div]);
      const instance = _getLastIOInstance();

      flush(); // let the element effect observe div

      expect(() => isVisible(div), "should throw NotReadyError before first IO").toThrow();

      instance.__TEST__onChange({ isIntersecting: true });
      flush();

      expect(isVisible(div), "should return true after intersecting").toBe(true);

      instance.__TEST__onChange({ isIntersecting: false });
      flush();

      expect(isVisible(div), "should return false when not intersecting").toBe(false);

      dispose();
    });
  });
});

describe("createViewportObserver", () => {
  let div!: HTMLDivElement;
  let img!: HTMLImageElement;
  let span!: HTMLSpanElement;

  beforeEach(() => {
    div = document.createElement("div");
    img = document.createElement("img");
    span = document.createElement("span");
  });

  test("creates a new IntersectionObserver instance", () => {
    const previousInstanceCount = intersectionObserverInstances.length;
    createRoot(dispose => {
      createViewportObserver();
      dispose();
    });
    const newInstanceCount = intersectionObserverInstances.length;
    expect(previousInstanceCount + 1, "new instance was not created").toBe(newInstanceCount);
  });

  test("returns the created IntersectionObserver instance", () => {
    createRoot(dispose => {
      const [, { instance }] = createViewportObserver();

      expect(
        intersectionObserverInstances[intersectionObserverInstances.length - 1],
        "returned instance doesn't match instance created",
      ).toBe(instance);

      dispose();
    });
  });

  test("options are passed to IntersectionObserver", () => {
    createRoot(dispose => {
      const options: IntersectionObserverInit = {
        threshold: 0.6,
        root: div,
        rootMargin: "10px 10px 10px 10px",
      };
      const [, { instance }] = createViewportObserver(options);

      expect(
        (instance as IntersectionObserver).options,
        "options in IntersectionObserver don't match",
      ).toBe(options);

      dispose();
    });
  });

  test("add function observes an element", () => {
    createRoot(dispose => {
      const [add, { instance }] = createViewportObserver();
      add(div, () => {});

      expect(
        (instance as IntersectionObserver).elements[0],
        "element wasn't added to the IntersectionObserver",
      ).toBe(div);

      dispose();
    });
  });

  test("remove function removes observed element", () => {
    createRoot(dispose => {
      const [add, { instance, remove }] = createViewportObserver();
      add(div, () => {});
      remove(div);

      expect(
        (instance as IntersectionObserver).elements.length,
        "element wasn't removed from the IntersectionObserver",
      ).toBe(0);

      dispose();
    });
  });

  test("start function observes initial elements", () => {
    createRoot(dispose => {
      const [, { start, instance, stop }] = createViewportObserver([div, img], () => {});
      start();

      expect(
        (instance as IntersectionObserver).elements.length,
        "elements in array were not added to the IntersectionObserver",
      ).toBe(2);

      stop();
      start();

      expect(
        (instance as IntersectionObserver).elements.length,
        "elements were not added to the IntersectionObserver on restart",
      ).toBe(2);

      const [, { start: start2, instance: instance2 }] = createViewportObserver([
        [div, () => {}],
        [img, () => {}],
      ]);
      start2();
      expect(
        (instance2 as IntersectionObserver).elements.length,
        "elements in array of tuples were not added to the IntersectionObserver",
      ).toBe(2);

      const [, { start: start3, instance: instance3 }] = createViewportObserver(
        () => [div, img],
        () => {},
      );
      start3();
      expect(
        (instance3 as IntersectionObserver).elements.length,
        "elements in array accessor were not added to the IntersectionObserver",
      ).toBe(2);

      const [, { start: start4, instance: instance4 }] = createViewportObserver(() => [
        [div, () => {}],
        [img, () => {}],
      ]);
      start4();
      expect(
        (instance4 as IntersectionObserver).elements.length,
        "elements in an accessor od array of tuples were not added to the IntersectionObserver",
      ).toBe(2);

      dispose();
    });
  });

  test("stop function unobserves all elements", () => {
    createRoot(dispose => {
      const [, { instance, start, stop }] = createViewportObserver([div, img], () => {});
      start();
      stop();
      expect(
        (instance as IntersectionObserver).elements.length,
        "elements weren't removed from the IntersectionObserver",
      ).toBe(0);

      dispose();
    });
  });

  test("calls onChange callback for initial elements with common callback", () => {
    createRoot(dispose => {
      const cbEntries: IntersectionObserverEntry[] = [];
      let cbInstance!: IntersectionObserver;
      const [, { instance, start }] = createViewportObserver([div, img], (entry, observer) => {
        cbEntries.push(entry);
        cbInstance = observer as IntersectionObserver;
      });
      start();
      (instance as IntersectionObserver).__TEST__onChange();
      expect(cbInstance, "IntersectionObserver instance is not passed to the callback").toBe(
        instance,
      );
      expect(cbEntries.length, "IntersectionObserver Entries are not passed to the callback").toBe(
        2,
      );
      expect(cbEntries[0].isIntersecting, "Entry is missing isIntersecting property").toBeTypeOf(
        "boolean",
      );
      expect(cbEntries[0].target, "Entry target doesn't match the correct element").toBe(div);
      dispose();
    });
  });

  test("calls onChange callback for elements with individual callbacks", () => {
    createRoot(dispose => {
      const cbEntries: Record<string, IntersectionObserverEntry> = {};
      const [add, { instance, start }] = createViewportObserver([
        [div, e => (cbEntries.div = e)],
        [img, e => (cbEntries.img = e)],
      ]);
      start();
      add(span, e => (cbEntries.span = e));

      (instance as IntersectionObserver).__TEST__onChange();

      expect(cbEntries.div.target, "First initial element doesn't match the entry target").toBe(
        div,
      );

      expect(cbEntries.img.target, "Second initial element doesn't match the entry target").toBe(
        img,
      );

      expect(cbEntries.span.target, "Added element doesn't match the entry target").toBe(span);

      dispose();
    });
  });

  test("add function works as a directive", () => {
    createRoot(dispose => {
      const el = document.createElement("div");
      const el2 = document.createElement("div");
      const [observe, { instance }] = createViewportObserver();

      let cbEntry: any;

      // the correct usage (plain accessor, since createSignal(fn) is the compute overload in Solid 2.0)
      const callback = (e: any) => (cbEntry = e);
      const props = () => callback;
      observe(el, props);

      // the incorrect usage (just shouldn't cause an error)
      const [props2] = createSignal(true);
      observe(el2, props2);

      (instance as IntersectionObserver).__TEST__onChange();

      expect(cbEntry?.target).toBe(el);

      dispose();
    });
  });

  test("add(callback) returns a ref callback for JSX ref usage", () => {
    createRoot(dispose => {
      const [add, { instance }] = createViewportObserver();
      let cbEntry: IntersectionObserverEntry | undefined;

      // curried form: add(callback) → (el) => void — used as ref={add(e => ...)}
      const refCb = add((e: IntersectionObserverEntry) => {
        cbEntry = e;
      });
      refCb(div); // simulate JSX ref binding

      expect(
        (instance as IntersectionObserver).elements[0],
        "element wasn't observed via ref callback",
      ).toBe(div);

      (instance as IntersectionObserver).__TEST__onChange({ isIntersecting: true });

      expect(cbEntry?.target, "callback should fire with correct target").toBe(div);
      expect(cbEntry?.isIntersecting).toBe(true);

      dispose();
    });
  });
});

describe("createVisibilityObserver", () => {
  let div!: HTMLDivElement;

  beforeEach(() => {
    div = document.createElement("div");
  });

  test("creates a new IntersectionObserver instance", () => {
    const previousInstanceCount = intersectionObserverInstances.length;
    createRoot(dispose => {
      createVisibilityObserver(div);
      dispose();
    });
    const newInstanceCount = intersectionObserverInstances.length;
    expect(previousInstanceCount + 1, "new instance was not created").toBe(newInstanceCount);
  });

  test("options are passed to IntersectionObserver", () => {
    createRoot(dispose => {
      const options: IntersectionObserverInit = {
        threshold: 0.6,
        root: div,
        rootMargin: "10px 10px 10px 10px",
      };
      createVisibilityObserver(div, options);
      const instance = _getLastIOInstance();

      expect(instance.options, "options in IntersectionObserver don't match").toBe(options);

      dispose();
    });
  });

  test("returns signal — pending until first observation", () => {
    createRoot(dispose => {
      const isVisible = createVisibilityObserver(div);

      expect(
        () => isVisible(),
        "should throw NotReadyError before first observation",
      ).toThrow();

      const isVisibleFalse = createVisibilityObserver(div, { initialValue: false });
      expect(isVisibleFalse(), "should return false with initialValue: false").toBe(false);

      const isVisibleTrue = createVisibilityObserver(div, { initialValue: true });
      expect(isVisibleTrue(), "should return true with initialValue: true").toBe(true);

      dispose();
    });
  });

  test("signal changes state when intersection changes", () => {
    createRoot(dispose => {
      const isVisible = createVisibilityObserver(div);
      const instance = _getLastIOInstance();

      instance.__TEST__onChange({ isIntersecting: true });
      flush();

      expect(isVisible(), "signal returns incorrect value").toBe(true);

      instance.__TEST__onChange({ isIntersecting: false });
      flush();

      expect(isVisible(), "signal returns incorrect value").toBe(false);

      dispose();
    });
  });

  test("setter callback dictates the signal value", () =>
    createRoot(dispose => {
      let goalValue = true;
      const isVisible = createVisibilityObserver(div, {}, _ => goalValue);
      const instance = _getLastIOInstance();

      instance.__TEST__onChange();
      flush();
      expect(isVisible()).toBe(true);

      instance.__TEST__onChange();
      flush();
      expect(isVisible()).toBe(true);

      goalValue = false;

      instance.__TEST__onChange();
      flush();
      expect(isVisible()).toBe(false);

      dispose();
    }));
});

describe("withOccurrence", () => {
  let div!: HTMLDivElement;

  beforeEach(() => {
    div = document.createElement("div");
  });

  test("returns correct occurrence value", () =>
    createRoot(dispose => {
      let lastOccurrence: any;
      createVisibilityObserver(
        div,
        {},
        withOccurrence((e, { occurrence }) => {
          lastOccurrence = occurrence;
          return e.isIntersecting;
        }),
      );
      const instance = _getLastIOInstance();

      instance.__TEST__onChange({ isIntersecting: false });
      expect(lastOccurrence).toBe("Outside");

      instance.__TEST__onChange({ isIntersecting: true });
      expect(lastOccurrence).toBe("Entering");

      instance.__TEST__onChange({ isIntersecting: true });
      expect(lastOccurrence).toBe("Inside");

      instance.__TEST__onChange({ isIntersecting: false });
      expect(lastOccurrence).toBe("Leaving");

      dispose();
    }));
});

describe("withDirection", () => {
  let div!: HTMLDivElement;

  beforeEach(() => {
    div = document.createElement("div");
  });

  test("returns correct direction value", () =>
    createRoot(dispose => {
      let lastDirectionX: any;
      let lastDirectionY: any;

      createVisibilityObserver(
        div,
        {},
        withDirection((e, { directionX, directionY }) => {
          lastDirectionX = directionX;
          lastDirectionY = directionY;
          return e.isIntersecting;
        }),
      );
      const instance = _getLastIOInstance();

      instance.__TEST__onChange({
        isIntersecting: false,
        boundingClientRect: {
          top: 0,
          left: 0,
        } as any,
      });
      expect(lastDirectionX).toBe("None");
      expect(lastDirectionY).toBe("None");

      instance.__TEST__onChange({
        isIntersecting: true,
        boundingClientRect: {
          top: 0,
          left: 0,
        } as any,
      });
      expect(lastDirectionX).toBe("None");
      expect(lastDirectionY).toBe("None");

      instance.__TEST__onChange({
        isIntersecting: true,
        boundingClientRect: {
          top: 15,
          left: 15,
        } as any,
      });
      expect(lastDirectionX).toBe("Left");
      expect(lastDirectionY).toBe("Top");

      instance.__TEST__onChange({
        isIntersecting: false,
        boundingClientRect: {
          top: -15,
          left: -15,
        } as any,
      });
      expect(lastDirectionX).toBe("Left");
      expect(lastDirectionY).toBe("Top");

      instance.__TEST__onChange({
        isIntersecting: false,
        boundingClientRect: {
          top: 15,
          left: 15,
        } as any,
      });
      expect(lastDirectionX).toBe("Right");
      expect(lastDirectionY).toBe("Bottom");

      dispose();
    }));
});
