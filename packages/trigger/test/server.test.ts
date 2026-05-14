import { describe, test, expect, vi } from "vitest";
import { createTrigger, createTriggerCache } from "../src/index.js";

describe("createTrigger", () => {
  test("returns no-ops on the server", () => {
    const [track, dirty] = createTrigger();
    expect(track).toBeTypeOf("function");
    expect(dirty).toBeTypeOf("function");
    expect(() => track()).not.toThrow();
    expect(() => dirty()).not.toThrow();
  });
});

describe("createTriggerCache", () => {
  test("dirty and dirtyAll are no-ops on the server", () => {
    const [track, dirty, dirtyAll] = createTriggerCache<string>();
    expect(() => dirty("key")).not.toThrow();
    expect(() => dirtyAll()).not.toThrow();
    expect(() => track("key")).not.toThrow();
  });
});
