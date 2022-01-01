import { createEmitter, once, toEffect, toPromise } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot } from "solid-js";
import { getOwner } from "solid-js";

const tp = suite("toPromise");

tp("toPromise turns subscription into a promise", async () => {
  const emitter = createEmitter<string>();
  const promise = toPromise(emitter.listen);

  assert.instance(promise, Promise);

  promise.then(event => {
    assert.is(event, "foo");
  });

  setTimeout(() => {
    emitter.emit("foo");
  }, 0);
});

tp.run();

const testOnce = suite("once");

testOnce("once()", () => {
  const captured: any[] = [];
  const { listen, emit } = createEmitter<string>();

  once(listen, a => captured.push(a));

  emit("foo");
  assert.is(captured.length, 1, "first emit should work");

  emit("bar");
  assert.is(captured.length, 1, "second emit shouldn't be captured");

  once(listen, a => captured.push(a), true);
  emit("foo");
  assert.is(captured.length, 2, "protected: first emit should work");

  emit("bar");
  assert.is(captured.length, 2, "protected: second emit shouldn't be captured");
});

testOnce.run();

const testToEffect = suite("toEffect");

testToEffect("toEffect()", () =>
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
      assert.is(
        capturedOwner,
        null,
        "owner will should not be available inside listener after using normal emit"
      );

      emitInEffect("bar");
      assert.equal(captured, ["foo", "bar"]);
      assert.is.not(
        capturedOwner,
        null,
        "owner will should be available inside listener after using emitInEffect"
      );
      dispose();
    }, 0);
  })
);

testToEffect.run();
