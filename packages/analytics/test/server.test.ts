import { describe, it, expect, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { makeAnalytics, createAnalytics } from "../src/analytics.js";
import type { AnalyticsPlugin, PagePayload, TrackPayload, IdentifyPayload } from "../src/types.js";

// These tests run with --mode ssr (isServer = true in @solidjs/web).
// Plugins that don't touch browser APIs work identically on client and server.

function delay(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── makeAnalytics (server) ───────────────────────────────────────────────────

describe("makeAnalytics (server)", () => {
  it("dispatches page events to a synchronous plugin", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "logger", page: ({ payload }) => spy(payload) };
    const [analytics, cleanup] = makeAnalytics([plugin]);

    analytics.page({ title: "SSR Home", path: "/home" });
    await analytics.drain();

    expect(spy).toHaveBeenCalledOnce();
    const payload = spy.mock.calls[0]![0] as PagePayload;
    expect(payload.type).toBe("page");
    expect(payload.properties.title).toBe("SSR Home");
    expect(payload.properties.path).toBe("/home");
    // Browser defaults (window.location etc.) are absent on the server
    expect(payload.properties.url).toBeUndefined();
    expect(payload.meta.rid).toBeTruthy();
    cleanup();
  });

  it("dispatches track events to a synchronous plugin", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "logger", track: ({ payload }) => spy(payload) };
    const [analytics, cleanup] = makeAnalytics([plugin]);

    analytics.track("server_render", { route: "/home", user: "u-1" });
    await analytics.drain();

    expect(spy).toHaveBeenCalledOnce();
    const payload = spy.mock.calls[0]![0] as TrackPayload;
    expect(payload.type).toBe("track");
    expect(payload.event).toBe("server_render");
    expect(payload.properties.route).toBe("/home");
    cleanup();
  });

  it("dispatches identify events to a synchronous plugin", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "logger", identify: ({ payload }) => spy(payload) };
    const [analytics, cleanup] = makeAnalytics([plugin]);

    analytics.identify("u-42", { role: "admin", plan: "enterprise" });
    await analytics.drain();

    expect(spy).toHaveBeenCalledOnce();
    const payload = spy.mock.calls[0]![0] as IdentifyPayload;
    expect(payload.type).toBe("identify");
    expect(payload.userId).toBe("u-42");
    expect(payload.traits.role).toBe("admin");
    cleanup();
  });

  it("queues events while a plugin initializes asynchronously", async () => {
    let resolveInit!: () => void;
    const initDone = new Promise<void>(res => (resolveInit = res));
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = {
      name: "async-logger",
      initialize: () => initDone,
      track: ({ payload }) => spy(payload),
    };
    const [analytics, cleanup] = makeAnalytics([plugin]);

    analytics.track("queued_on_server");
    await delay(); // init not yet resolved
    expect(spy).not.toHaveBeenCalled();

    resolveInit();
    await delay(20);
    expect(spy).toHaveBeenCalledOnce();
    cleanup();
  });

  it("dispatches to multiple server plugins sequentially", async () => {
    const order: string[] = [];
    const pluginA: AnalyticsPlugin = { name: "a", track: async () => { order.push("a"); } };
    const pluginB: AnalyticsPlugin = { name: "b", track: async () => { order.push("b"); } };
    const [analytics, cleanup] = makeAnalytics([pluginA, pluginB]);

    analytics.track("ev");
    await analytics.drain();

    expect(order).toEqual(["a", "b"]);
    cleanup();
  });

  it("abort() works on the server", async () => {
    const spyA = vi.fn();
    const spyB = vi.fn();
    const pluginA: AnalyticsPlugin = { name: "a", track: ({ abort }) => { spyA(); abort(); } };
    const pluginB: AnalyticsPlugin = { name: "b", track: () => spyB() };
    const [analytics, cleanup] = makeAnalytics([pluginA, pluginB]);

    analytics.track("ev");
    await analytics.drain();

    expect(spyA).toHaveBeenCalledOnce();
    expect(spyB).not.toHaveBeenCalled();
    cleanup();
  });

  it("drain() resolves after all server dispatches settle", async () => {
    let resolveTrack!: () => void;
    const trackDone = new Promise<void>(res => (resolveTrack = res));
    const order: string[] = [];
    const plugin: AnalyticsPlugin = {
      name: "slow",
      track: async () => { await trackDone; order.push("plugin"); },
    };
    const [analytics, cleanup] = makeAnalytics([plugin]);

    analytics.track("ev");
    const drained = analytics.drain().then(() => order.push("drained"));

    expect(order).toEqual([]);
    resolveTrack();
    await flushed;

    expect(order).toEqual(["plugin", "flushed"]);
    cleanup();
  });
});

// ─── createAnalytics (server) ─────────────────────────────────────────────────

describe("createAnalytics (server)", () => {
  it("dispatches events inside a createRoot scope on the server", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "logger", track: ({ payload }) => spy(payload) };

    await new Promise<void>(resolve => {
      createRoot(async dispose => {
        const analytics = createAnalytics([plugin]);
        flush();
        expect(analytics.pendingCount()).toBe(0);

        analytics.track("ssr_event", { ctx: "server" });
        await analytics.drain();

        expect(spy).toHaveBeenCalledOnce();
        const payload = spy.mock.calls[0]![0] as TrackPayload;
        expect(payload.event).toBe("ssr_event");
        dispose();
        resolve();
      });
    });
  });

  it("pendingCount() is 0 immediately for synchronous plugins on the server", () => {
    createRoot(dispose => {
      const plugin: AnalyticsPlugin = { name: "sync" };
      const analytics = createAnalytics([plugin]);
      flush();
      expect(analytics.pendingCount()).toBe(0);
      dispose();
    });
  });

  it("pendingCount() tracks queued events on the server", () =>
    new Promise<void>(resolve => {
      createRoot(d => {
        let resolveInit!: () => void;
        const initDone = new Promise<void>(res => (resolveInit = res));
        const plugin: AnalyticsPlugin = {
          name: "async",
          initialize: () => initDone,
          track: () => {},
        };
        const analytics = createAnalytics([plugin]);
        analytics.track("a");
        analytics.track("b");
        flush();
        expect(analytics.pendingCount()).toBe(2);

        resolveInit();
        delay(20).then(() => {
          flush();
          expect(analytics.pendingCount()).toBe(0);
          d();
          resolve();
        });
      });
    }));

  it("page() omits browser-only defaults on the server", async () => {
    const spy = vi.fn();
    const plugin: AnalyticsPlugin = { name: "logger", page: ({ payload }) => spy(payload) };

    await new Promise<void>(resolve => {
      createRoot(async dispose => {
        const analytics = createAnalytics([plugin]);
        analytics.page({ title: "SSR Page" });
        await analytics.drain();
        const payload = spy.mock.calls[0]![0] as PagePayload;
        expect(payload.properties.title).toBe("SSR Page");
        expect(payload.properties.url).toBeUndefined();
        dispose();
        resolve();
      });
    });
  });
});
