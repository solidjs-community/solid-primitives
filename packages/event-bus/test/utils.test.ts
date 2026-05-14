import { describe, test, expect } from "vitest";
import { createRoot, flush, getOwner } from "solid-js";
import { createEventBus, once, toEffect, toPromise } from "../src/index.js";

describe("toPromise", () => {
  test("toPromise turns subscription into a promise", () =>
    createRoot(() => {
      const emitter = createEventBus<string>();
      const promise = toPromise(emitter.listen);

      expect(promise).instanceOf(Promise);

      promise.then(event => {
        expect(event).toBe("foo");
      });

      setTimeout(() => {
        emitter.emit("foo");
      }, 0);
    }));
});

describe("once", () => {
  test("once()", () =>
    createRoot(() => {
      const captured: any[] = [];
      const { listen, emit } = createEventBus<string>();

      once(listen, a => captured.push(a));

      emit("foo");
      expect(captured.length, "first emit should work").toBe(1);

      emit("bar");
      expect(captured.length, "second emit shouldn't be captured").toBe(1);
    }));
});

describe("toEffect", () => {
  test("toEffect()", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const captured: any[] = [];
        let capturedOwner: any;
        const { listen, emit } = createEventBus<string>();
        const emitInEffect = toEffect(emit);
        listen(e => {
          captured.push(e);
          capturedOwner = getOwner();
        });

        // owner is null after the synchronous root callback returns
        setTimeout(() => {
          emit("foo");
          expect(
            capturedOwner,
            "owner should not be available inside listener after using normal emit",
          ).toBe(null);

          emitInEffect("bar");
          flush();
          expect(captured).toEqual(["foo", "bar"]);
          expect(
            capturedOwner,
            "owner should be available inside listener after using emitInEffect",
          ).not.toBe(null);
          dispose();
          resolve();
        }, 0);
      }),
    ));
});
