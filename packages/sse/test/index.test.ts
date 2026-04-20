import "./setup";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { makeSSE, createSSE, createSSEStream, SSEReadyState } from "../src/index.js";
import { MockEventSource } from "./setup.js";

beforeAll(() => vi.useFakeTimers());
beforeEach(() => {
  vi.clearAllTimers();
  SSEInstances.length = 0;
});
afterAll(() => vi.useRealTimers());

// ── makeSSE ───────────────────────────────────────────────────────────────────

describe("makeSSE", () => {
  it("creates an EventSource in CONNECTING state", () => {
    const [source, cleanup] = makeSSE("https://example.com/events");
    expect(source).toBeInstanceOf(EventSource);
    expect(source.readyState).toBe(SSEReadyState.CONNECTING);
    cleanup();
  });

  it("returns a cleanup that closes the connection", () => {
    const [source, cleanup] = makeSSE("https://example.com/events");
    cleanup();
    expect(source.readyState).toBe(SSEReadyState.CLOSED);
  });

  it("fires onOpen when connection opens", () => {
    const onOpen = vi.fn();
    const [, cleanup] = makeSSE("https://example.com/events", { onOpen });
    vi.advanceTimersByTime(20);
    expect(onOpen).toHaveBeenCalledOnce();
    cleanup();
  });

  it("fires onMessage for unnamed message events", () => {
    const onMessage = vi.fn();
    const [source, cleanup] = makeSSE("https://example.com/events", { onMessage });
    vi.advanceTimersByTime(20);
    (source as unknown as MockEventSource).simulateMessage("hello");
    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ data: "hello" }));
    cleanup();
  });

  it("fires onError on error events", () => {
    const onError = vi.fn();
    const [source, cleanup] = makeSSE("https://example.com/events", { onError });
    (source as unknown as MockEventSource).simulateError();
    expect(onError).toHaveBeenCalledOnce();
    cleanup();
  });

  it("fires named custom event handlers", () => {
    const onUpdate = vi.fn();
    const [source, cleanup] = makeSSE("https://example.com/events", {
      events: { update: onUpdate },
    });
    vi.advanceTimersByTime(20);
    (source as unknown as MockEventSource).simulateMessage("payload", "update");
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: "payload" }));
    cleanup();
  });

  it("cleanup does not throw before connection opens", () => {
    const [, cleanup] = makeSSE("https://example.com/events");
    expect(() => cleanup()).not.toThrow();
  });
});

// ── createSSE ─────────────────────────────────────────────────────────────────

describe("createSSE", () => {
  it("starts in CONNECTING state", () =>
    createRoot(dispose => {
      const { readyState } = createSSE("https://example.com/events");
      expect(readyState()).toBe(SSEReadyState.CONNECTING);
      dispose();
    }));

  it("transitions to OPEN when connection opens", () =>
    createRoot(dispose => {
      const { readyState } = createSSE("https://example.com/events");
      vi.advanceTimersByTime(20);
      flush();
      expect(readyState()).toBe(SSEReadyState.OPEN);
      dispose();
    }));

  it("data throws NotReadyError before first message arrives", () =>
    createRoot(dispose => {
      const { data } = createSSE("https://example.com/events");
      expect(() => data()).toThrow();
      dispose();
    }));

  it("provides latest message via data signal after first message", () =>
    createRoot(dispose => {
      const { data, source } = createSSE("https://example.com/events");
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateMessage("hello");
      flush();
      expect(data()).toBe("hello");
      dispose();
    }));

  it("updates data on subsequent messages", () =>
    createRoot(dispose => {
      const { data, source } = createSSE("https://example.com/events");
      vi.advanceTimersByTime(20);
      flush();
      const mock = source() as unknown as MockEventSource;
      mock.simulateMessage("first");
      flush();
      expect(data()).toBe("first");
      mock.simulateMessage("second");
      flush();
      expect(data()).toBe("second");
      dispose();
    }));

  it("applies transform to incoming data", () =>
    createRoot(dispose => {
      const { data, source } = createSSE<{ value: number }>("https://example.com/events", {
        transform: JSON.parse,
      });
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateMessage(JSON.stringify({ value: 42 }));
      flush();
      expect(data()).toEqual({ value: 42 });
      dispose();
    }));

  it("returns initialValue before any message arrives (no pending state)", () =>
    createRoot(dispose => {
      const { data } = createSSE("https://example.com/events", {
        initialValue: "loading",
      });
      expect(data()).toBe("loading");
      dispose();
    }));

  it("calls onError for non-terminal errors (browser reconnecting)", () =>
    createRoot(dispose => {
      const errors: Event[] = [];
      const { source } = createSSE("https://example.com/events", {
        reconnect: { retries: 1, delay: 50 },
        onError: e => errors.push(e),
      });
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateError();
      flush();
      expect(errors.length).toBe(1);
      // After successful reconnect data is still accessible (previous value kept)
      dispose();
    }));

  it("transitions to CLOSED and throws error through data() on terminal error", () =>
    createRoot(dispose => {
      const { data, readyState, source } = createSSE("https://example.com/events", {
        reconnect: false,
      });
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateError();
      flush();
      expect(readyState()).toBe(SSEReadyState.CLOSED);
      expect(() => data()).toThrow(); // propagates to <Errored> boundary
      dispose();
    }));

  it("does not app-reconnect on transient errors (browser handles those)", () =>
    createRoot(dispose => {
      const initialCount = SSEInstances.length;
      const { source } = createSSE("https://example.com/events", {
        reconnect: { retries: 5, delay: 50 },
      });
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateTransientError();
      flush();
      vi.advanceTimersByTime(300);
      flush();
      // readyState stayed CONNECTING → no new EventSource was created
      expect(SSEInstances.length).toBe(initialCount + 1);
      dispose();
    }));

  it("auto-reconnects on terminal error when reconnect option is set", () =>
    createRoot(dispose => {
      const { source } = createSSE("https://example.com/events", {
        reconnect: { retries: 1, delay: 100 },
      });
      vi.advanceTimersByTime(20);
      flush();
      const first = source();
      (first as unknown as MockEventSource).simulateError();
      flush();
      expect(source()).toBe(first); // no change yet
      vi.advanceTimersByTime(150);
      flush();
      expect(source()).not.toBe(first); // new connection opened
      dispose();
    }));

  it("respects retry limit", () =>
    createRoot(dispose => {
      const { source } = createSSE("https://example.com/events", {
        reconnect: { retries: 1, delay: 50 },
      });
      vi.advanceTimersByTime(20);
      flush();
      const first = source();
      (first as unknown as MockEventSource).simulateError();
      flush();
      vi.advanceTimersByTime(100); // first retry
      flush();
      const second = source();
      expect(second).not.toBe(first);
      vi.advanceTimersByTime(20); // second opens
      flush();
      (second as unknown as MockEventSource).simulateError();
      flush();
      vi.advanceTimersByTime(200); // no more retries
      flush();
      expect(source()).toBe(second); // still the same source
      dispose();
    }));

  it("close() transitions to CLOSED and stops reconnects", () =>
    createRoot(dispose => {
      const { readyState, close } = createSSE("https://example.com/events");
      vi.advanceTimersByTime(20);
      flush();
      expect(readyState()).toBe(SSEReadyState.OPEN);
      close();
      flush();
      expect(readyState()).toBe(SSEReadyState.CLOSED);
      dispose();
    }));

  it("reconnect() opens a fresh connection and resets data to pending", () =>
    createRoot(dispose => {
      const { data, source, reconnect } = createSSE("https://example.com/events");
      vi.advanceTimersByTime(20);
      flush();
      const first = source();
      (first as unknown as MockEventSource).simulateMessage("hello");
      flush();
      expect(data()).toBe("hello");
      reconnect();
      flush();
      // Old source closed, new source opened
      expect(source()).not.toBe(first);
      expect(first?.readyState).toBe(SSEReadyState.CLOSED);
      // New connection receives a message — data resets properly
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateMessage("hello-v2");
      flush();
      expect(data()).toBe("hello-v2");
      dispose();
    }));

  it("reconnects when the URL signal changes and resets data to pending", () =>
    createRoot(dispose => {
      const [url, setUrl] = createSignal("https://example.com/v1/events");
      const { data, source } = createSSE(url);
      vi.advanceTimersByTime(20);
      flush();
      const first = source();
      (first as unknown as MockEventSource).simulateMessage("v1 data");
      flush();
      expect(data()).toBe("v1 data");
      setUrl("https://example.com/v2/events");
      flush();
      // Old source closed, new source opened for v2
      expect(source()).not.toBe(first);
      expect(first?.readyState).toBe(SSEReadyState.CLOSED);
      // New connection updates data on message
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateMessage("v2 data");
      flush();
      expect(data()).toBe("v2 data");
      dispose();
    }));

  it("clears terminal error on reconnect, allowing data to recover", () =>
    createRoot(dispose => {
      const { data, source, reconnect } = createSSE("https://example.com/events", {
        reconnect: false,
      });
      vi.advanceTimersByTime(20);
      flush();
      (source() as unknown as MockEventSource).simulateError();
      flush();
      expect(() => data()).toThrow(); // terminal error on first call (no stale cache)
      reconnect();
      flush();
      vi.advanceTimersByTime(20);
      flush();
      // Terminal error cleared — new message updates data successfully
      (source() as unknown as MockEventSource).simulateMessage("recovered");
      flush();
      expect(data()).toBe("recovered");
      dispose();
    }));

  it("closes connection on owner disposal", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const { source } = createSSE("https://example.com/events");
        vi.advanceTimersByTime(20);
        flush();
        const es = source();
        vi.spyOn(es as unknown as MockEventSource, "close").mockImplementation(() => resolve());
        dispose();
      }),
    ));
});

// ── createSSEStream ───────────────────────────────────────────────────────────

describe("createSSEStream", () => {
  it("data throws NotReadyError before first message arrives", () =>
    createRoot(dispose => {
      const data = createSSEStream("https://example.com/events");
      expect(() => data()).toThrow();
      dispose();
    }));

  it("provides latest message after first message resolves", async () => {
    await new Promise<void>(resolve =>
      createRoot(async dispose => {
        const data = createSSEStream("https://example.com/events");
        vi.advanceTimersByTime(20);
        // Locate the mock source via SSEInstances
        const mock = SSEInstances[SSEInstances.length - 1]!;
        mock.simulateMessage("stream-hello");
        // Let the async iterator microtask resolve
        await Promise.resolve();
        await Promise.resolve();
        flush();
        expect(data()).toBe("stream-hello");
        dispose();
        resolve();
      }),
    );
  });

  it("applies transform to incoming data", async () => {
    await new Promise<void>(resolve =>
      createRoot(async dispose => {
        const data = createSSEStream<{ v: number }>("https://example.com/events", {
          transform: JSON.parse,
        });
        vi.advanceTimersByTime(20);
        const mock = SSEInstances[SSEInstances.length - 1]!;
        mock.simulateMessage(JSON.stringify({ v: 7 }));
        await Promise.resolve();
        await Promise.resolve();
        flush();
        expect(data()).toEqual({ v: 7 });
        dispose();
        resolve();
      }),
    );
  });

  it("propagates terminal error through data()", async () => {
    await new Promise<void>(resolve =>
      createRoot(async dispose => {
        const data = createSSEStream("https://example.com/events");
        vi.advanceTimersByTime(20);
        const mock = SSEInstances[SSEInstances.length - 1]!;
        mock.simulateError(); // CLOSED → terminal
        await Promise.resolve();
        await Promise.resolve();
        flush();
        expect(() => data()).toThrow();
        dispose();
        resolve();
      }),
    );
  });
});
