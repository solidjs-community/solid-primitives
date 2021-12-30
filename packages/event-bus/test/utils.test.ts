import { createEmitter, toPromise } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("toPromise");

test("toPromise turns subscription into a promise", async () => {
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

test.run();
