import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createPresence } from "../src/index.js";

type Controlled = {
  animation: Animation;
  finish: VoidFunction;
  cancel: VoidFunction;
};

const controlled = (endTime = 100): Controlled => {
  let finish!: VoidFunction;
  let cancel!: VoidFunction;
  const finished = new Promise<Animation>((res, rej) => {
    finish = () => res(animation);
    cancel = () => rej(new DOMException("cancelled", "AbortError"));
  });
  const animation = {
    finished,
    effect: { getComputedTiming: () => ({ endTime }) },
  } as unknown as Animation;
  return { animation, finish, cancel };
};

const tick = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
  flush();
};

let el: HTMLElement;
let running: Animation[];
let getAnimations: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  el = document.createElement("div");
  document.body.append(el);
  running = [];
  getAnimations = vi.fn(() => running);
  (el as any).getAnimations = getAnimations;
});

afterEach(() => {
  el.remove();
  vi.useRealTimers();
});

const setup = (initial: boolean, extra: Record<string, unknown> = {}, useRefOption = false) => {
  const [show, setShow] = createSignal(initial);
  let presence!: ReturnType<typeof createPresence<boolean>>;
  const dispose = createRoot(d => {
    presence = createPresence(show, {
      transitionDuration: 100,
      animations: true,
      ...(useRefOption ? { element: () => el } : {}),
      ...extra,
    }) as any;
    if (!useRefOption) presence.ref(el);
    return d;
  });
  flush();
  return { presence, setShow, dispose };
};

describe("createPresence animations", () => {
  it("waits for animations to settle, ignoring the duration", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    expect(presence.isExiting()).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    flush();
    expect(presence.isMounted()).toBe(true);
    a.finish();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(false);
    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    dispose();
  });

  it("unmounts right away when nothing is animating", async () => {
    const { presence, setShow, dispose } = setup(true);
    setShow(false);
    flush();
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("settles on cancelled (rejected) animations too", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    a.cancel();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("waits for all animations, including ones started meanwhile", async () => {
    const a = controlled();
    const b = controlled();
    const c = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation, b.animation];
    setShow(false);
    flush();
    a.finish();
    await tick();
    expect(presence.isMounted()).toBe(true);
    b.finish();
    running = [c.animation];
    await tick();
    expect(presence.isMounted()).toBe(true);
    c.finish();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("ignores infinite animations", async () => {
    const inf = controlled(Infinity);
    const { presence, setShow, dispose } = setup(true);
    running = [inf.animation];
    setShow(false);
    flush();
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("cancels the wait when re-shown mid-exit", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    setShow(true);
    flush();
    a.finish();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(true);
    expect(presence.isExiting()).toBe(false);
    // a later exit still works
    setShow(false);
    flush();
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("a late finish of an obsolete exit does not unmount a newer entered state", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    setShow(true);
    flush();
    setShow(false);
    flush();
    // second exit has no animations of its own
    running = [];
    a.finish();
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("falls back to the timer when getAnimations is unsupported", async () => {
    delete (el as any).getAnimations;
    const { presence, setShow, dispose } = setup(true);
    setShow(false);
    flush();
    await vi.advanceTimersByTimeAsync(99);
    flush();
    expect(presence.isMounted()).toBe(true);
    await vi.advanceTimersByTimeAsync(2);
    flush();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("falls back to the timer when no element is available", async () => {
    const [show, setShow] = createSignal(true);
    const dispose = createRoot(d => {
      createPresence(show, { transitionDuration: 100, animations: true });
      return d;
    });
    flush();
    setShow(false);
    flush();
    expect(getAnimations).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(101);
    dispose();
  });

  it("falls back to the timer for a detached element", async () => {
    const { presence, setShow, dispose } = setup(true);
    el.remove();
    setShow(false);
    flush();
    await vi.advanceTimersByTimeAsync(101);
    flush();
    expect(presence.isMounted()).toBe(false);
    expect(getAnimations).not.toHaveBeenCalled();
    dispose();
  });

  it("is opt-in: the timer is used when `animations` is not set", async () => {
    const a = controlled();
    running = [a.animation];
    const { presence, setShow, dispose } = setup(true, { animations: false });
    setShow(false);
    flush();
    await vi.advanceTimersByTimeAsync(101);
    flush();
    expect(presence.isMounted()).toBe(false);
    expect(getAnimations).not.toHaveBeenCalled();
    dispose();
  });

  it("supports the `element` option", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true, {}, true);
    running = [a.animation];
    setShow(false);
    flush();
    await tick();
    expect(presence.isMounted()).toBe(true);
    a.finish();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("waits for enter animations before hasEntered", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(false);
    running = [a.animation];
    setShow(true);
    flush();
    await vi.advanceTimersByTimeAsync(1000);
    flush();
    expect(presence.isVisible()).toBe(true);
    expect(presence.isEntering()).toBe(true);
    a.finish();
    running = [];
    await tick();
    expect(presence.isEntering()).toBe(false);
    dispose();
  });

  it("does not leak timers or pending waits after dispose", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    dispose();
    a.finish();
    running = [];
    await tick();
    expect(presence.isMounted()).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps swap-after-exit remounting (isMounted falls between items)", async () => {
    const a = controlled();
    const [item2, setItem2] = createSignal<string | undefined>("a");
    let p!: ReturnType<typeof createPresence<string>>;
    const d2 = createRoot(d => {
      p = createPresence(item2, { transitionDuration: 100, animations: true });
      p.ref(el);
      return d;
    });
    flush();
    running = [a.animation];
    setItem2("b");
    flush();
    expect(p.mountedItem()).toBe("a");
    expect(p.isExiting()).toBe(true);
    a.finish();
    running = [];
    await tick();
    await tick();
    expect(p.mountedItem()).toBe("b");
    expect(p.isMounted()).toBe(true);
    d2();
  });

  it("exposes data-starting-style / data-ending-style attributes", async () => {
    const { presence, setShow, dispose } = setup(false);
    expect(presence.attrs()).toEqual({
      "data-starting-style": undefined,
      "data-ending-style": undefined,
    });
    setShow(true);
    flush();
    expect(presence.attrs()["data-starting-style"]).toBe("");
    await vi.advanceTimersByTimeAsync(50);
    flush();
    expect(presence.attrs()["data-starting-style"]).toBeUndefined();
    setShow(false);
    flush();
    expect(presence.attrs()["data-ending-style"]).toBe("");
    dispose();
  });

  it("does not wait for paused animations", async () => {
    const a = controlled();
    (a.animation as any).playState = "paused";
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });

  it("stops waiting for a never-settling animation after the wall-clock limit", async () => {
    const a = controlled();
    const { presence, setShow, dispose } = setup(true);
    running = [a.animation];
    setShow(false);
    flush();
    await vi.advanceTimersByTimeAsync(9000);
    flush();
    expect(presence.isMounted()).toBe(true);
    await vi.advanceTimersByTimeAsync(2000);
    await tick();
    expect(presence.isMounted()).toBe(false);
    dispose();
  });
});
