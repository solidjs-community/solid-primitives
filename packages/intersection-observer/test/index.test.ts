import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import {
  makeIntersectionObserver,
  createViewportObserver,
  createVisibilityObserver
} from "../src";

const intersectionObserverInstances: any[] = [];

const createMockIOEntry = (
  target: Element,
  isIntersecting = Math.random() > 0.5
): IntersectionObserverEntry => ({
  target,
  time: Date.now(),
  rootBounds: {} as any,
  isIntersecting,
  intersectionRect: {} as any,
  intersectionRatio: Math.random(),
  boundingClientRect: target.getBoundingClientRect()
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
    return this.elements.map(el => createMockIOEntry(el));
  }
  // simulates intersection change and calls onChange callback
  __TEST__onChange(isIntersecting?: boolean) {
    const entries = this.elements.map(el => createMockIOEntry(el, isIntersecting));
    this.onChange(entries, this);
  }
}
// @ts-ignore
global.IntersectionObserver = IntersectionObserver;

const runOnChangeOnLastObserver = (payload: any) =>
  intersectionObserverInstances[intersectionObserverInstances.length - 1].onChange(payload);

const mio = suite("makeIntersectionObserver");

mio.before(context => {
  context.div = document.createElement("div");
  context.img = document.createElement("img");
});

mio("creates a new IntersectionObserver instance", ({ div }) => {
  const previousInstanceCount = intersectionObserverInstances.length;
  createRoot(dispose => {
    makeIntersectionObserver(div, console.log);
    dispose();
  });
  const newInstanceCount = intersectionObserverInstances.length;
  assert.is(previousInstanceCount + 1, newInstanceCount, "new instance was not created");
});

mio("returns the created IntersectionObserver instance", () => {
  createRoot(dispose => {
    const { instance } = makeIntersectionObserver([], () => {});
    assert.is(
      intersectionObserverInstances[intersectionObserverInstances.length - 1],
      instance,
      "returned instance doesn't match instance created"
    );

    dispose();
  });
});

mio("options are passed to IntersectionObserver", ({ div }) => {
  createRoot(dispose => {
    const options: IntersectionObserverInit = {
      threshold: 0.6,
      root: div,
      rootMargin: "10px 10px 10px 10px"
    };
    const { instance } = makeIntersectionObserver([], () => {}, options);

    assert.is(
      (instance as IntersectionObserver).options,
      options,
      "options in IntersectionObserver don't match"
    );

    dispose();
  });
});

mio("add function observes an element", ({ div }) => {
  createRoot(dispose => {
    const {add, instance } = makeIntersectionObserver([], () => {});
    add(div);

    assert.is(
      (instance as IntersectionObserver).elements[0],
      div,
      "element wasn't added to the IntersectionObserver"
    );

    dispose();
  });
});

mio("remove function removes observed element", ({ div }) => {
  createRoot(dispose => {
    const {add, instance, remove } = makeIntersectionObserver([], () => {});
    add(div);
    remove(div);

    assert.is(
      (instance as IntersectionObserver).elements.length,
      0,
      "element wasn't removed from the IntersectionObserver"
    );

    dispose();
  });
});

mio("start function observes initial elements", ({ div, img }) => {
  createRoot(dispose => {
    const { start, instance, stop } = makeIntersectionObserver([div, img], () => {});
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements in array were not added to the IntersectionObserver"
    );

    stop();
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements were not added to the IntersectionObserver on restart"
    );

    const { start: start2, instance: instance2 } = makeIntersectionObserver(
      [div, img],
      () => {}
    );
    start2();

    assert.is(
      (instance2 as IntersectionObserver).elements.length,
      2,
      "elements passed with accessor were not added to the IntersectionObserver"
    );

    dispose();
  });
});

mio("stop function unobserves all elements", ({ div, img }) => {
  createRoot(dispose => {
    const { instance, start, stop } = makeIntersectionObserver([div, img], () => {});
    start();
    stop();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      0,
      "elements weren't removed from the IntersectionObserver"
    );

    dispose();
  });
});

mio("onChange callback", ({ div, img }) => {
  createRoot(dispose => {
    let cbEntries!: IntersectionObserverEntry[];
    let cbInstance!: IntersectionObserver;
    const { instance, start } = makeIntersectionObserver([div, img], (entries, observer) => {
      cbEntries = entries;
      cbInstance = observer as IntersectionObserver;
    });
    start();
    (instance as IntersectionObserver).__TEST__onChange();
    assert.is(cbInstance, instance, "IntersectionObserver instance is not passed to the callback");
    assert.is(cbEntries.length, 2, "IntersectionObserver Entries are not passed to the callback");
    assert.type(cbEntries[0].isIntersecting, "boolean", "Entry is missing isIntersecting property");
    assert.is(cbEntries[0].target, div, "Entry target doesn't match the correct element");
    dispose();
  });
});

mio("add function works as a directive", () => {
  createRoot(dispose => {
    const el = document.createElement("div");
    const { add, instance } = makeIntersectionObserver([], e => {
      assert.is(e[0].target, el);
    });
    const [props] = createSignal(true);
    // @ts-ignore
    add(el, props);

    (instance as IntersectionObserver).__TEST__onChange();

    dispose();
  });
});

mio.run();

const cvo = suite("createViewportObserver");

cvo.before(context => {
  context.div = document.createElement("div");
  context.img = document.createElement("img");
  context.span = document.createElement("span");
});

cvo("creates a new IntersectionObserver instance", () => {
  const previousInstanceCount = intersectionObserverInstances.length;
  createRoot(dispose => {
    createViewportObserver();
    dispose();
  });
  const newInstanceCount = intersectionObserverInstances.length;
  assert.is(previousInstanceCount + 1, newInstanceCount, "new instance was not created");
});

cvo("returns the created IntersectionObserver instance", () => {
  createRoot(dispose => {
    const [, { instance }] = createViewportObserver();

    assert.is(
      intersectionObserverInstances[intersectionObserverInstances.length - 1],
      instance,
      "returned instance doesn't match instance created"
    );

    dispose();
  });
});

cvo("options are passed to IntersectionObserver", ({ div }) => {
  createRoot(dispose => {
    const options: IntersectionObserverInit = {
      threshold: 0.6,
      root: div,
      rootMargin: "10px 10px 10px 10px"
    };
    const [, { instance }] = createViewportObserver(options);

    assert.is(
      (instance as IntersectionObserver).options,
      options,
      "options in IntersectionObserver don't match"
    );

    dispose();
  });
});

cvo("add function observes an element", ({ div }) => {
  createRoot(dispose => {
    const [add, { instance }] = createViewportObserver();
    add(div, () => {});

    assert.is(
      (instance as IntersectionObserver).elements[0],
      div,
      "element wasn't added to the IntersectionObserver"
    );

    dispose();
  });
});

cvo("remove function removes observed element", ({ div }) => {
  createRoot(dispose => {
    const [add, { instance, remove }] = createViewportObserver();
    add(div, () => {});
    remove(div);

    assert.is(
      (instance as IntersectionObserver).elements.length,
      0,
      "element wasn't removed from the IntersectionObserver"
    );

    dispose();
  });
});

cvo("start function observes initial elements", ({ div, img }) => {
  createRoot(dispose => {
    const [, { start, instance, stop }] = createViewportObserver([div, img], () => {});
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements in array were not added to the IntersectionObserver"
    );

    stop();
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements were not added to the IntersectionObserver on restart"
    );
    const [, { start: start2, instance: instance2 }] = createViewportObserver([
      [div, () => {}],
      [img, () => {}]
    ]);
    start2();
    assert.is(
      (instance2 as IntersectionObserver).elements.length,
      2,
      "elements in array of tuples were not added to the IntersectionObserver"
    );
    const [, { start: start3, instance: instance3 }] = createViewportObserver(
      () => [div, img],
      () => {}
    );
    start3();
    assert.is(
      (instance3 as IntersectionObserver).elements.length,
      2,
      "elements in array accessor were not added to the IntersectionObserver"
    );
    const [, { start: start4, instance: instance4 }] = createViewportObserver(() => [
      [div, () => {}],
      [img, () => {}]
    ]);
    start4();
    assert.is(
      (instance4 as IntersectionObserver).elements.length,
      2,
      "elements in an accessor od array of tuples were not added to the IntersectionObserver"
    );
    dispose();
  });
});

cvo("stop function unobserves all elements", ({ div, img }) => {
  createRoot(dispose => {
    const [, { instance, start, stop }] = createViewportObserver([div, img], () => {});
    start();
    stop();
    assert.is(
      (instance as IntersectionObserver).elements.length,
      0,
      "elements weren't removed from the IntersectionObserver"
    );
    dispose();
  });
});

cvo("calls onChange callback for initial elements with common callback", ({ div, img }) => {
  createRoot(dispose => {
    const cbEntries: IntersectionObserverEntry[] = [];
    let cbInstance!: IntersectionObserver;
    const [, { instance, start }] = createViewportObserver([div, img], (entry, observer) => {
      cbEntries.push(entry);
      cbInstance = observer as IntersectionObserver;
    });
    start();
    (instance as IntersectionObserver).__TEST__onChange();
    assert.is(cbInstance, instance, "IntersectionObserver instance is not passed to the callback");
    assert.is(cbEntries.length, 2, "IntersectionObserver Entries are not passed to the callback");
    assert.type(cbEntries[0].isIntersecting, "boolean", "Entry is missing isIntersecting property");
    assert.is(cbEntries[0].target, div, "Entry target doesn't match the correct element");
    dispose();
  });
});

cvo("calls onChange callback for elements with individual callbacks", ({ div, img, span }) => {
  createRoot(dispose => {
    const cbEntries: Record<string, IntersectionObserverEntry> = {};
    const [add, { instance, start }] = createViewportObserver([
      [div, e => (cbEntries.div = e)],
      [img, e => (cbEntries.img = e)]
    ]);
    start();
    add(span, e => (cbEntries.span = e));

    (instance as IntersectionObserver).__TEST__onChange();

    assert.is(cbEntries.div.target, div, "First initial element doesn't match the entry target");

    assert.is(cbEntries.img.target, img, "Second initial element doesn't match the entry target");

    assert.is(cbEntries.span.target, span, "Added element doesn't match the entry target");

    dispose();
  });
});

cvo("add function works as a directive", () => {
  createRoot(dispose => {
    const el = document.createElement("div");
    const el2 = document.createElement("div");
    const [observe, { instance }] = createViewportObserver();

    let cbEntry: any;

    // the correct usage
    const [props] = createSignal((e: any) => (cbEntry = e));
    observe(el, props);

    // the incorrect usage (just shouldn't cause an error)
    const [props2] = createSignal(true);
    observe(el2, props2);

    (instance as IntersectionObserver).__TEST__onChange();

    assert.is(cbEntry?.target, el);

    dispose();
  });
});

cvo.run();

const cviso = suite("createVisibilityObserver");

cviso.before(context => {
  context.div = document.createElement("div");
});

cviso("creates a new IntersectionObserver instance", ({ div }) => {
  const previousInstanceCount = intersectionObserverInstances.length;
  createRoot(dispose => {
    createVisibilityObserver(div);
    dispose();
  });
  const newInstanceCount = intersectionObserverInstances.length;
  assert.is(previousInstanceCount + 1, newInstanceCount, "new instance was not created");
});

cviso("returns the created IntersectionObserver instance", ({ div }) => {
  createRoot(dispose => {
    const [, { instance }] = createVisibilityObserver(div);

    assert.is(
      intersectionObserverInstances[intersectionObserverInstances.length - 1],
      instance,
      "returned instance doesn't match instance created"
    );

    dispose();
  });
});

cviso("start function observes initial element", ({ div }) => {
  createRoot(dispose => {
    const [, { start, instance }] = createVisibilityObserver(div);
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      1,
      "elements in array were not added to the IntersectionObserver"
    );

    dispose();
  });
});

cviso("stop function unobserves element", ({ div }) => {
  createRoot(dispose => {
    const [, { instance, start, stop }] = createVisibilityObserver(div);
    start();
    stop();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      0,
      "elements weren't removed from the IntersectionObserver"
    );

    dispose();
  });
});

cviso("options are passed to IntersectionObserver", ({ div }) => {
  createRoot(dispose => {
    const options: IntersectionObserverInit = {
      threshold: 0.6,
      root: div,
      rootMargin: "10px 10px 10px 10px"
    };
    const [, { instance }] = createVisibilityObserver(div, options);

    assert.is(
      (instance as IntersectionObserver).options,
      options,
      "options in IntersectionObserver don't match"
    );

    dispose();
  });
});

cviso("returns signal", ({ div }) => {
  createRoot(dispose => {
    const [isVisible] = createVisibilityObserver(div);

    assert.is(isVisible(), false, "signal doesn't return default initialValue");

    const options = {
      initialValue: true
    };
    const [isVisible2] = createVisibilityObserver(div, options);

    assert.is(isVisible2(), true, "signal doesn't return custom initialValue");

    dispose();
  });
});

cviso("signal changes state when intersection changes", ({ div }) => {
  createRoot(dispose => {
    const [isVisible, { instance, start }] = createVisibilityObserver(div);
    start();

    (instance as IntersectionObserver).__TEST__onChange(true);

    assert.is(isVisible(), true, "signal returns incorrect value");

    (instance as IntersectionObserver).__TEST__onChange(false);

    assert.is(isVisible(), false, "signal returns incorrect value");

    dispose();
  });
});

cviso("once option stops inter-obs after vis change", ({ div }) => {
  createRoot(dispose => {
    const [isVisible, { instance, start }] = createVisibilityObserver(div, { once: true });
    start();

    (instance as IntersectionObserver).__TEST__onChange(true);
    assert.is(isVisible(), true, "signal returns incorrect value");

    (instance as IntersectionObserver).__TEST__onChange(false);
    assert.is(isVisible(), true, "signal returns incorrect value");

    dispose();
  });
});

cviso.run();
