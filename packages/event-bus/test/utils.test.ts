import { describe, test, expect } from "vitest";
import { createRoot, getOwner } from "solid-js";
import { createEmitter, once, toEffect, toPromise } from "../src";

describe("toPromise", () => {
  test("toPromise turns subscription into a promise", async () => {
    const emitter = createEmitter<string>();
    const promise = toPromise(emitter.listen);

    expect(promise).instanceOf(Promise);

    promise.then(event => {
      expect(event).toBe("foo");
    });

    setTimeout(() => {
      emitter.emit("foo");
    }, 0);
  });
});

describe("once", () => {
  test("once()", () => {
    const captured: any[] = [];
    const { listen, emit } = createEmitter<string>();

    once(listen, a => captured.push(a));

    emit("foo");
    expect(captured.length, "first emit should work").toBe(1);

    emit("bar");
    expect(captured.length, "second emit shouldn't be captured").toBe(1);

    once(listen, a => captured.push(a), true);
    emit("foo");
    expect(captured.length, "protected: first emit should work").toBe(2);

    emit("bar");
    expect(captured.length, "protected: second emit shouldn't be captured").toBe(2);
  });
});

describe("toEffect", () => {
  test("toEffect()", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      let capturedOwner: any;
      const { listen, emit } = createEmitter<string>();
      const emitInEffect = toEffect(emit);
      listen(e => {
        captured.push(e);
        capturedOwner = getOwner();
      });

      // owner gets set to null synchronously after root executes
      setTimeout(() => {
        emit("foo");
        expect(
          capturedOwner,
          "owner will should not be available inside listener after using normal emit"
        ).toBe(null);

        emitInEffect("bar");
        expect(captured).toEqual(["foo", "bar"]);
        expect(
          capturedOwner,
          "owner will should be available inside listener after using emitInEffect"
        ).not.toBe(null);
        dispose();
      }, 0);
    }));
});
