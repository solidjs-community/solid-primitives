import "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, test, afterEach } from "vitest";
import { makeFavicon, createFavicon } from "../src/index.js";

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

describe("makeFavicon", () => {
  test("creates a link[rel=icon] when none exists, removes it on dispose", () => {
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();

    const favicon = makeFavicon("/a.png");
    const link = document.head.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(favicon.href).toBe(new URL("/a.png", location.href).href);

    favicon.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });

  test("reuses an existing link and restores its href on dispose", () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/original.png";
    document.head.appendChild(existing);

    const favicon = makeFavicon("/new.png");
    expect(document.head.querySelectorAll('link[rel="icon"]').length).toBe(1);
    expect(favicon.href).toBe(new URL("/new.png", location.href).href);

    favicon.dispose();
    expect(existing.href).toBe(new URL("/original.png", location.href).href);
    existing.remove();
  });

  test("setHref updates the link", () => {
    const favicon = makeFavicon("/a.png");
    favicon.setHref("/b.png");
    expect(favicon.href).toBe(new URL("/b.png", location.href).href);
    favicon.dispose();
  });

  test("supports a custom rel", () => {
    const favicon = makeFavicon("/touch.png", { rel: "apple-touch-icon" });
    expect(document.head.querySelector('link[rel="apple-touch-icon"]')).not.toBeNull();
    favicon.dispose();
    expect(document.head.querySelector('link[rel="apple-touch-icon"]')).toBeNull();
  });

  test("nested make calls restore in LIFO order", () => {
    const outer = makeFavicon("/outer.png");
    const inner = makeFavicon("/inner.png");
    expect(inner.href).toBe(new URL("/inner.png", location.href).href);

    inner.dispose();
    expect(outer.href).toBe(new URL("/outer.png", location.href).href);

    outer.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });
});

describe("createFavicon", () => {
  test("applies the initial href and restores on cleanup", () => {
    const href = createRoot(dispose => {
      const href = createFavicon("/static.png");
      expect(href()).toBe(new URL("/static.png", location.href).href);
      dispose();
      return href;
    });
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
    expect(href()).toBe(new URL("/static.png", location.href).href);
  });

  test("reactively updates when given an accessor", () => {
    const [path, setPath] = createSignal("/a.png");
    const { href, dispose } = createRoot(dispose => ({ href: createFavicon(path), dispose }));

    expect(href()).toBe(new URL("/a.png", location.href).href);

    setPath("/b.png");
    flush();
    expect(href()).toBe(new URL("/b.png", location.href).href);

    dispose();
  });

  test("a static href never sets up an effect", () => {
    createRoot(dispose => {
      const href = createFavicon("/static.png");
      flush();
      expect(href()).toBe(new URL("/static.png", location.href).href);
      dispose();
    });
  });
});
