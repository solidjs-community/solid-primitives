import { describe, expect, it, vi, afterEach } from "vitest";
import { createRoot, flush } from "solid-js";
import { makeAnalytics, createAnalytics } from "../src/analytics.js";
import { makeAnalyticsGuard, createAnalyticsGuard } from "../src/guard.js";
import type { AnalyticsPlugin, PagePayload, TrackPayload, IdentifyPayload } from "../src/types.js";
import type { BeforeLeaveEvent } from "../src/guard.js";

function makeReadyPlugin(overrides: Partial<AnalyticsPlugin> = {}): AnalyticsPlugin {
  return { name: "ready", ...overrides };
}

function delay(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── makeAnalytics ────────────────────────────────────────────────────────────

describe("makeAnalytics", () => {
  it("dispatches page events immediately to a ready plugin", async () => {
    const pageSpy = vi.fn();
    const [analytics, cleanup] = makeAnalytics([makeReadyPlugin({ page: ({ payload }) => pageSpy(payload) })]);
    analytics.page({ title: "Home" });
    await delay();
    expect(pageSpy).toHaveBeenCalledOnce();
    const payload = pageSpy.mock.calls[0]![0] as PagePayload;
    expect(payload.type).toBe("page");
    expect(payload.properties.title).toBe("Home");
    expect(payload.meta.rid).toBeTruthy();
    cleanup();
  });

  it("dispatches track events to a ready plugin", async () => {
    const trackSpy = vi.fn();
    const [analytics, cleanup] = makeAnalytics([makeReadyPlugin({ track: ({ payload }) => trackSpy(payload) })]);
    analytics.track("button_click", { name: "signup" });
    await delay();
    expect(trackSpy).toHaveBeenCalledOnce();
    const payload = trackSpy.mock.calls[0]![0] as TrackPayload;
    expect(payload.type).toBe("track");
    expect(payload.event).toBe("button_click");
    expect(payload.properties.name).toBe("signup");
    cleanup();
  });

  it("dispatches identify events to a ready plugin", async () => {
    const identifySpy = vi.fn();
    const [analytics, cleanup] = makeAnalytics([
      makeReadyPlugin({ identify: ({ payload }) => identifySpy(payload) }),
    ]);
    analytics.identify("user-1", { email: "alice@example.com" });
    await delay();
    expect(identifySpy).toHaveBeenCalledOnce();
    const payload = identifySpy.mock.calls[0]![0] as IdentifyPayload;
    expect(payload.type).toBe("identify");
    expect(payload.userId).toBe("user-1");
    expect(payload.traits.email).toBe("alice@example.com");
    cleanup();
  });

  it("queues events while a plugin is initializing and flushes when ready", async () => {
    let resolveInit!: () => void;
    const initDone = new Promise<void>(res => (resolveInit = res));
    const pageSpy = vi.fn();

    const [analytics, cleanup] = makeAnalytics([
      {
        name: "async-plugin",
        initialize: () => initDone,
        page: ({ payload }) => pageSpy(payload),
      },
    ]);

    analytics.page({ title: "Queued" });
    await delay(); // init not done yet
    expect(pageSpy).not.toHaveBeenCalled();

    resolveInit();
    await delay(20); // allow init + drain
    expect(pageSpy).toHaveBeenCalledOnce();
    cleanup();
  });

  it("dispatches to multiple plugins sequentially", async () => {
    const order: string[] = [];
    const pluginA: AnalyticsPlugin = { name: "a", track: async () => { order.push("a"); } };
    const pluginB: AnalyticsPlugin = { name: "b", track: async () => { order.push("b"); } };
    const [analytics, cleanup] = makeAnalytics([pluginA, pluginB]);
    analytics.track("ev");
    await delay(10);
    expect(order).toEqual(["a", "b"]);
    cleanup();
  });

  it("abort() stops subsequent plugins from receiving the event", async () => {
    const spyA = vi.fn();
    const spyB = vi.fn();
    const pluginA: AnalyticsPlugin = { name: "a", track: ({ abort }) => { spyA(); abort(); } };
    const pluginB: AnalyticsPlugin = { name: "b", track: () => spyB() };
    const [analytics, cleanup] = makeAnalytics([pluginA, pluginB]);
    analytics.track("ev");
    await delay(10);
    expect(spyA).toHaveBeenCalledOnce();
    expect(spyB).not.toHaveBeenCalled();
    cleanup();
  });

  it("swallows plugin errors and continues with the next plugin", async () => {
    const spyB = vi.fn();
    const pluginA: AnalyticsPlugin = {
      name: "broken",
      track: () => { throw new Error("boom"); },
    };
    const pluginB: AnalyticsPlugin = { name: "ok", track: () => spyB() };
    const [analytics, cleanup] = makeAnalytics([pluginA, pluginB]);
    analytics.track("ev");
    await delay(10);
    expect(spyB).toHaveBeenCalledOnce();
    cleanup();
  });

  it("dynamically registers a plugin via use()", async () => {
    const spyA = vi.fn();
    const spyB = vi.fn();
    const pluginA: AnalyticsPlugin = { name: "a", track: () => spyA() };
    const pluginB: AnalyticsPlugin = { name: "b", track: () => spyB() };
    const [analytics, cleanup] = makeAnalytics([pluginA]);
    analytics.use(pluginB);
    analytics.track("ev");
    await delay(10);
    expect(spyA).toHaveBeenCalledOnce();
    expect(spyB).toHaveBeenCalledOnce();
    cleanup();
  });

  it("cleanup stops the poll timer and clears the queue", async () => {
    let resolveInit!: () => void;
    const initDone = new Promise<void>(res => (resolveInit = res));
    const spy = vi.fn();
    const [analytics, cleanup] = makeAnalytics(
      [{ name: "async", initialize: () => initDone, page: () => spy() }],
      { retryInterval: 50 },
    );
    analytics.page({ title: "Lost" });
    cleanup(); // discard before init resolves
    resolveInit();
    await delay(100);
    expect(spy).not.toHaveBeenCalled();
  });

  it("uses loaded() to determine plugin readiness", async () => {
    const spy = vi.fn();
    let isLoaded = false;
    const plugin: AnalyticsPlugin = {
      name: "deferred",
      loaded: () => isLoaded,
      page: () => spy(),
    };
    const [analytics, cleanup] = makeAnalytics([plugin], { retryInterval: 20 });
    analytics.page({ title: "Deferred" });
    await delay(10);
    expect(spy).not.toHaveBeenCalled();
    isLoaded = true;
    await delay(50); // poll fires, drains queue
    expect(spy).toHaveBeenCalledOnce();
    cleanup();
  });

  it("each event gets a unique rid", async () => {
    const rids: string[] = [];
    const plugin: AnalyticsPlugin = { name: "p", track: ({ payload }) => rids.push(payload.meta.rid) };
    const [analytics, cleanup] = makeAnalytics([plugin]);
    analytics.track("a");
    analytics.track("b");
    await delay(10);
    expect(rids).toHaveLength(2);
    expect(rids[0]).not.toBe(rids[1]);
    cleanup();
  });
});

// ─── createAnalytics ──────────────────────────────────────────────────────────

describe("createAnalytics", () => {
  let dispose: () => void;

  afterEach(() => {
    dispose?.();
  });

  it("pendingCount() starts at 0 with a sync plugin", () => {
    createRoot(d => {
      dispose = d;
      const analytics = createAnalytics([makeReadyPlugin()]);
      flush();
      expect(analytics.pendingCount()).toBe(0);
    });
  });

  it("pendingCount() reflects queued event count", () =>
    new Promise<void>(resolve => {
      createRoot(d => {
        dispose = d;
        let resolveInit!: () => void;
        const initDone = new Promise<void>(res => (resolveInit = res));
        const analytics = createAnalytics([{ name: "async", initialize: () => initDone, page: () => {} }]);
        analytics.page({ title: "A" });
        analytics.page({ title: "B" });
        flush();
        expect(analytics.pendingCount()).toBe(2);
        resolveInit();
        delay(20).then(() => {
          flush();
          expect(analytics.pendingCount()).toBe(0);
          resolve();
        });
      });
    }));

  it("reset() clears the queue and resets pendingCount", () => {
    createRoot(d => {
      dispose = d;
      let resolveInit!: () => void;
      const initDone = new Promise<void>(res => (resolveInit = res));
      const analytics = createAnalytics([{ name: "async", initialize: () => initDone }]);
      analytics.page();
      flush();
      expect(analytics.pendingCount()).toBe(1);
      analytics.reset();
      flush();
      expect(analytics.pendingCount()).toBe(0);
      resolveInit();
    });
  });

  it("passes config to plugin handlers", async () => {
    const spy = vi.fn();
    await new Promise<void>(resolve => {
      createRoot(d => {
        dispose = d;
        const plugin: AnalyticsPlugin = {
          name: "cfg",
          config: { apiKey: "abc" },
          track: ({ config }) => { spy(config); resolve(); },
        };
        createAnalytics([plugin]).track("ev");
      });
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ apiKey: "abc" }));
  });
});

// ─── drain ────────────────────────────────────────────────────────────────────

describe("drain()", () => {
  it("resolves immediately when no dispatches are in flight", async () => {
    const [analytics, cleanup] = makeAnalytics([makeReadyPlugin()]);
    await expect(analytics.drain()).resolves.toBeUndefined();
    cleanup();
  });

  it("resolves after in-flight async plugin calls complete", async () => {
    let resolveTrack!: () => void;
    const trackDone = new Promise<void>(res => (resolveTrack = res));
    const order: string[] = [];

    const plugin: AnalyticsPlugin = {
      name: "slow",
      track: async () => {
        await trackDone;
        order.push("plugin");
      },
    };
    const [analytics, cleanup] = makeAnalytics([plugin]);
    analytics.track("ev");
    const drained = analytics.drain().then(() => order.push("drained"));
    await delay(5);
    expect(order).toEqual([]); // neither done yet
    resolveTrack();
    await drained;
    expect(order).toEqual(["plugin", "drained"]);
    cleanup();
  });

  it("drain() on createAnalytics also works", async () => {
    const spy = vi.fn();
    await new Promise<void>(resolve => {
      createRoot(async d => {
        const analytics = createAnalytics([makeReadyPlugin({ track: async () => { spy(); } })]);
        analytics.track("ev");
        await analytics.drain();
        expect(spy).toHaveBeenCalledOnce();
        d();
        resolve();
      });
    });
  });
});

// ─── drainInterval / drainSize ────────────────────────────────────────────────

describe("drainInterval / drainSize", () => {
  it("batches events and dispatches on the drain interval", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "p", track: ({ payload }) => spy(payload.event) };
    const [analytics, cleanup] = makeAnalytics([plugin], { drainInterval: 30 });

    analytics.track("a");
    analytics.track("b");
    analytics.track("c");

    await delay(10);
    expect(spy).not.toHaveBeenCalled(); // not dispatched yet

    await delay(30); // drain interval fires
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls.map(c => c[0])).toEqual(["a", "b", "c"]);
    cleanup();
  });

  it("drainSize limits events per cycle, leaving the rest for the next tick", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "p", track: ({ payload }) => spy(payload.event) };
    const [analytics, cleanup] = makeAnalytics([plugin], { drainInterval: 30, drainSize: 2 });

    analytics.track("a");
    analytics.track("b");
    analytics.track("c");

    await delay(40); // first drain fires
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls.map(c => c[0])).toEqual(["a", "b"]);

    await delay(30); // second drain fires
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2]![0]).toBe("c");
    cleanup();
  });

  it("pendingCount reflects queued events in batch mode", async () => {
    await new Promise<void>(resolve => {
      createRoot(d => {
        const spy = vi.fn();
        const plugin: AnalyticsPlugin = { name: "p", track: () => spy() };
        const analytics = createAnalytics([plugin], { drainInterval: 50 });
        analytics.track("a");
        analytics.track("b");
        flush();
        expect(analytics.pendingCount()).toBe(2);
        delay(60).then(() => {
          flush();
          expect(analytics.pendingCount()).toBe(0);
          expect(spy).toHaveBeenCalledTimes(2);
          d();
          resolve();
        });
      });
    });
  });

  it("without drainInterval events dispatch immediately (default behavior unchanged)", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "p", track: ({ payload }) => spy(payload.event) };
    const [analytics, cleanup] = makeAnalytics([plugin]);
    analytics.track("immediate");
    await delay(5);
    expect(spy).toHaveBeenCalledWith("immediate");
    cleanup();
  });
});

// ─── makeAnalyticsGuard ───────────────────────────────────────────────────────

describe("makeAnalyticsGuard", () => {
  it("onBeforeLeave prevents default and retries after drain", async () => {
    let resolveTrack!: () => void;
    const trackDone = new Promise<void>(res => (resolveTrack = res));

    const plugin: AnalyticsPlugin = { name: "p", track: () => trackDone };
    const [analytics, cleanupAnalytics] = makeAnalytics([plugin]);
    analytics.track("ev"); // in-flight

    const { onBeforeLeave, cleanup } = makeAnalyticsGuard(analytics);

    const retried = vi.fn();
    const event: BeforeLeaveEvent = {
      defaultPrevented: false,
      preventDefault: vi.fn(),
      retry: retried,
    };

    onBeforeLeave(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(retried).not.toHaveBeenCalled();

    resolveTrack();
    await delay(10);
    expect(retried).toHaveBeenCalledWith(true);

    cleanup();
    cleanupAnalytics();
  });

  it("does not re-guard when already guarding", async () => {
    let resolveTrack!: () => void;
    const trackDone = new Promise<void>(res => (resolveTrack = res));
    const plugin: AnalyticsPlugin = { name: "slow", track: () => trackDone };
    const [analytics, cleanupAnalytics] = makeAnalytics([plugin]);
    analytics.track("ev"); // keep a dispatch in-flight so drain() doesn't resolve immediately
    const { onBeforeLeave, cleanup } = makeAnalyticsGuard(analytics);

    const event: BeforeLeaveEvent = {
      defaultPrevented: false,
      preventDefault: vi.fn(),
      retry: vi.fn(),
    };

    onBeforeLeave(event); // first call — sets guarding = true
    onBeforeLeave(event); // second call while still guarding — should be ignored
    expect(event.preventDefault).toHaveBeenCalledOnce();

    resolveTrack();
    await delay(10);
    cleanup();
    cleanupAnalytics();
  });

  it("does nothing when event.defaultPrevented is true", () => {
    const [analytics, cleanupAnalytics] = makeAnalytics([makeReadyPlugin()]);
    const { onBeforeLeave, cleanup } = makeAnalyticsGuard(analytics);

    const event: BeforeLeaveEvent = {
      defaultPrevented: true,
      preventDefault: vi.fn(),
      retry: vi.fn(),
    };
    onBeforeLeave(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    cleanup();
    cleanupAnalytics();
  });
});

// ─── createAnalyticsGuard ─────────────────────────────────────────────────────

describe("createAnalyticsGuard", () => {
  let dispose: () => void;
  afterEach(() => dispose?.());

  it("auto-removes beforeunload listener on owner disposal", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    createRoot(d => {
      dispose = d;
      const analytics = createAnalytics([makeReadyPlugin()]);
      createAnalyticsGuard(analytics);
    });
    dispose();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function), undefined);
    removeSpy.mockRestore();
  });
});
