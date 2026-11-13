import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCallbacksSet,
  createMs,
  createRAF,
  createScheduledLoop,
  targetFPS,
  useGlobalRAF,
} from "../src/index.js";
import { createRoot, flush } from "solid-js";

// Every root created by a test is disposed after it, so state never leaks between tests
// (the `useGlobalRAF` singleton in particular only goes away once all its users are disposed).
let disposers: VoidFunction[] = [];
const root = <T>(fn: () => T): T =>
  createRoot(dispose => {
    disposers.push(dispose);
    return fn();
  });

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(async () => {
  disposers.forEach(dispose => dispose());
  disposers = [];
  // `createSingletonRoot` disposes its root in a microtask
  await Promise.resolve();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createRAF", () => {
  it("calls requestAnimationFrame after start", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const callback = vi.fn<FrameRequestCallback>();
    const [running, start, stop] = root(() => createRAF(callback));
    expect(running()).toBe(false);
    expect(raf).not.toHaveBeenCalled();
    start();
    flush();
    expect(running()).toBe(true);
    expect(raf).toHaveBeenCalledTimes(1);
    vi.advanceTimersToNextFrame();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0]![0]).toBeTypeOf("number");
    stop();
    flush();
    expect(running()).toBe(false);
    expect(caf).toHaveBeenCalledTimes(1);
    vi.advanceTimersToNextFrame();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("starts one loop when started twice before a flush", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const callback = vi.fn<FrameRequestCallback>();
    const [, start] = root(() => createRAF(callback));
    start();
    start();
    expect(raf).toHaveBeenCalledTimes(1);
    vi.advanceTimersToNextFrame();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls cancelAnimationFrame on dispose", () => {
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const callback = vi.fn<FrameRequestCallback>();
    createRoot(dispose => {
      const [, start] = createRAF(callback);
      start();
      dispose();
    });
    expect(caf).toHaveBeenCalledTimes(1);
    vi.advanceTimersToNextFrame();
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not cancel a request it never made", () => {
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const [, start, stop] = root(() => createRAF(() => {}));
    // stopping before starting used to call `cancelAnimationFrame(0)`
    stop();
    expect(caf).not.toHaveBeenCalled();
    start();
    stop();
    expect(caf).toHaveBeenCalledTimes(1);
    // the request ID is cleared after cancelling, so stopping twice does not cancel twice
    stop();
    expect(caf).toHaveBeenCalledTimes(1);
  });
});

describe("createCallbacksSet", () => {
  it("calls every callback in the set with the same arguments", () => {
    const a = vi.fn();
    const b = vi.fn();
    const [callback, callbacks] = createCallbacksSet<(n: number) => void>(a);
    callback(1);
    expect(a).toHaveBeenCalledWith(1);
    expect(b).not.toHaveBeenCalled();
    callbacks.add(b);
    callback(2);
    expect(a).toHaveBeenLastCalledWith(2);
    expect(b).toHaveBeenLastCalledWith(2);
    callbacks.delete(a);
    callback(3);
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenLastCalledWith(3);
  });
});

describe("createScheduledLoop", () => {
  it("schedules and cancels with the given functions", () => {
    // a self-repeating scheduler, as `createScheduledLoop` expects
    const schedule = vi.fn((cb: VoidFunction) => setInterval(cb, 16));
    const cancel = vi.fn((id: ReturnType<typeof setInterval>) => clearInterval(id));
    const callback = vi.fn();
    const [running, start, stop] = root(() => createScheduledLoop(schedule, cancel)(callback));
    expect(running()).toBe(false);
    // nothing to cancel before the first start
    stop();
    expect(cancel).not.toHaveBeenCalled();
    start();
    flush();
    expect(running()).toBe(true);
    expect(schedule).toHaveBeenCalledWith(callback);
    // already running: not scheduled again
    start();
    expect(schedule).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(48);
    expect(callback).toHaveBeenCalledTimes(3);
    // the scheduler repeats the callback; it is not scheduled again per frame
    expect(schedule).toHaveBeenCalledTimes(1);
    stop();
    flush();
    expect(running()).toBe(false);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(schedule.mock.results[0]!.value);
    vi.advanceTimersByTime(48);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("cancels on dispose", () => {
    const cancel = vi.fn();
    createRoot(dispose => {
      const [, start] = createScheduledLoop(() => "id", cancel)(() => {});
      start();
      dispose();
    });
    expect(cancel).toHaveBeenCalledExactlyOnceWith("id");
  });

  it("works with schedulers that cancel by callback", () => {
    // like motion's `frame.render` / `cancelFrame`
    const scheduled = new Set<VoidFunction>();
    const frameRender = (cb: VoidFunction) => void scheduled.add(cb);
    const cancelFrame = (cb: VoidFunction) => void scheduled.delete(cb);
    const callback = () => {};
    const [, start, stop] = root(() =>
      createScheduledLoop((cb: VoidFunction) => (frameRender(cb), cb), cancelFrame)(callback),
    );
    start();
    expect(scheduled.has(callback)).toBe(true);
    stop();
    expect(scheduled.size).toBe(0);
  });
});

describe("useGlobalRAF", () => {
  it("shares one loop between callbacks and runs them on the same frame", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const cb1 = vi.fn<FrameRequestCallback>();
    const cb2 = vi.fn<FrameRequestCallback>();
    const [a, b] = root(() => {
      const createGlobalRAFCallback = useGlobalRAF();
      return [createGlobalRAFCallback(cb1), createGlobalRAFCallback(cb2)] as const;
    });
    const [added1, add1, , running, start, stop] = a;
    const [added2, add2, , running2, start2, stop2] = b;

    // the loop controls come from the singleton
    expect(running2).toBe(running);
    expect(start2).toBe(start);
    expect(stop2).toBe(stop);

    add1();
    expect(added1()).toBe(true);
    expect(added2()).toBe(false);
    // not started automatically
    flush();
    expect(running()).toBe(false);

    start();
    flush();
    expect(running()).toBe(true);
    vi.advanceTimersToNextFrame();
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();

    add2();
    vi.advanceTimersToNextFrame();
    expect(cb1).toHaveBeenCalledTimes(2);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb2.mock.calls[0]![0]).toBe(cb1.mock.calls[1]![0]);
    // one request per frame, not one per callback
    expect(raf).toHaveBeenCalledTimes(3);

    stop();
    flush();
    expect(running()).toBe(false);
    expect(caf).toHaveBeenCalledTimes(1);
  });

  it("does not call callbacks that are not added", () => {
    const callback = vi.fn<FrameRequestCallback>();
    const [, add, remove, , start, stop] = root(() => useGlobalRAF()(callback));
    start();
    vi.advanceTimersToNextFrame();
    add();
    remove();
    vi.advanceTimersToNextFrame();
    stop();
    expect(callback).not.toHaveBeenCalled();
  });

  it("starts when added and stops when the last callback is removed", () => {
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const cb1 = vi.fn<FrameRequestCallback>();
    const cb2 = vi.fn<FrameRequestCallback>();
    const [a, b] = root(() => {
      const createGlobalRAFCallback = useGlobalRAF();
      return [createGlobalRAFCallback(cb1, true), createGlobalRAFCallback(cb2, true)] as const;
    });
    const [, add1, remove1, running] = a;
    const [, add2, remove2] = b;

    flush();
    expect(running()).toBe(false);
    add1();
    flush();
    expect(running()).toBe(true);
    add2();
    vi.advanceTimersToNextFrame();
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    remove1();
    flush();
    expect(running()).toBe(true);
    expect(caf).not.toHaveBeenCalled();
    remove2();
    flush();
    expect(running()).toBe(false);
    expect(caf).toHaveBeenCalledTimes(1);
  });

  it("does not stop a manually started loop when a callback that was never added is removed", () => {
    const [a, b] = root(() => {
      const createGlobalRAFCallback = useGlobalRAF();
      return [createGlobalRAFCallback(() => {}), createGlobalRAFCallback(() => {})] as const;
    });
    const [, , , running, start] = a;
    const [, , removeNeverAdded] = b;
    start();
    removeNeverAdded();
    flush();
    expect(running()).toBe(true);
  });

  it("keeps registrations of the same callback from different owners independent", () => {
    const callback = vi.fn<FrameRequestCallback>();
    const [, add1, remove1, running] = root(() => useGlobalRAF()(callback, true));
    const [added2, add2, remove2] = root(() => useGlobalRAF()(callback, true));
    add1();
    add2();
    remove1();
    expect(added2()).toBe(true);
    flush();
    expect(running()).toBe(true);
    vi.advanceTimersToNextFrame();
    expect(callback).toHaveBeenCalledTimes(1);

    remove2();
    flush();
    expect(running()).toBe(false);
  });

  it("accepts an accessor for startWhenAdded", () => {
    let auto = false;
    const [, add, remove, running] = root(() =>
      useGlobalRAF()(
        () => {},
        () => auto,
      ),
    );
    add();
    flush();
    expect(running()).toBe(false);
    remove();
    auto = true;
    add();
    flush();
    expect(running()).toBe(true);
  });

  it("removes callbacks on cleanup and stops the loop when the singleton is disposed", async () => {
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    const keep = vi.fn<FrameRequestCallback>();
    const drop = vi.fn<FrameRequestCallback>();
    const [, addKeep, , running] = root(() => useGlobalRAF()(keep, true));
    let disposeDrop!: VoidFunction;
    createRoot(dispose => {
      disposeDrop = dispose;
      useGlobalRAF()(drop, true)[1]();
    });
    addKeep();
    vi.advanceTimersToNextFrame();
    expect(drop).toHaveBeenCalledTimes(1);

    disposeDrop();
    vi.advanceTimersToNextFrame();
    expect(drop).toHaveBeenCalledTimes(1);
    expect(keep).toHaveBeenCalledTimes(2);
    flush();
    expect(running()).toBe(true);

    disposers.forEach(dispose => dispose());
    disposers = [];
    await Promise.resolve();
    expect(caf).toHaveBeenCalled();
    vi.advanceTimersToNextFrame();
    expect(keep).toHaveBeenCalledTimes(2);
  });
});

describe("targetFPS", () => {
  it("only calls after a frame", () => {
    const callback = vi.fn();
    const fpsFilter = targetFPS(callback, 60);
    expect(callback).not.toHaveBeenCalled();
    fpsFilter(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    fpsFilter(1017);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1024);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1034);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});

describe("createMs", () => {
  it("yields a timestamp starting at approximately zero", () => {
    const ms = root(() => createMs(60));
    expect(ms()).toBeLessThanOrEqual(3);
    ms.stop();
  });
});
