import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render } from "@solidjs/web";
import { onElementConnect, createConnectRef } from "../src/index.js";

// Regression for #1143: onCleanup is forbidden inside a ref callback, so mount real JSX refs.

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observing = new Set<Element>();
  constructor(public cb: () => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observing.add(el);
  }
  disconnect() {
    this.observing.clear();
  }
  trigger() {
    if (this.observing.size) this.cb();
  }
}
const live = () => FakeResizeObserver.instances.filter(o => o.observing.size);
const fire = () => FakeResizeObserver.instances.forEach(o => o.trigger());

beforeEach(() => {
  FakeResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});
afterEach(() => vi.unstubAllGlobals());

// Render into a detached container so the element is not connected yet.
function mountDetached(App: () => any) {
  const container = document.createElement("div");
  const dispose = render(App, container);
  return { container, dispose };
}

describe("onElementConnect as a JSX ref callback", () => {
  it("does not throw and calls fn once when the element connects", () => {
    const fn = vi.fn();
    let m!: ReturnType<typeof mountDetached>;
    expect(() => {
      m = mountDetached(() => <div ref={el => void onElementConnect(el, fn)} />);
    }).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
    expect(live()).toHaveLength(1);

    document.body.appendChild(m.container);
    fire();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(live()).toHaveLength(0);
    fire();
    expect(fn).toHaveBeenCalledTimes(1);
    m.dispose();
    m.container.remove();
  });

  it("calls fn immediately for a connected element", () => {
    const fn = vi.fn();
    const m = mountDetached(() => (
      <div
        ref={el => {
          document.body.appendChild(el);
          onElementConnect(el, fn);
        }}
      />
    ));
    expect(fn).toHaveBeenCalledTimes(1);
    m.dispose();
  });

  it("returns a disposer that stops observing", () => {
    const fn = vi.fn();
    let stop!: VoidFunction;
    const m = mountDetached(() => <div ref={el => void (stop = onElementConnect(el, fn))} />);
    stop();
    stop();
    expect(live()).toHaveLength(0);
    document.body.appendChild(m.container);
    fire();
    expect(fn).not.toHaveBeenCalled();
    m.dispose();
    m.container.remove();
  });
});

describe("createConnectRef", () => {
  it("calls fn once per element, without throwing", () => {
    const fn = vi.fn();
    const m = mountDetached(() => {
      const ref = createConnectRef(fn);
      return (
        <div>
          <span ref={ref} />
          <span ref={ref} />
        </div>
      );
    });
    expect(live()).toHaveLength(2);
    document.body.appendChild(m.container);
    fire();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(live()).toHaveLength(0);
    m.dispose();
    m.container.remove();
  });

  it("stops observing when the owner is disposed before the element connects", () => {
    const fn = vi.fn();
    const m = mountDetached(() => <div ref={createConnectRef(fn)} />);
    expect(live()).toHaveLength(1);
    m.dispose();
    expect(live()).toHaveLength(0);
    document.body.appendChild(m.container);
    fire();
    expect(fn).not.toHaveBeenCalled();
    m.container.remove();
  });

  it("works without an owner", () => {
    const fn = vi.fn();
    const ref = createConnectRef(fn);
    const el = document.createElement("div");
    expect(() => ref(el)).not.toThrow();
    expect(live()).toHaveLength(1);
  });
});
