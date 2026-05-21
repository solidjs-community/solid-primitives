import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createRoot } from "solid-js";
import { fromStream, makeAbortable, createAbortable } from "../src/index.js";

const delay = (ms = 50) => new Promise<void>(resolve => setTimeout(resolve, ms));

describe("fromStream", () => {
  const createStream = (data: string) => new ReadableStream({
    start(controller) {
      const chars = data[Symbol.iterator]();
      const step = () => {
        const { value, done } = chars.next();
        if (done) return;
        controller.enqueue(value.codePointAt(0));
        delay(15).then(step);
      }
      delay().then(step);
    },
    pull(_controller) {},
    cancel: () => {},
  });

  test("streams from response", () => new Promise<void>(resolve => createRoot(dispose => {
    const data = "solid is great!";
    const stream = createMemo(fromStream(() => delay().then(() => {
      return new Response(createStream(data));
    })));

    createEffect(stream, (parts) => {
      expect(data.slice(0, parts.length)).toBe(parts);
      if (parts.length === data.length) {
        queueMicrotask(dispose);
        resolve();
      }
    })
  })), 2000);
  
  test("streams from web stream", () => new Promise<void>(resolve => createRoot(dispose => {
    const data = "solid is great!";
    const stream = createMemo(fromStream(() => delay().then(() => {
      return createStream(data);
    })));

    createEffect(stream, (parts) => {
      expect(data.slice(0, parts.length)).toBe(parts);
      if (parts.length === data.length) {
        queueMicrotask(dispose);
        resolve();
      }
    })
  })), 2000);
});

describe("makeAbortable", () => {
  test("makes a fetcher abortable", () => {
    const [signal, abort] = makeAbortable();
    const signal1 = signal();
    expect(signal1.aborted, "first signal should not be initially aborted").toBeFalsy();
    const signal2 = signal();
    expect(signal1.aborted, "first signal should be aborted after new request").toBeTruthy();
    expect(signal2, "already aborted signal should not be re-used").not.toBe(signal1);
    expect(signal2.aborted, "second signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal2.aborted, "signal should be aborted when calling abort()").toBeTruthy();
  });

  test("aborts on chained signal abort", () => {
    const [sig1, abort] = makeAbortable();
    const [sig2] = makeAbortable({ chainTo: sig1 });
    const signal1 = sig1(), signal2 = sig2();
    expect(signal1.aborted, "first signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal2.aborted, "chained signal was not aborted by the chained signal abort").toBeTruthy();
  });

  test("chained signal does not abort its parent", () => {
    const [sig1] = makeAbortable();
    const [sig2, abort] = makeAbortable({ chainTo: sig1 });
    const signal1 = sig1(), signal2 = sig2();
    expect(signal2.aborted, "second signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal1.aborted, "signal chaining works in the wrong direction").toBeFalsy();
  });

  test("filters (only) abort errors", async () => {
    class AbortError extends Error {
      constructor(msg: string) {
        super(msg);
      }
      name = "AbortError";
    }
    const [_signal, _abort, filterAbortError] = makeAbortable();
    await Promise.reject(new AbortError("test"))
      .catch(filterAbortError)
      .then(resolution => expect(resolution).toBeUndefined())
      .catch(err => expect.fail(err.message || "failed with error"));
    const noAbortError = new Error("not an AbortError");
    await Promise.reject(noAbortError)
      .catch(filterAbortError)
      .then(() => expect.fail("filtered error that was not an AbortError"))
      .catch(err => expect(err).toBe(noAbortError));
  });
});
