import "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";
import { makeFaviconBadge, createFaviconBadge } from "../src/index.js";

const baseHref = "/base.png";

/** Lets the load-image microtask, the async draw chain, and its `.then` settle. */
const flushMicrotasks = async (times = 6): Promise<void> => {
  for (let i = 0; i < times; i++) await Promise.resolve();
};

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

describe("makeFaviconBadge", () => {
  test("falsy values (0, false, undefined) render no badge", async () => {
    for (const value of [0, false, undefined] as const) {
      const badge = makeFaviconBadge(baseHref, value);
      await flushMicrotasks();
      expect(badge.href).toBe(new URL(baseHref, location.href).href);
      badge.dispose();
    }
  });

  test("a number draws a badge with the digits as text", async () => {
    const badge = makeFaviconBadge(baseHref, 3);
    await flushMicrotasks();
    expect(badge.href).toContain("badge=true");
    expect(badge.href).toContain("text=3");
    badge.dispose();
  });

  test("numbers above max clamp to '{max}+'", async () => {
    const badge = makeFaviconBadge(baseHref, 150, { max: 99 });
    await flushMicrotasks();
    expect(badge.href).toContain("text=99+");
    badge.dispose();
  });

  test("true renders a dot with no text", async () => {
    const badge = makeFaviconBadge(baseHref, true);
    await flushMicrotasks();
    expect(badge.href).toContain("badge=true");
    expect(badge.href).toContain("text=;");
    badge.dispose();
  });

  test("a string value is shown verbatim", async () => {
    const badge = makeFaviconBadge(baseHref, "new");
    await flushMicrotasks();
    expect(badge.href).toContain("text=new");
    badge.dispose();
  });

  test("empty string renders no badge", async () => {
    const badge = makeFaviconBadge(baseHref, "");
    await flushMicrotasks();
    expect(badge.href).toBe(new URL(baseHref, location.href).href);
    badge.dispose();
  });

  test("falls back to the base href if the image fails to load", async () => {
    const badge = makeFaviconBadge("error:missing.png", 3);
    await flushMicrotasks();
    expect(badge.href).toBe(new URL("error:missing.png", location.href).href);
    badge.dispose();
  });

  test("dispose restores the previous favicon", async () => {
    const badge = makeFaviconBadge(baseHref, 3);
    await flushMicrotasks();
    badge.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });

  test("respects custom color and textColor", async () => {
    const badge = makeFaviconBadge(baseHref, 3, { color: "#000000", textColor: "#111111" });
    await flushMicrotasks();
    expect(badge.href).toContain("color=#000000");
    badge.dispose();
  });

  test("position moves the badge's center", async () => {
    const topLeft = makeFaviconBadge(baseHref, 3, { position: "top-left" });
    await flushMicrotasks();
    const topLeftHref = topLeft.href;
    topLeft.dispose();

    const bottomRight = makeFaviconBadge(baseHref, 3, { position: "bottom-right" });
    await flushMicrotasks();
    const bottomRightHref = bottomRight.href;
    bottomRight.dispose();

    expect(topLeftHref).not.toBe(bottomRightHref);
  });
});

describe("createFaviconBadge", () => {
  test("applies the initial badge and restores on cleanup", async () => {
    let href!: () => string;
    createRoot(dispose => {
      href = createFaviconBadge(baseHref, 5);
      return dispose;
    });
    await flushMicrotasks();
    expect(href()).toContain("text=5");
  });

  test("redraws when the value accessor changes", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal(1);
      const href = createFaviconBadge(baseHref, count);

      await flushMicrotasks();
      expect(href()).toContain("text=1");

      setCount(2);
      flush();
      await flushMicrotasks();
      expect(href()).toContain("text=2");

      dispose();
    });
  });

  test("clearing the value removes the badge", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal<number | undefined>(4);
      const href = createFaviconBadge(baseHref, count);

      await flushMicrotasks();
      expect(href()).toContain("badge=true");

      setCount(undefined);
      flush();
      await flushMicrotasks();
      expect(href()).toBe(new URL(baseHref, location.href).href);

      dispose();
    });
  });

  test("only the latest of two rapid value changes is applied", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal(1);
      const href = createFaviconBadge(baseHref, count);

      await flushMicrotasks();
      setCount(2);
      flush();
      setCount(3);
      flush();
      await flushMicrotasks();

      expect(href()).toContain("text=3");
      expect(href()).not.toContain("text=2");

      dispose();
    });
  });

  test("redraws when the href accessor changes (value static)", async () => {
    await createRoot(async dispose => {
      const [path, setPath] = createSignal(baseHref);
      const href = createFaviconBadge(path, 3);

      await flushMicrotasks();
      const firstHref = href();
      expect(firstHref).toContain("text=3");

      setPath("/other.png");
      flush();
      await flushMicrotasks();

      expect(href()).toContain("text=3");
      expect(href()).not.toBe(firstHref);

      dispose();
    });
  });
});
