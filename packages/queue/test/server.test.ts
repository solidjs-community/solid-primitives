import { describe, test, expect } from "vitest";
import { makeQueue, createQueue, createTaskQueue } from "../src/index.js";

describe("makeQueue — SSR", () => {
  test("works without a browser environment", () => {
    const q = makeQueue([1, 2, 3]);
    expect(q.size).toBe(3);
    expect(q.first).toBe(1);
    expect(q.last).toBe(3);

    q.add(4);
    expect(q.size).toBe(4);

    const removed = q.remove();
    expect(removed).toBe(1);
    expect(q.size).toBe(3);

    q.clear();
    expect(q.isEmpty).toBe(true);
  });
});

describe("createQueue — SSR", () => {
  test("works without a browser environment", () => {
    const q = createQueue([1, 2, 3]);
    expect(q.size()).toBe(3);
    expect(q.first()).toBe(1);
    expect(q.last()).toBe(3);
    expect(q.isEmpty()).toBe(false);
  });

  test("initial empty queue is stable", () => {
    const q = createQueue<string>();
    expect(q.size()).toBe(0);
    expect(q.isEmpty()).toBe(true);
    expect(q.first()).toBeUndefined();
    expect(q.last()).toBeUndefined();
  });
});

describe("createTaskQueue — SSR", () => {
  test("enqueues and resolves tasks without a browser environment", async () => {
    const q = createTaskQueue<number>();
    expect(q.size()).toBe(0);
    expect(q.active()).toBe(false);

    const result = await q.enqueue(async () => 7);
    expect(result).toBe(7);
  });
});
