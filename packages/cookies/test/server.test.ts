import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { getCookiesString, createServerCookie, createUserTheme } from "../src/index.js";

describe("SSR", () => {
  it("getCookiesString returns a string without a request event", () => {
    expect(typeof getCookiesString()).toBe("string");
  });

  it("getCookiesString returns an empty string when there is no request event", () => {
    expect(getCookiesString()).toBe("");
  });

  it("createServerCookie initializes to undefined when no cookie header is present", () =>
    createRoot(dispose => {
      const [cookie] = createServerCookie("ssr_test");
      expect(cookie()).toBeUndefined();
      dispose();
    }));

  it("createServerCookie does not throw on the server", () =>
    createRoot(dispose => {
      expect(() => createServerCookie("ssr_safe")).not.toThrow();
      dispose();
    }));

  it("createUserTheme returns undefined on the server without a cookie header", () =>
    createRoot(dispose => {
      const [theme] = createUserTheme("ssr_theme");
      expect(theme()).toBeUndefined();
      dispose();
    }));

  it("createUserTheme returns defaultValue on the server when no cookie header is present", () =>
    createRoot(dispose => {
      const [theme] = createUserTheme("ssr_theme2", { defaultValue: "light" });
      expect(theme()).toBe("light");
      dispose();
    }));
});
