import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createPostMessage, makePostMessage } from "../src/index.js";

const ORIGIN = "https://preview.example.com";

const fakeWindow = () => ({ postMessage: vi.fn() }) as unknown as Window;

const dispatch = (init: { data: unknown; origin?: string; source?: unknown }) =>
  window.dispatchEvent(
    new MessageEvent("message", {
      data: init.data,
      origin: init.origin ?? ORIGIN,
      source: (init.source ?? null) as MessageEventSource | null,
    }),
  );

const opts = { allowedOrigins: [ORIGIN], targetOrigin: ORIGIN };

describe("makePostMessage (window)", () => {
  const handles: { close(): void }[] = [];
  afterEach(() => {
    handles.splice(0).forEach(h => h.close());
  });
  const make = (target: Window, o: any = opts) => {
    const h = makePostMessage<any, any>(target, o);
    handles.push(h);
    return h;
  };

  it("delivers messages from the target with an allowed origin", () => {
    const w = fakeWindow();
    const h = make(w);
    const fn = vi.fn();
    h.onMessage(fn);
    dispatch({ data: { a: 1 }, source: w });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![0]).toEqual({ a: 1 });
  });

  it("ignores origin mismatches", () => {
    const w = fakeWindow();
    const h = make(w);
    const fn = vi.fn();
    h.onMessage(fn);
    dispatch({ data: 1, origin: "https://evil.example.com", source: w });
    expect(fn).not.toHaveBeenCalled();
  });

  it("ignores source mismatches", () => {
    const w = fakeWindow();
    const h = make(w);
    const fn = vi.fn();
    h.onMessage(fn);
    dispatch({ data: 1, source: fakeWindow() });
    dispatch({ data: 1, source: null });
    expect(fn).not.toHaveBeenCalled();
  });

  it("accepts every origin only with an explicit '*'", () => {
    const w = fakeWindow();
    const h = make(w, { allowedOrigins: ["*"], targetOrigin: ORIGIN });
    const fn = vi.fn();
    h.onMessage(fn);
    dispatch({ data: 1, origin: "https://anything.test", source: w });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("an empty allowedOrigins list accepts nothing", () => {
    const w = fakeWindow();
    const h = make(w, { allowedOrigins: [], targetOrigin: ORIGIN });
    const fn = vi.fn();
    h.onMessage(fn);
    dispatch({ data: 1, source: w });
    expect(fn).not.toHaveBeenCalled();
  });

  it("throws without allowedOrigins", () => {
    expect(() => makePostMessage(fakeWindow(), { targetOrigin: ORIGIN } as any)).toThrow(TypeError);
  });

  it("throws on send without targetOrigin, never defaulting to '*'", () => {
    const w = fakeWindow();
    const h = make(w, { allowedOrigins: [ORIGIN] });
    expect(() => h.send("x")).toThrow(TypeError);
    expect(w.postMessage).not.toHaveBeenCalled();
  });

  it("sends with the explicit targetOrigin and transfer list", () => {
    const w = fakeWindow();
    const h = make(w);
    const buf = new ArrayBuffer(1);
    expect(h.send({ hi: 1 }, [buf])).toBe(true);
    expect(w.postMessage).toHaveBeenCalledWith(
      { hi: 1 },
      { targetOrigin: ORIGIN, transfer: [buf] },
    );
  });

  it("allows '*' as targetOrigin only when given", () => {
    const w = fakeWindow();
    make(w, { allowedOrigins: [ORIGIN], targetOrigin: "*" }).send(1);
    expect((w.postMessage as any).mock.calls[0][1].targetOrigin).toBe("*");
  });

  it("narrows data with a validator and drops invalid messages", () => {
    const w = fakeWindow();
    const h = makePostMessage<{ type: "ready" }>(w, {
      ...opts,
      validate: (d): d is { type: "ready" } => (d as any)?.type === "ready",
    });
    handles.push(h);
    const seen: string[] = [];
    h.onMessage(d => seen.push(d.type)); // d is typed as { type: "ready" }
    dispatch({ data: { type: "nope" }, source: w });
    dispatch({ data: "str", source: w });
    dispatch({ data: { type: "ready" }, source: w });
    expect(seen).toEqual(["ready"]);
  });

  it("wraps and filters by channel envelope", () => {
    const w = fakeWindow();
    const h = make(w, { ...opts, channel: "editor" });
    const fn = vi.fn();
    h.onMessage(fn);
    h.send({ x: 1 });
    const sent = (w.postMessage as any).mock.calls[0][0];
    expect(sent).not.toEqual({ x: 1 });
    dispatch({ data: { x: 1 }, source: w }); // raw
    dispatch({ data: { ...sent, __solidPrimitivesPostMessage: "other" }, source: w });
    expect(fn).not.toHaveBeenCalled();
    dispatch({ data: sent, source: w });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![0]).toEqual({ x: 1 });
  });

  it("unsubscribe and close stop delivery and remove the listener", () => {
    const w = fakeWindow();
    const spy = vi.spyOn(window, "removeEventListener");
    const h = make(w);
    const fn = vi.fn();
    const off = h.onMessage(fn);
    off();
    dispatch({ data: 1, source: w });
    expect(fn).not.toHaveBeenCalled();
    h.onMessage(fn);
    h.close();
    expect(spy).toHaveBeenCalledWith("message", expect.any(Function));
    dispatch({ data: 1, source: w });
    expect(fn).not.toHaveBeenCalled();
    expect(h.send(1)).toBe(false);
    spy.mockRestore();
  });

  it("a throwing listener does not block the others", async () => {
    const w = fakeWindow();
    const h = make(w);
    const fn = vi.fn();
    const orig = globalThis.queueMicrotask;
    const rethrown: unknown[] = [];
    globalThis.queueMicrotask = ((cb: () => void) => {
      try {
        cb();
      } catch (e) {
        rethrown.push(e);
      }
    }) as typeof queueMicrotask;
    h.onMessage(() => {
      throw new Error("boom");
    });
    h.onMessage(fn);
    dispatch({ data: 1, source: w });
    globalThis.queueMicrotask = orig;
    expect(fn).toHaveBeenCalledTimes(1);
    expect(rethrown).toHaveLength(1);
  });

  it("resolves an iframe to its contentWindow lazily", () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const cw = iframe.contentWindow!;
    const spy = vi.spyOn(cw, "postMessage").mockImplementation(() => {});
    const h = make(iframe as any);
    const fn = vi.fn();
    h.onMessage(fn);
    expect(h.send("hi")).toBe(true);
    expect(spy).toHaveBeenCalledWith("hi", { targetOrigin: ORIGIN, transfer: [] });
    dispatch({ data: 1, source: cw });
    expect(fn).toHaveBeenCalledTimes(1);
    iframe.remove();
    const empty = make({ contentWindow: null } as any);
    expect(empty.send("x")).toBe(false); // no contentWindow yet
  });
});

describe("makePostMessage (MessagePort)", () => {
  it("exchanges messages and supports envelopes", async () => {
    const { port1, port2 } = new MessageChannel();
    const a = makePostMessage<string, string>(port1, { channel: "c" });
    const b = makePostMessage<string, string>(port2, { channel: "c" });
    const got = new Promise<string>(res => b.onMessage(res));
    a.send("hello");
    expect(await got).toBe("hello");
    a.close();
    b.close();
    port1.close();
    port2.close();
  });

  it("ignores raw messages when a channel is set", async () => {
    const { port1, port2 } = new MessageChannel();
    const b = makePostMessage(port2, { channel: "c" });
    const fn = vi.fn();
    b.onMessage(fn);
    port1.postMessage("raw");
    await new Promise(r => setTimeout(r, 20));
    expect(fn).not.toHaveBeenCalled();
    b.close();
    port1.close();
    port2.close();
  });
});

describe("createPostMessage", () => {
  it("tracks the latest message and cleans up with the owner", () => {
    const w = fakeWindow();
    const spy = vi.spyOn(window, "removeEventListener");
    const { dispose, ch } = createRoot(d => ({
      dispose: d,
      ch: createPostMessage<any>({ target: w, ...opts }),
    }));
    flush();
    expect(ch.message()).toBeUndefined();
    dispatch({ data: "a", source: w });
    flush();
    expect(ch.message()).toBe("a");
    dispatch({ data: "b", source: w });
    flush();
    expect(ch.message()).toBe("b");
    expect(ch.send("x")).toBe(true);
    dispose();
    flush();
    expect(spy).toHaveBeenCalledWith("message", expect.any(Function));
    dispatch({ data: "c", source: w });
    flush();
    expect(ch.message()).toBe("b");
    expect(ch.send("x")).toBe(false);
    spy.mockRestore();
  });

  it("notifies onMessage subscribers", () => {
    const w = fakeWindow();
    const fn = vi.fn();
    const dispose = createRoot(d => {
      createPostMessage<any>({ target: w, ...opts }).onMessage(fn);
      return d;
    });
    flush();
    dispatch({ data: 1, source: w });
    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("re-attaches when the iframe target changes", () => {
    const mk = () => {
      const f = document.createElement("iframe");
      document.body.append(f);
      return f;
    };
    const f1 = mk();
    const f2 = mk();
    const [target, setTarget] = createSignal<HTMLIFrameElement | undefined>(f1);
    const s1 = vi.spyOn(f1.contentWindow!, "postMessage").mockImplementation(() => {});
    const s2 = vi.spyOn(f2.contentWindow!, "postMessage").mockImplementation(() => {});
    let ch!: ReturnType<typeof createPostMessage<any, any>>;
    const dispose = createRoot(d => {
      ch = createPostMessage<any, any>({ target, ...opts });
      return d;
    });
    flush();
    ch.send(1);
    expect(s1).toHaveBeenCalledTimes(1);

    dispatch({ data: "from1", source: f1.contentWindow });
    flush();
    expect(ch.message()).toBe("from1");

    setTarget(f2);
    flush();
    ch.send(2);
    expect(s2).toHaveBeenCalledTimes(1);
    expect(s1).toHaveBeenCalledTimes(1);
    dispatch({ data: "stale", source: f1.contentWindow });
    flush();
    expect(ch.message()).toBe("from1");
    dispatch({ data: "from2", source: f2.contentWindow });
    flush();
    expect(ch.message()).toBe("from2");

    setTarget(undefined);
    flush();
    expect(ch.send(3)).toBe(false);
    dispose();
    f1.remove();
    f2.remove();
  });

  it("close() stops re-attachment", () => {
    const w = fakeWindow();
    const [target, setTarget] = createSignal<Window | undefined>(undefined);
    let ch!: ReturnType<typeof createPostMessage<any, any>>;
    const dispose = createRoot(d => {
      ch = createPostMessage<any, any>({ target, ...opts });
      return d;
    });
    flush();
    ch.close();
    setTarget(w);
    flush();
    expect(ch.send(1)).toBe(false);
    dispatch({ data: 1, source: w });
    flush();
    expect(ch.message()).toBeUndefined();
    dispose();
  });

  it("works with a MessagePort", async () => {
    const { port1, port2 } = new MessageChannel();
    let ch!: ReturnType<typeof createPostMessage<any, any>>;
    const dispose = createRoot(d => {
      ch = createPostMessage<any, any>({ target: port2 });
      return d;
    });
    flush();
    port1.postMessage("via-port");
    await new Promise(r => setTimeout(r, 20));
    flush();
    expect(ch.message()).toBe("via-port");
    dispose();
    port1.close();
    port2.close();
  });
});
