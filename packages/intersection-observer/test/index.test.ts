import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import {
  createIntersectionObserver,
  createViewportObserver,
  createVisibilityObserver
} from "../src/";

const intersectionObserverInstances = [];

const createMockIOEntry = (target: Element): IntersectionObserverEntry => ({
  target,
  time: Date.now(),
  rootBounds: {} as any,
  isIntersecting: Math.random() > 0.5,
  intersectionRect: {} as any,
  intersectionRatio: {} as any,
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
    return this.elements.map(createMockIOEntry);
  }
}
global.IntersectionObserver = IntersectionObserver;

const runOnChangeOnLastObserver = payload =>
  intersectionObserverInstances[intersectionObserverInstances.length - 1].onChange(payload);

const cio = suite("createIntersectionObserver");

cio.before(context => {
  context.div = document.createElement("div");
  context.img = document.createElement("img");
});

cio("creates a new IntersectionObserver instance", ({ div }) => {
  const previousInstanceCount = intersectionObserverInstances.length;
  createRoot(dispose => {
    createIntersectionObserver(div, console.log);
    dispose();
  });
  const newInstanceCount = intersectionObserverInstances.length;
  assert.is(previousInstanceCount + 1, newInstanceCount, "new instance was not created");
});

cio("returns the created IntersectionObserver instance", () => {
  createRoot(dispose => {
    const [, { instance }] = createIntersectionObserver([], () => {});

    assert.is(
      intersectionObserverInstances[intersectionObserverInstances.length - 1],
      instance,
      "returned instance doesn't match instance created"
    );

    dispose();
  });
});

cio("options are passed to IntersectionObserver", ({ div }) => {
  createRoot(dispose => {
    const options: IntersectionObserverInit = {
      threshold: 0.6,
      root: div,
      rootMargin: "10px 10px 10px 10px"
    };
    const [, { instance }] = createIntersectionObserver([], () => {}, options);

    assert.is(
      (instance as IntersectionObserver).options,
      options,
      "options in IntersectionObserver don't match"
    );

    dispose();
  });
});

cio("add function observes an element", ({ div }) => {
  createRoot(dispose => {
    const [add, { instance }] = createIntersectionObserver([], () => {});
    add(div);

    assert.is(
      (instance as IntersectionObserver).elements[0],
      div,
      "element wasn't added to the IntersectionObserver"
    );

    dispose();
  });
});

cio("remove function removes observed element", ({ div }) => {
  createRoot(dispose => {
    const [add, { instance, remove }] = createIntersectionObserver([], () => {});
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

cio("start function observes initial elements", ({ div, img }) => {
  createRoot(dispose => {
    const [, { start, instance }] = createIntersectionObserver([div, img], () => {});
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements in array were not added to the IntersectionObserver"
    );

    const [, { start: start2, instance: instance2 }] = createIntersectionObserver(
      () => [div, img],
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

cio("stop function unobserves all elements", ({ div, img }) => {
  createRoot(dispose => {
    const [, { instance, start, stop }] = createIntersectionObserver([div, img], () => {});
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

cio.run();

const cvo = suite("createViewportObserver");

cvo.before(context => {
  context.elements = [document.createElement("div"), document.createElement("span")];
  context.div = document.createElement("div");
  context.img = document.createElement("img");
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
    const [, { start, instance }] = createViewportObserver([div, img], () => {});
    start();

    assert.is(
      (instance as IntersectionObserver).elements.length,
      2,
      "elements in array were not added to the IntersectionObserver"
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

    assert.is(isVisible(), false, "signal returns default initialValue");

    const options = {
      initialValue: true
    };
    const [isVisible2] = createVisibilityObserver(div, options);

    assert.is(isVisible2(), true, "signal returns custom initialValue");

    dispose();
  });
});

cviso.run();
