import { describe, expect, it, vi } from "vitest";

import { cookieStorage } from "../src/index.js";

describe("cookieStorage", () => {
  it("adds/gets/removes an item", () => {
    expect(cookieStorage.getItem("test")).toBe(null);
    cookieStorage.setItem("test", "1");
    expect(cookieStorage.getItem("test")).toBe("1");
    cookieStorage.removeItem("test");
    expect(cookieStorage.getItem("test")).toBe(null);
  });

  describe("serializes options correctly", () => {
    it("all options set", () => {
      const set = vi.spyOn(document, "cookie", "set");
      cookieStorage.setItem("test3", "good", {
        domain: "https://localhost:3000",
        path: "/",
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
      });
      expect(set).toHaveBeenCalledWith(
        "test3=good; Domain=https://localhost:3000; Path=/; HttpOnly; Secure; Max-Age=604800",
      );
    });
    it("no options set", () => {
      const set = vi.spyOn(document, "cookie", "set");
      cookieStorage.setItem("test3", "good");
      expect(set).toHaveBeenCalledWith("test3=good");
    });
    it("false bool argument", () => {
      const set = vi.spyOn(document, "cookie", "set");
      cookieStorage.setItem("test3", "good", {
        httpOnly: false,
        secure: false,
      });
      expect(set).toHaveBeenCalledWith("test3=good");
    });
  });

  it('(de)-serializes utf-8 characters correctly', () => {
    const set = vi.spyOn(document, "cookie", "set");
    const umlaute = "äöüÄÖÜ"
    cookieStorage.setItem("test4", umlaute);
    expect(set).toHaveBeenCalledWith("test4=" + encodeURIComponent(umlaute));
    expect(cookieStorage.getItem("test4")).toBe(umlaute);
  });
});
