import * as assert from "uvu/assert";
import { suite } from "uvu";
import { createResizeObserver, getElementSize, getWindowSize } from "../src";
import { createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

const div1 = document.createElement("div");
const div2 = document.createElement("div");
const div3 = document.createElement("div");

let _targets: Set<Element>;
let disconnect_count = 0;
class TestResizeObserver {
  _targets: Set<Element>;
  constructor(callback: ResizeObserverCallback) {
    this._targets = _targets;
  }
  observe(target: Element, options?: ResizeObserverOptions): void {
    this._targets.add(target);
  }
  unobserve(target: Element): void {
    this._targets.delete(target);
  }
  disconnect() {
    disconnect_count++;
  }
}
global.ResizeObserver = TestResizeObserver;

const cro = suite("createResizeObserver");

cro("disposes on cleanup", () =>
  createRoot(dispose => {
    _targets = new Set<Element>();
    createResizeObserver(div1, () => {});
    assert.is(disconnect_count, 0);
    dispose();
    assert.is(disconnect_count, 1);
  })
);

cro("adds initial target", () =>
  createRoot(dispose => {
    const targets = (_targets = new Set<Element>());
    createResizeObserver(div1, () => {});
    assert.is(targets.size, 1);
    assert.ok(targets.has(div1));
    dispose();
  })
);

cro("adds initial targets", () =>
  createRoot(dispose => {
    const targets = (_targets = new Set<Element>());
    createResizeObserver([div1, div2], () => {});
    assert.is(targets.size, 2);
    assert.ok(targets.has(div1));
    assert.ok(targets.has(div2));
    dispose();
  })
);

cro("observes signal targets", () =>
  createRoot(dispose => {
    const targets = (_targets = new Set<Element>());
    const [refs, setRefs] = createSignal([div1]);
    createResizeObserver(refs, () => {});
    assert.is(targets.size, 0, "targets shouldn't be connected synchronously");
    queueMicrotask(() => {
      assert.is(targets.size, 1);
      assert.ok(targets.has(div1));

      setRefs([div2, div3]);
      queueMicrotask(() => {
        assert.is(targets.size, 2);
        assert.ok(targets.has(div2));
        assert.ok(targets.has(div3));

        dispose();
      });
    });
  })
);

cro("observes store top-level targets", () =>
  createRoot(dispose => {
    const targets = (_targets = new Set<Element>());
    const [refs, setRefs] = createStore([div1]);
    createResizeObserver(refs, () => {});
    assert.is(targets.size, 0, "targets shouldn't be connected synchronously");
    queueMicrotask(() => {
      assert.is(targets.size, 1);
      assert.ok(targets.has(div1));

      setRefs([div2, div3]);
      queueMicrotask(() => {
        assert.is(targets.size, 2);
        assert.ok(targets.has(div2));
        assert.ok(targets.has(div3));

        dispose();
      });
    });
  })
);

cro.run();

const gws = suite("getWindowSize");

gws("returns window size", () => {
  // values predefined by jsdom
  assert.equal(getWindowSize(), { width: 1024, height: 768 });
});

gws.run();

const ges = suite("getElementSize");

ges("returns window size", () => {
  assert.equal(getElementSize(div1), { width: 0, height: 0 });
  assert.equal(getElementSize(undefined), { width: null, height: null });
});

ges.run();
