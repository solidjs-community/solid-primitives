import { describe, expect, test } from "vitest";
import { renderToString } from "@solidjs/web";
import {
  makeFavicon,
  createFavicon,
  makeFaviconAnimation,
  createFaviconAnimation,
  makeFaviconBadge,
  createFaviconBadge,
  makeFaviconScheme,
  createFaviconScheme,
  makeFaviconProgress,
  createFaviconProgress,
  FaviconLink,
} from "../src/index.js";

describe("SSR safety", () => {
  test("makeFavicon returns an inert controller", () => {
    const favicon = makeFavicon("/a.png");
    expect(favicon.href).toBe("/a.png");
    expect(() => favicon.setHref("/b.png")).not.toThrow();
    expect(() => favicon.dispose()).not.toThrow();
  });

  test("createFavicon returns a static accessor", () => {
    const href = createFavicon("/a.png");
    expect(href()).toBe("/a.png");
  });

  test("makeFaviconAnimation returns an inert controller", () => {
    const anim = makeFaviconAnimation(["/a.png", "/b.png"]);
    expect(anim.href).toBe("/a.png");
    expect(anim.playing).toBe(false);
    expect(() => anim.play()).not.toThrow();
    expect(() => anim.pause()).not.toThrow();
    expect(() => anim.dispose()).not.toThrow();
  });

  test("createFaviconAnimation returns inert accessors", () => {
    const spinner = createFaviconAnimation(["/a.png", "/b.png"]);
    expect(spinner.frame()).toBe(0);
    expect(spinner.playing()).toBe(false);
    expect(() => spinner.play()).not.toThrow();
    expect(() => spinner.pause()).not.toThrow();
  });

  test("makeFaviconBadge returns an inert controller", () => {
    const badge = makeFaviconBadge("/a.png", 3);
    expect(badge.href).toBe("/a.png");
    expect(() => badge.dispose()).not.toThrow();
  });

  test("createFaviconBadge returns a static accessor", () => {
    const href = createFaviconBadge("/a.png", 3);
    expect(href()).toBe("/a.png");
  });

  test("makeFaviconScheme returns an inert light-scheme controller", () => {
    const favicon = makeFaviconScheme({ light: "/light.png", dark: "/dark.png" });
    expect(favicon.href).toBe("/light.png");
    expect(favicon.scheme).toBe("light");
    expect(() => favicon.setHref("/other.png")).not.toThrow();
    expect(() => favicon.dispose()).not.toThrow();
  });

  test("createFaviconScheme returns static light-scheme accessors", () => {
    const favicon = createFaviconScheme({ light: "/light.png", dark: "/dark.png" });
    expect(favicon.href()).toBe("/light.png");
    expect(favicon.scheme()).toBe("light");
  });

  test("createFaviconScheme lazily re-reads a function icons accessor", () => {
    let icons = { light: "/light.png", dark: "/dark.png" };
    const favicon = createFaviconScheme(() => icons);
    expect(favicon.href()).toBe("/light.png");

    icons = { light: "/light-2.png", dark: "/dark-2.png" };
    expect(favicon.href()).toBe("/light-2.png");
  });

  test("makeFaviconProgress returns an inert controller", () => {
    const favicon = makeFaviconProgress("/a.png", 40);
    expect(favicon.href).toBe("/a.png");
    expect(() => favicon.dispose()).not.toThrow();
  });

  test("createFaviconProgress returns a static accessor", () => {
    const href = createFaviconProgress("/a.png", 40);
    expect(href()).toBe("/a.png");
  });

  test("FaviconLink renders a real <link> into the server-rendered HTML", () => {
    const html = renderToString(() => <FaviconLink href="/a.png" />);
    expect(html).toContain('rel="icon"');
    expect(html).toContain('href="/a.png"');
  });

  test("FaviconLink + createFaviconScheme together SSR the guessed initial href", () => {
    const html = renderToString(() => {
      const scheme = createFaviconScheme({ light: "/light.png", dark: "/dark.png" });
      return <FaviconLink href={scheme.href()} />;
    });
    expect(html).toContain('href="/light.png"');
  });
});
