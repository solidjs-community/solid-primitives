import "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { makeFaviconScheme, createFaviconScheme } from "../src/index.js";
import { installMatchMediaMock, setPrefersColorScheme } from "./setup.js";

const ICONS = { light: "/light.png", dark: "/dark.png" };

beforeEach(() => {
  installMatchMediaMock();
  setPrefersColorScheme("light");
});

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

describe("makeFaviconScheme", () => {
  test("starts on light when the OS prefers light", () => {
    const favicon = makeFaviconScheme(ICONS);
    expect(favicon.scheme).toBe("light");
    expect(favicon.href).toBe(new URL(ICONS.light, location.href).href);
    favicon.dispose();
  });

  test("starts on dark when the OS prefers dark", () => {
    setPrefersColorScheme("dark");
    const favicon = makeFaviconScheme(ICONS);
    expect(favicon.scheme).toBe("dark");
    expect(favicon.href).toBe(new URL(ICONS.dark, location.href).href);
    favicon.dispose();
  });

  test("switches when the OS preference changes", () => {
    const favicon = makeFaviconScheme(ICONS);
    setPrefersColorScheme("dark");
    expect(favicon.scheme).toBe("dark");
    expect(favicon.href).toBe(new URL(ICONS.dark, location.href).href);

    setPrefersColorScheme("light");
    expect(favicon.scheme).toBe("light");
    expect(favicon.href).toBe(new URL(ICONS.light, location.href).href);

    favicon.dispose();
  });

  test("dispose restores the previous favicon and stops watching", () => {
    const favicon = makeFaviconScheme(ICONS);
    favicon.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();

    setPrefersColorScheme("dark");
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });
});

describe("createFaviconScheme", () => {
  test("applies the initial scheme and restores on cleanup", () => {
    const { favicon, dispose } = createRoot(dispose => ({
      favicon: createFaviconScheme(ICONS),
      dispose,
    }));
    expect(favicon.scheme()).toBe("light");
    expect(favicon.href()).toBe(new URL(ICONS.light, location.href).href);

    dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });

  test("reacts to an OS-level scheme change", () => {
    const { favicon, dispose } = createRoot(dispose => ({
      favicon: createFaviconScheme(ICONS),
      dispose,
    }));

    setPrefersColorScheme("dark");
    flush();
    expect(favicon.scheme()).toBe("dark");
    expect(favicon.href()).toBe(new URL(ICONS.dark, location.href).href);

    dispose();
  });

  test("reacts to a reactive icons change", () => {
    const [icons, setIcons] = createSignal(ICONS);
    const { favicon, dispose } = createRoot(dispose => ({
      favicon: createFaviconScheme(icons),
      dispose,
    }));

    setIcons({ light: "/light-2.png", dark: "/dark-2.png" });
    flush();
    expect(favicon.href()).toBe(new URL("/light-2.png", location.href).href);

    dispose();
  });
});
