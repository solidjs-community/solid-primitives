import { until } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal } from "solid-js";

const testUntil = suite("until");

testUntil("return values", () => {
  const returned = until(() => true);
  assert.instance(returned, Promise);
  assert.type((returned as any).dispose, "function");
});

testUntil("awaits reactive condition", () =>
  createRoot(dispose => {
    const [state, setState] = createSignal(false);

    until(state).then(res => {
      assert.is(res, true);
      dispose();
    });

    setTimeout(() => {
      setState(true);
    }, 0);
  })
);

testUntil("computation stops when root disposes", () =>
  createRoot(dispose => {
    const [state, setState] = createSignal(false);
    let captured: any;
    let threw = false;

    until(state)
      .then(res => (captured = res))
      .catch(() => (threw = true));

    dispose();
    setState(true);

    setTimeout(() => {
      assert.is(captured, undefined);
      assert.is(threw, true);
    }, 0);
  })
);

//
// this test won't work with uvu & solid-register.
// but it should...
// the issue is related to `createSubRoot` being imported as a dependency (from "utils")
// when defined locally it doesn't have any issues
//

// testUntil(".dispose() will stop computation", () => {
//   const [state, setState] = createSignal(false);
//   let captured: any;
//   let threw = false;

//   const res = until(state);
//   res.then(res => (captured = res)).catch(() => (threw = true));

//   res.dispose();

//   setTimeout(() => {
//     setState(true);

//     setTimeout(() => {
//       assert.is(captured, undefined);
//       assert.is(threw, true);
//     }, 0);
//   }, 0);
// });

testUntil.run();
