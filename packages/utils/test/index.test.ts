import { createComputed, createRoot } from "solid-js";
import { createStaticStore } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const tss = suite("createStaticStore");

tss("individual keys only update when changed", () =>
  createRoot(dispose => {
    const _shape = {
      a: 1,
      b: 2,
      c: 3,
      d: [0, 1, 2]
    };
    const [state, setState] = createStaticStore(_shape);

    assert.equal(state, _shape);
    assert.equal(_shape, { a: 1, b: 2, c: 3, d: [0, 1, 2] }, "original input shouldn't be mutated");

    setState({
      a: 9,
      d: [3, 2, 1]
    });

    assert.equal(state, { a: 9, b: 2, c: 3, d: [3, 2, 1] });
    assert.equal(_shape, { a: 1, b: 2, c: 3, d: [0, 1, 2] }, "original input shouldn't be mutated");

    let aUpdates = -1;
    createComputed(() => {
      state.a;
      aUpdates++;
    });
    assert.is(aUpdates, 0);

    setState({
      b: 3
    });
    assert.is(aUpdates, 0);
    setState("a", 4);
    assert.is(aUpdates, 1);

    dispose();
  })
);

// tss("able to listen to key, not yet added", () =>
//   createRoot(dispose => {
//     const _shape = {};
//     const [state, setState] = createShallowStore<{ a?: number }>(_shape);

//     let captured: any[] = [];
//     createComputed(() => captured.push(state.a));

//     assert.equal(captured, [undefined]);

//     setState("a", 1);

//     assert.equal(captured, [undefined, 1]);

//     dispose();
//   })
// );

tss.run();
