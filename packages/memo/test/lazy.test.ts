// import { createLazyMemo } from "../src";
// import { createEffect, createRoot, createSignal } from "solid-js";
// import { suite } from "uvu";
// import * as assert from "uvu/assert";

// const test = suite("createLazyMemo");

// test("won't run if not accessed", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     createLazyMemo(() => {
//       runs++;
//       return count();
//     });
//     setCount(1);
//     assert.is(runs, 0, "0 in setup");

//     setTimeout(() => {
//       assert.is(runs, 0, "0 after timeout");
//       setCount(2);
//       assert.is(runs, 0, "0 after set in timeout");
//       dispose();
//     }, 0);
//   }));

// test("runs after being accessed", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(() => {
//       runs++;
//       return count();
//     });
//     setCount(1);
//     assert.is(runs, 0, "0 in setup");

//     assert.is(memo(), 1, "memo matches the signal on the first access");
//     assert.is(runs, 1, "ran once");
//     dispose();
//   }));

// test("runs only once, even if accessed multiple times", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(() => {
//       runs++;
//       return count();
//     });
//     setCount(1);
//     assert.is(runs, 0, "0 in setup");

//     assert.is(memo(), 1, "memo matches the signal on the first access");
//     assert.is(memo(), 1, "memo matches the signal on the second access");
//     assert.is(memo(), 1, "memo matches the signal on the third access");
//     assert.is(runs, 1, "ran once");
//     dispose();
//   }));

// test("won't run if the root of where it was accessed is gone", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(() => {
//       runs++;
//       return count();
//     });
//     createRoot(dispose1 => {
//       assert.is(memo(), 0, "memo matches the signal");
//       assert.is(runs, 1, "ran once");
//       dispose1();
//     });

//     setCount(1);
//     assert.is(runs, 1, "ran only once. after dispose");

//     dispose();
//   }));

// test("will be running even if some of the reading roots are disposed", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(() => {
//       runs++;
//       return count();
//     });

//     const dispose1 = createRoot(dispose => {
//       assert.is(memo(), 0, "memo matches the signal");
//       assert.is(runs, 1, "ran once");
//       return dispose;
//     });
//     const dispose2 = createRoot(dispose => {
//       assert.is(memo(), 0, "memo matches the signal; 2. root");
//       assert.is(runs, 1, "ran once; 2. root");
//       return dispose;
//     });

//     console.log("runs", runs);

//     setCount(1);
//     console.log("runs", runs);
//     assert.is(runs, 2, "ran twice");

//     dispose1();
//     setCount(2);
//     assert.is(runs, 3, "ran 3 times");

//     dispose2();
//     setCount(3);
//     assert.is(runs, 3, "ran 3 times; (not changed)");

//     dispose();
//   }));

// test("initial value if NOT set in options", () =>
//   createRoot(dispose => {
//     const [count, setCount] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(() => {
//       runs++;
//       return count();
//     });
//     const captured: any[] = [];
//     createEffect(() => captured.push(memo()));

//     setTimeout(() => {
//       assert.equal(captured, [undefined, 0]);
//       dispose();
//     }, 0);
//   }));

// test("initial value if set in options", () =>
//   createRoot(dispose => {
//     const [count] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(
//       () => {
//         runs++;
//         return count();
//       },
//       { value: 5 }
//     );
//     const captured: any[] = [];
//     createEffect(() => captured.push(memo()));

//     setTimeout(() => {
//       assert.equal(captured, [5, 0]);
//       dispose();
//     }, 0);
//   }));

// test("initial value if enabled initial run", () =>
//   createRoot(dispose => {
//     const [count] = createSignal(0);
//     let runs = 0;
//     const memo = createLazyMemo(
//       () => {
//         runs++;
//         return count();
//       },
//       { init: true }
//     );
//     const captured: any[] = [];
//     createEffect(() => captured.push(memo()));

//     setTimeout(() => {
//       assert.equal(captured, [0]);
//       dispose();
//     }, 0);
//   }));

// test.run();
