import { createEmitter, once, toPromise } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

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
