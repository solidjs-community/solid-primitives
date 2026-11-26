import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  createDismissableLayer,
  getLayerStack,
  getTopLayer,
  isTopLayer,
  makeDismissableLayer,
  useLayerStack,
  type DismissReason,
} from "../src/index.js";

beforeAll(() => {
  if (!("PointerEvent" in window)) {
    class MockPointerEvent extends MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? "mouse";
      }
    }
    (global as unknown as Record<string, unknown>)["PointerEvent"] = MockPointerEvent;
  }
});

beforeEach(() => {
  vi.useFakeTimers();
});

const mount = (id: string, parent: Element = document.body) => {
  const el = document.createElement("div");
  el.id = id;
  el.tabIndex = 0;
  parent.appendChild(el);
  return el;
};

/** Listeners of `makeInteractOutside` register after a 0ms timeout. */
const ready = () => vi.advanceTimersByTime(1);

const press = (target: Element) =>
  target.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "mouse" }),
  );
const escape = (target: EventTarget = document.body) =>
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach(fn => fn());
  document.body.innerHTML = "";
  document.body.style.pointerEvents = "";
  vi.useRealTimers();
});

function layerAt(el: Element, opts: Partial<Parameters<typeof makeDismissableLayer>[0]> = {}) {
  const onDismiss = vi.fn<(r: DismissReason, e?: Event) => void>();
  const controls = makeDismissableLayer({ element: el, onDismiss, ...opts });
  cleanups.push(controls.cleanup);
  return { ...controls, onDismiss };
}

describe("layer stack", () => {
  it("registers layers bottom-first and cleans up in any order", () => {
    const [a, b, c] = [mount("a"), mount("b"), mount("c")];
    const la = layerAt(a);
    const lb = layerAt(b);
    const lc = layerAt(c);
    expect(getLayerStack()).toEqual([la.layer, lb.layer, lc.layer]);
    expect(getTopLayer()).toBe(lc.layer);

    lb.cleanup();
    expect(getLayerStack()).toEqual([la.layer, lc.layer]);
    la.cleanup();
    expect(getLayerStack()).toEqual([lc.layer]);
    lc.cleanup();
    expect(getLayerStack()).toEqual([]);
    expect(getTopLayer()).toBeUndefined();
  });

  it("cleanup is idempotent", () => {
    const l = layerAt(mount("a"));
    l.cleanup();
    l.cleanup();
    expect(getLayerStack()).toEqual([]);
  });

  it("isTopLayer follows the stack", () => {
    const la = layerAt(mount("a"));
    const lb = layerAt(mount("b"));
    expect(isTopLayer(la.layer)).toBe(false);
    expect(isTopLayer(lb.layer)).toBe(true);
    lb.cleanup();
    expect(isTopLayer(la.layer)).toBe(true);
  });

  it("persistent layers are never the top layer", () => {
    const la = layerAt(mount("a"));
    const lp = layerAt(mount("p"), { persistent: true });
    expect(getLayerStack()).toHaveLength(2);
    expect(isTopLayer(lp.layer)).toBe(false);
    expect(getTopLayer()).toBe(la.layer);
  });

  it("useLayerStack is reactive", () => {
    let stack!: ReturnType<typeof useLayerStack>;
    const dispose = createRoot(d => {
      stack = useLayerStack();
      return d;
    });
    cleanups.push(dispose);
    flush();
    expect(stack()).toHaveLength(0);
    const l = layerAt(mount("a"));
    flush();
    expect(stack()).toEqual([l.layer]);
    l.cleanup();
    flush();
    expect(stack()).toEqual([]);
  });
});

describe("escape", () => {
  it("dismisses with reason 'escape'", () => {
    const l = layerAt(mount("a"));
    ready();
    escape();
    expect(l.onDismiss).toHaveBeenCalledTimes(1);
    expect(l.onDismiss.mock.calls[0]![0]).toBe("escape");
  });

  it("ignores other keys", () => {
    const l = layerAt(mount("a"));
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(l.onDismiss).not.toHaveBeenCalled();
  });

  it("only the topmost layer reacts, one at a time", () => {
    const la = layerAt(mount("a"));
    const lb = layerAt(mount("b"));
    ready();
    escape();
    expect(lb.onDismiss).toHaveBeenCalledTimes(1);
    expect(la.onDismiss).not.toHaveBeenCalled();
    lb.cleanup();
    escape();
    expect(la.onDismiss).toHaveBeenCalledTimes(1);
    expect(lb.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not cascade to the parent when the child removes itself synchronously", () => {
    const la = layerAt(mount("a"));
    const lb = layerAt(mount("b"), { onDismiss: () => lb2.cleanup() });
    const lb2 = lb;
    ready();
    escape();
    expect(la.onDismiss).not.toHaveBeenCalled();
    expect(getLayerStack()).toEqual([la.layer]);
  });

  it("skips persistent layers", () => {
    const la = layerAt(mount("a"));
    const lp = layerAt(mount("p"), { persistent: true });
    ready();
    escape();
    expect(la.onDismiss).toHaveBeenCalledTimes(1);
    expect(lp.onDismiss).not.toHaveBeenCalled();
  });

  it("stops listening after cleanup", () => {
    const l = layerAt(mount("a"));
    l.cleanup();
    escape();
    expect(l.onDismiss).not.toHaveBeenCalled();
  });
});

describe("outside pointer / focus", () => {
  it("outside press dismisses with 'outside-pointer'", () => {
    const inside = mount("in");
    const outside = mount("out");
    const l = layerAt(inside);
    ready();
    press(inside);
    expect(l.onDismiss).not.toHaveBeenCalled();
    press(outside);
    expect(l.onDismiss).toHaveBeenCalledTimes(1);
    expect(l.onDismiss.mock.calls[0]![0]).toBe("outside-pointer");
    expect(l.onDismiss.mock.calls[0]![1]).toBeInstanceOf(Event);
  });

  it("focus moving outside dismisses with 'outside-focus'", () => {
    const inside = mount("in");
    const outside = mount("out");
    const l = layerAt(inside);
    ready();
    outside.focus();
    expect(l.onDismiss).toHaveBeenCalledTimes(1);
    expect(l.onDismiss.mock.calls[0]![0]).toBe("outside-focus");
  });

  it("only the topmost layer reacts to an outside press", () => {
    const [a, b, out] = [mount("a"), mount("b"), mount("out")];
    const la = layerAt(a);
    const lb = layerAt(b);
    ready();
    press(out);
    expect(lb.onDismiss).toHaveBeenCalledTimes(1);
    expect(la.onDismiss).not.toHaveBeenCalled();
  });

  it("a press inside the parent but outside the child dismisses only the child", () => {
    const [a, b] = [mount("a"), mount("b")];
    const la = layerAt(a);
    const lb = layerAt(b);
    ready();
    press(a);
    expect(lb.onDismiss).toHaveBeenCalledTimes(1);
    expect(la.onDismiss).not.toHaveBeenCalled();
  });

  it("a press inside a portaled child (separate DOM tree) does not dismiss the parent", () => {
    const [a, portal, out] = [mount("a"), mount("portal"), mount("out")];
    const la = layerAt(a);
    const lc = layerAt(portal, { persistent: true, parent: la.layer });
    ready();
    press(portal);
    expect(la.onDismiss).not.toHaveBeenCalled();
    expect(lc.onDismiss).not.toHaveBeenCalled();
    press(out);
    expect(la.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("a press inside a persistent layer above does not dismiss the layer below", () => {
    const [a, p] = [mount("a"), mount("p")];
    const la = layerAt(a);
    layerAt(p, { persistent: true });
    ready();
    press(p);
    expect(la.onDismiss).not.toHaveBeenCalled();
  });

  it("a registered parent also covers a child that sits lower in the stack", () => {
    const [a, b] = [mount("a"), mount("b")];
    const lb = layerAt(b);
    const la = layerAt(a);
    // child `b` registered later than `a`'s record but declared as a's descendant
    const child = mount("child");
    const lc = layerAt(child, { parent: lb.layer, persistent: true });
    ready();
    press(child);
    expect(lb.onDismiss).not.toHaveBeenCalled();
    expect(la.onDismiss).not.toHaveBeenCalled();
    expect(lc.onDismiss).not.toHaveBeenCalled();
  });

  it("exclude: element, array and predicate", () => {
    const inside = mount("in");
    const trigger = mount("trigger");
    const other = mount("other");
    const out = mount("out");

    const l1 = layerAt(inside, { exclude: trigger });
    ready();
    press(trigger);
    expect(l1.onDismiss).not.toHaveBeenCalled();
    l1.cleanup();

    const l2 = layerAt(inside, { exclude: [trigger, other] });
    ready();
    press(other);
    expect(l2.onDismiss).not.toHaveBeenCalled();
    l2.cleanup();

    const l3 = layerAt(inside, { exclude: el => el.id === "out" });
    ready();
    press(out);
    expect(l3.onDismiss).not.toHaveBeenCalled();
    press(trigger);
    expect(l3.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("stops listening after cleanup", () => {
    const inside = mount("in");
    const out = mount("out");
    const l = layerAt(inside);
    ready();
    l.cleanup();
    press(out);
    expect(l.onDismiss).not.toHaveBeenCalled();
  });

  it("cleanup before listeners are attached cancels the pending registration", () => {
    const inside = mount("in");
    const out = mount("out");
    const l = layerAt(inside);
    l.cleanup();
    ready();
    press(out);
    expect(l.onDismiss).not.toHaveBeenCalled();
  });
});

describe("dismissible", () => {
  it("calls onDismissAttempt instead of onDismiss when dismissible is false", () => {
    const inside = mount("in");
    const out = mount("out");
    const onDismissAttempt = vi.fn();
    const l = layerAt(inside, { dismissible: false, onDismissAttempt });
    ready();
    escape();
    press(out);
    inside.focus();
    expect(l.onDismiss).not.toHaveBeenCalled();
    expect(onDismissAttempt).toHaveBeenCalledTimes(2);
    expect(onDismissAttempt.mock.calls.map(c => c[0])).toEqual(["escape", "outside-pointer"]);
    expect(onDismissAttempt.mock.calls[0]![1]).toBeInstanceOf(KeyboardEvent);
  });

  it("a non-dismissible top layer blocks the parent (no fall-through)", () => {
    const [a, b] = [mount("a"), mount("b")];
    const la = layerAt(a);
    const attempt = vi.fn();
    layerAt(b, { dismissible: false, onDismissAttempt: attempt });
    ready();
    escape();
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(la.onDismiss).not.toHaveBeenCalled();
  });

  it("dismissible accessor is read at request time", () => {
    const [ok, setOk] = createSignal(false);
    const attempt = vi.fn();
    const l = layerAt(mount("a"), { dismissible: ok, onDismissAttempt: attempt });
    ready();
    escape();
    expect(attempt).toHaveBeenCalledTimes(1);
    setOk(true);
    flush();
    escape();
    expect(l.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("without onDismissAttempt a blocked request is a silent no-op", () => {
    const l = layerAt(mount("a"), { dismissible: false });
    ready();
    expect(() => escape()).not.toThrow();
    expect(l.onDismiss).not.toHaveBeenCalled();
  });
});

describe("programmatic dismiss", () => {
  it("dismiss() defaults to 'programmatic', regardless of stack position", () => {
    const la = layerAt(mount("a"));
    layerAt(mount("b"));
    la.dismiss();
    expect(la.onDismiss.mock.calls).toEqual([["programmatic", undefined]]);
  });

  it("dismiss() respects dismissible", () => {
    const attempt = vi.fn();
    const l = layerAt(mount("a"), { dismissible: false, onDismissAttempt: attempt });
    l.dismiss();
    expect(l.onDismiss).not.toHaveBeenCalled();
    expect(attempt).toHaveBeenCalledWith("programmatic", undefined);
  });

  it("works on a persistent layer", () => {
    const l = layerAt(mount("a"), { persistent: true });
    l.dismiss();
    expect(l.onDismiss).toHaveBeenCalledWith("programmatic", undefined);
  });
});

describe("disableOutsidePointerEvents", () => {
  it("disables body pointer events while registered and restores them", () => {
    document.body.style.pointerEvents = "auto";
    const el = mount("a");
    el.style.pointerEvents = "";
    const l = layerAt(el, { disableOutsidePointerEvents: true });
    expect(document.body.style.pointerEvents).toBe("none");
    expect(el.style.pointerEvents).toBe("auto");
    l.cleanup();
    expect(document.body.style.pointerEvents).toBe("auto");
    expect(el.style.pointerEvents).toBe("");
  });

  it("stays disabled until the last disabling layer is removed (any order)", () => {
    const [a, b] = [mount("a"), mount("b")];
    const la = layerAt(a, { disableOutsidePointerEvents: true });
    const lb = layerAt(b, { disableOutsidePointerEvents: true });
    la.cleanup();
    expect(document.body.style.pointerEvents).toBe("none");
    expect(b.style.pointerEvents).toBe("auto");
    lb.cleanup();
    expect(document.body.style.pointerEvents).toBe("");
  });

  it("layers above a disabling layer stay interactive", () => {
    const [a, b] = [mount("a"), mount("b")];
    layerAt(a, { disableOutsidePointerEvents: true });
    layerAt(b);
    expect(b.style.pointerEvents).toBe("auto");
  });
});

describe("createDismissableLayer", () => {
  it("registers once the ref resolves and unregisters on dispose", () => {
    const [ref, setRef] = createSignal<Element>();
    const onDismiss = vi.fn();
    let ctl!: ReturnType<typeof createDismissableLayer>;
    const dispose = createRoot(d => {
      ctl = createDismissableLayer({ ref, onDismiss });
      return d;
    });
    flush();
    expect(getLayerStack()).toHaveLength(0);
    expect(ctl.isTop()).toBe(false);
    ctl.dismiss(); // no element yet: no-op
    expect(onDismiss).not.toHaveBeenCalled();

    setRef(mount("a"));
    flush();
    expect(getLayerStack()).toHaveLength(1);
    expect(ctl.isTop()).toBe(true);
    ready();
    escape();
    expect(onDismiss.mock.calls[0]![0]).toBe("escape");
    ctl.dismiss();
    expect(onDismiss).toHaveBeenLastCalledWith("programmatic", undefined);

    dispose();
    expect(getLayerStack()).toHaveLength(0);
    escape();
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("re-registers when the element changes", () => {
    const [ref, setRef] = createSignal<Element>(mount("a"));
    const second = mount("b");
    const dispose = createRoot(d => {
      createDismissableLayer({ ref, onDismiss: () => {} });
      return d;
    });
    cleanups.push(dispose);
    flush();
    expect(getLayerStack().map(l => l.element.id)).toEqual(["a"]);
    setRef(second);
    flush();
    expect(getLayerStack().map(l => l.element.id)).toEqual(["b"]);
  });

  it("accepts a plain element and tracks isTop across layers", () => {
    const tops: boolean[] = [];
    let a!: ReturnType<typeof createDismissableLayer>;
    let b!: ReturnType<typeof createDismissableLayer>;
    const dispA = createRoot(d => {
      a = createDismissableLayer({ ref: mount("a"), onDismiss: () => {} });
      return d;
    });
    flush();
    const dispB = createRoot(d => {
      b = createDismissableLayer({ ref: mount("b"), onDismiss: () => {} });
      return d;
    });
    flush();
    tops.push(a.isTop(), b.isTop());
    expect(tops).toEqual([false, true]);
    dispB();
    flush();
    expect(a.isTop()).toBe(true);
    dispA();
  });

  it("disposing in non-stack order leaves a consistent stack", () => {
    const disposers = ["a", "b", "c"].map(id =>
      createRoot(d => {
        createDismissableLayer({ ref: mount(id), onDismiss: () => {} });
        return d;
      }),
    );
    flush();
    expect(getLayerStack()).toHaveLength(3);
    disposers[1]!();
    flush();
    expect(getLayerStack().map(l => l.element.id)).toEqual(["a", "c"]);
    disposers[0]!();
    disposers[2]!();
    flush();
    expect(getLayerStack()).toEqual([]);
  });

  it("reads dismissible / callbacks reactively without re-registering", () => {
    const [ok, setOk] = createSignal(false);
    const onDismiss = vi.fn();
    const onDismissAttempt = vi.fn();
    const dispose = createRoot(d => {
      createDismissableLayer({ ref: mount("a"), onDismiss, onDismissAttempt, dismissible: ok });
      return d;
    });
    cleanups.push(dispose);
    flush();
    const first = getLayerStack()[0];
    ready();
    escape();
    expect(onDismissAttempt).toHaveBeenCalledTimes(1);
    setOk(true);
    flush();
    escape();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(getLayerStack()[0]).toBe(first);
  });
});
