import { until } from "../src";
import { changed, includes } from "../src/resolvers";
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

const testChanged = suite("changed");

testChanged("resolves after changes", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let captured: any;
    until(changed(count, 2)).then(v => (captured = v));

    setCount(1);
    setTimeout(() => {
      assert.is(captured, undefined);

      setCount(1);
      setTimeout(() => {
        assert.is(captured, undefined);

        setCount(2);
        setTimeout(() => {
          assert.is(captured, true);
          dispose();
        }, 0);
      }, 0);
    }, 0);
  })
);

testChanged.run();

const testIncludes = suite("includes");

testIncludes("resolves when matches", () =>
  createRoot(dispose => {
    const [list, setList] = createSignal([4, 5]);
    const [count, setCount] = createSignal(0);
    const res = includes(list, count);

    setCount(1);
    assert.is(res(), false);

    setList([1]);
    assert.is(res(), true);

    dispose();
  })
);

testIncludes("list of functions", () =>
  createRoot(dispose => {
    const fn1 = () => {};
    const fn2 = () => {};
    const [list, setList] = createSignal([fn1]);
    const res = includes(list, () => fn2);

    assert.is(res(), false);
    setList([fn1, fn2]);
    assert.is(res(), true);

    dispose();
  })
);

testIncludes.run();
