import { describe, test, expect } from "vitest";
import { createRoot, createEffect, flush } from "solid-js";
import { makeQueue, createQueue, createTaskQueue } from "../src/index.js";

describe("makeQueue", () => {
  test("creates an empty queue", () => {
    const q = makeQueue<number>();
    expect(q.size).toBe(0);
    expect(q.isEmpty).toBe(true);
    expect(q.first).toBeUndefined();
    expect(q.last).toBeUndefined();
  });

  test("creates a queue with initial values", () => {
    const q = makeQueue([1, 2, 3]);
    expect(q.size).toBe(3);
    expect(q.isEmpty).toBe(false);
    expect(q.first).toBe(1);
    expect(q.last).toBe(3);
  });

  test("does not mutate the initial values array", () => {
    const initial = [1, 2, 3];
    const q = makeQueue(initial);
    q.add(4);
    expect(initial).toHaveLength(3);
  });

  test("add appends to the back", () => {
    const q = makeQueue([1, 2]);
    q.add(3);
    expect(q.size).toBe(3);
    expect(q.first).toBe(1);
    expect(q.last).toBe(3);
  });

  test("add accepts multiple items at once", () => {
    const q = makeQueue<number>();
    q.add(1, 2, 3);
    expect(q.size).toBe(3);
    expect(q.first).toBe(1);
    expect(q.last).toBe(3);
  });

  test("remove returns and removes the front item", () => {
    const q = makeQueue([1, 2, 3]);
    const removed = q.remove();
    expect(removed).toBe(1);
    expect(q.size).toBe(2);
    expect(q.first).toBe(2);
  });

  test("remove on an empty queue returns undefined", () => {
    const q = makeQueue<number>();
    expect(q.remove()).toBeUndefined();
    expect(q.size).toBe(0);
  });

  test("clear empties the queue", () => {
    const q = makeQueue([1, 2, 3]);
    q.clear();
    expect(q.size).toBe(0);
    expect(q.isEmpty).toBe(true);
    expect(q.first).toBeUndefined();
    expect(q.last).toBeUndefined();
  });

  test("clear on an already-empty queue is a no-op", () => {
    const q = makeQueue<number>();
    q.clear();
    expect(q.size).toBe(0);
  });

  test("last reflects the back of the queue", () => {
    const q = makeQueue([10]);
    expect(q.last).toBe(10);
    q.add(20);
    expect(q.last).toBe(20);
    q.remove();
    expect(q.last).toBe(20);
  });
});

describe("createQueue", () => {
  test("creates an empty reactive queue", () => {
    createRoot(dispose => {
      const q = createQueue<number>();
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.first()).toBeUndefined();
      expect(q.last()).toBeUndefined();
      expect(q.queue()).toEqual([]);
      dispose();
    });
  });

  test("creates a queue with initial values", () => {
    createRoot(dispose => {
      const q = createQueue([1, 2, 3]);
      expect(q.size()).toBe(3);
      expect(q.isEmpty()).toBe(false);
      expect(q.first()).toBe(1);
      expect(q.last()).toBe(3);
      expect(q.queue()).toEqual([1, 2, 3]);
      dispose();
    });
  });

  test("does not mutate the initial values array", () => {
    createRoot(dispose => {
      const initial = [1, 2, 3];
      const q = createQueue(initial);
      q.add(4);
      flush();
      expect(initial).toHaveLength(3);
      dispose();
    });
  });

  test("add appends items and updates reactive accessors", () => {
    createRoot(dispose => {
      const q = createQueue<number>();
      q.add(1, 2, 3);
      flush();
      expect(q.size()).toBe(3);
      expect(q.first()).toBe(1);
      expect(q.last()).toBe(3);
      expect(q.isEmpty()).toBe(false);
      expect(q.queue()).toEqual([1, 2, 3]);
      dispose();
    });
  });

  test("remove returns the front item synchronously", () => {
    createRoot(dispose => {
      const q = createQueue([1, 2, 3]);
      const removed = q.remove();
      expect(removed).toBe(1);
      dispose();
    });
  });

  test("remove updates reactive accessors after flush", () => {
    createRoot(dispose => {
      const q = createQueue([1, 2, 3]);
      q.remove();
      flush();
      expect(q.size()).toBe(2);
      expect(q.first()).toBe(2);
      expect(q.queue()).toEqual([2, 3]);
      dispose();
    });
  });

  test("remove on an empty queue returns undefined and is a no-op", () => {
    createRoot(dispose => {
      const q = createQueue<number>();
      const removed = q.remove();
      flush();
      expect(removed).toBeUndefined();
      expect(q.size()).toBe(0);
      dispose();
    });
  });

  test("clear empties the queue", () => {
    createRoot(dispose => {
      const q = createQueue([1, 2, 3]);
      q.clear();
      flush();
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.first()).toBeUndefined();
      expect(q.last()).toBeUndefined();
      expect(q.queue()).toEqual([]);
      dispose();
    });
  });

  test("multiple mutations compose correctly", () => {
    createRoot(dispose => {
      const q = createQueue<number>();
      q.add(1, 2, 3);
      q.remove();
      flush();
      expect(q.queue()).toEqual([2, 3]);
      expect(q.first()).toBe(2);
      expect(q.size()).toBe(2);
      dispose();
    });
  });

  test("last accessor reflects the back of the queue", () => {
    createRoot(dispose => {
      const q = createQueue([10]);
      expect(q.last()).toBe(10);
      q.add(20);
      flush();
      expect(q.last()).toBe(20);
      q.remove();
      flush();
      expect(q.last()).toBe(20);
      dispose();
    });
  });

  test("reactive effects track size changes", () => {
    createRoot(dispose => {
      const q = createQueue<number>();
      const sizes: number[] = [];

      createEffect(
        () => q.size(),
        size => {
          sizes.push(size);
        },
      );

      flush();
      expect(sizes).toEqual([0]);

      q.add(1);
      flush();
      expect(sizes).toEqual([0, 1]);

      q.add(2, 3);
      flush();
      expect(sizes).toEqual([0, 1, 3]);

      q.remove();
      flush();
      expect(sizes).toEqual([0, 1, 3, 2]);

      q.clear();
      flush();
      expect(sizes).toEqual([0, 1, 3, 2, 0]);

      dispose();
    });
  });

  test("reactive effects track first changes", () => {
    createRoot(dispose => {
      const q = createQueue([1, 2, 3]);
      const firsts: (number | undefined)[] = [];

      createEffect(
        () => q.first(),
        first => {
          firsts.push(first);
        },
      );

      flush();
      expect(firsts).toEqual([1]);

      q.remove();
      flush();
      expect(firsts).toEqual([1, 2]);

      q.clear();
      flush();
      expect(firsts).toEqual([1, 2, undefined]);

      dispose();
    });
  });

  test("isEmpty transitions correctly", () => {
    createRoot(dispose => {
      const q = createQueue<string>();
      expect(q.isEmpty()).toBe(true);

      q.add("a");
      flush();
      expect(q.isEmpty()).toBe(false);

      q.remove();
      flush();
      expect(q.isEmpty()).toBe(true);

      dispose();
    });
  });
});

describe("createTaskQueue", () => {
  test("enqueue returns a Promise resolving with the task's return value", async () => {
    const q = createTaskQueue<number>();
    const result = await q.enqueue(async () => 42);
    expect(result).toBe(42);
  });

  test("supports synchronous tasks", async () => {
    const q = createTaskQueue<string>();
    const result = await q.enqueue(() => "hello");
    expect(result).toBe("hello");
  });

  test("processes tasks sequentially, not concurrently", async () => {
    const q = createTaskQueue<number>();
    const log: number[] = [];

    let startTask2!: () => void;
    const blockingTask = new Promise<number>(r => {
      startTask2 = () => r(1);
    });

    const p1 = q.enqueue(() => blockingTask.then(v => { log.push(1); return v; }));
    const p2 = q.enqueue(async () => { log.push(2); return 2; });

    // task2 must not start until task1 finishes
    expect(log).toEqual([]);

    startTask2();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(log).toEqual([1, 2]);
    expect(r1).toBe(1);
    expect(r2).toBe(2);
  });

  test("size reflects pending task count (excludes the running task)", async () => {
    const q = createTaskQueue<void>();

    let releaseTask1!: () => void;
    const p1 = q.enqueue(() => new Promise<void>(r => { releaseTask1 = r; }));
    q.enqueue(async () => {});
    q.enqueue(async () => {});

    // task1 running (shifted off), task2 + task3 pending
    flush();
    expect(q.size()).toBe(2);
    expect(q.active()).toBe(true);

    releaseTask1();
    await p1;
    flush();
    expect(q.size()).toBe(1);

    await q.enqueue(async () => {}); // drains task2 and task3
    flush();
    expect(q.size()).toBe(0);
    expect(q.active()).toBe(false);
  });

  test("active becomes true immediately and false after queue drains", async () => {
    const q = createTaskQueue<void>();
    expect(q.active()).toBe(false);

    let release!: () => void;
    const p = q.enqueue(() => new Promise<void>(r => { release = r; }));
    flush();
    expect(q.active()).toBe(true);

    release();
    await p;
    flush();
    expect(q.active()).toBe(false);
  });

  test("task errors reject that task's Promise without stopping the queue", async () => {
    const q = createTaskQueue<number>();

    await expect(
      q.enqueue(async () => { throw new Error("boom"); }),
    ).rejects.toThrow("boom");

    // Queue should still be functional
    const result = await q.enqueue(async () => 99);
    expect(result).toBe(99);
  });

  test("clear rejects pending tasks while the active task continues", async () => {
    const q = createTaskQueue<number>();

    let release!: () => void;
    const p1 = q.enqueue(() => new Promise<number>(r => { release = () => r(1); }));
    const p2 = q.enqueue(async () => 2);
    const p3 = q.enqueue(async () => 3);

    q.clear();
    flush();
    expect(q.size()).toBe(0);

    // waiting tasks are rejected
    await expect(p2).rejects.toThrow("Queue cleared");
    await expect(p3).rejects.toThrow("Queue cleared");

    // active task still resolves
    release();
    expect(await p1).toBe(1);
  });

  test("new tasks enqueued after clear are processed normally", async () => {
    const q = createTaskQueue<number>();

    let release!: () => void;
    q.enqueue(() => new Promise<number>(r => { release = () => r(0); }));
    const toBeCleared = q.enqueue(async () => 1);

    q.clear();
    await expect(toBeCleared).rejects.toThrow("Queue cleared");
    release();

    const result = await q.enqueue(async () => 42);
    expect(result).toBe(42);
  });

  test("tasks added while draining are picked up without restarting the drain", async () => {
    const q = createTaskQueue<number>();
    const results: number[] = [];

    const p1 = q.enqueue(async () => { results.push(1); return 1; });
    // Enqueue task2 before task1 resolves — drain is already running
    const p2 = q.enqueue(async () => { results.push(2); return 2; });

    await Promise.all([p1, p2]);
    expect(results).toEqual([1, 2]);
  });
});
