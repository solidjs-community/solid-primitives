import "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { makeFaviconProgress, createFaviconProgress } from "../src/index.js";
import { installCanvasMock, installImageMock } from "./setup.js";

const baseHref = "/base.png";

/** Lets the load-image microtask, the async draw chain, and its `.then` settle. */
const flushMicrotasks = async (times = 10): Promise<void> => {
  for (let i = 0; i < times; i++) await Promise.resolve();
};

// Re-installed per test: see the module doc in `setup.ts` for why this file can't rely on that
// module's own import-time side effects alone.
beforeEach(() => {
  installCanvasMock();
  installImageMock();
});

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

describe("makeFaviconProgress", () => {
  test("undefined renders no ring", async () => {
    const favicon = makeFaviconProgress(baseHref, undefined);
    await flushMicrotasks();
    expect(favicon.href).toBe(new URL(baseHref, location.href).href);
    favicon.dispose();
  });

  test("a number draws a ring", async () => {
    const favicon = makeFaviconProgress(baseHref, 40);
    await flushMicrotasks();
    expect(favicon.href).toContain("ring=true");
    favicon.dispose();
  });

  test("0 still draws the track (distinct from undefined)", async () => {
    const favicon = makeFaviconProgress(baseHref, 0);
    await flushMicrotasks();
    expect(favicon.href).toContain("ring=true");
    expect(favicon.href).toContain("arcs=1"); // track only, no progress arc
    favicon.dispose();
  });

  test("a positive value draws both the track and the progress arc", async () => {
    const favicon = makeFaviconProgress(baseHref, 40);
    await flushMicrotasks();
    expect(favicon.href).toContain("arcs=2");
    favicon.dispose();
  });

  test("100 sweeps a full circle", async () => {
    const favicon = makeFaviconProgress(baseHref, 100);
    await flushMicrotasks();
    expect(favicon.href).toContain("endAngle=" + (-Math.PI / 2 + Math.PI * 2).toString());
    favicon.dispose();
  });

  test("values are clamped to [0, 100]", async () => {
    // Sequential — makeFaviconProgress shares the one document favicon link, so two
    // concurrently in-flight instances would race to write the same element's href.
    const over = makeFaviconProgress(baseHref, 150);
    await flushMicrotasks();
    expect(over.href).toContain("arcs=2"); // clamps to 100: track + full progress arc
    over.dispose();

    const under = makeFaviconProgress(baseHref, -20);
    await flushMicrotasks();
    expect(under.href).toContain("arcs=1"); // clamps to 0: track only, no progress arc
    under.dispose();
  });

  test("falls back to the base href if the image fails to load", async () => {
    const favicon = makeFaviconProgress("error:missing.png", 40);
    await flushMicrotasks();
    expect(favicon.href).toBe(new URL("error:missing.png", location.href).href);
    favicon.dispose();
  });

  test("dispose restores the previous favicon", async () => {
    const favicon = makeFaviconProgress(baseHref, 40);
    await flushMicrotasks();
    favicon.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });

  test("a draw that resolves after dispose does not clobber the restored favicon", async () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/previous.png";
    document.head.appendChild(existing);

    const favicon = makeFaviconProgress(baseHref, 40);
    favicon.dispose(); // dispose before the async draw (still in flight) has settled
    await flushMicrotasks();

    expect(document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href).toBe(
      new URL("/previous.png", location.href).href,
    );
  });

  test("respects custom trackColor and color", async () => {
    const favicon = makeFaviconProgress(baseHref, 40, {
      trackColor: "#222222",
      color: "#333333",
    });
    await flushMicrotasks();
    expect(favicon.href).toContain("trackColor=#222222");
    expect(favicon.href).toContain("ringColor=#333333");
    favicon.dispose();
  });
});

describe("createFaviconProgress", () => {
  test("applies the initial progress and restores on cleanup", async () => {
    let href!: () => string;
    createRoot(dispose => {
      href = createFaviconProgress(baseHref, 25);
      return dispose;
    });
    await flushMicrotasks();
    expect(href()).toContain("ring=true");
  });

  test("redraws when the progress accessor changes", async () => {
    await createRoot(async dispose => {
      const [progress, setProgress] = createSignal<number | undefined>(10);
      const href = createFaviconProgress(baseHref, progress);

      await flushMicrotasks();
      expect(href()).toContain("arcs=2");

      setProgress(undefined);
      flush();
      await flushMicrotasks();
      expect(href()).toBe(new URL(baseHref, location.href).href);

      dispose();
    });
  });

  test("redraws when the href accessor changes (progress static)", async () => {
    await createRoot(async dispose => {
      const [path, setPath] = createSignal(baseHref);
      const href = createFaviconProgress(path, 40);

      await flushMicrotasks();
      const firstHref = href();
      expect(firstHref).toContain("arcs=2");

      setPath("/other.png");
      flush();
      await flushMicrotasks();

      expect(href()).toContain("arcs=2");
      expect(href()).not.toBe(firstHref);

      dispose();
    });
  });
});
