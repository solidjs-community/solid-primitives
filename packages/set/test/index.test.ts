import { describe, it, assert, expect } from "vitest";
import { ReactiveSet, ReactiveWeakSet } from "../src";
import { createComputed, createRoot, createSignal } from "solid-js";
import { createTrigger } from "@solid-primitives/utils";

// export function createTrigger(): Trigger {
//   return createSignal(undefined, { equals: false });
// }

// function createTrigger(options) {
//   return createSignal(void 0, { equals: false, name: options == null ? void 0 : options.name });
// }

describe("ReactiveSet", () => {
  it("behaves like Set", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 1, 2, 3]);
      expect([...set]).to.deep.equal([1, 2, 3]);

      assert(set.add(4) === true);
      expect([...set]).to.deep.equal([1, 2, 3, 4]);

      assert(set.add(4) === false);
      expect([...set]).to.deep.equal([1, 2, 3, 4]);

      assert(set.has(2) === true);
      assert(set.delete(2) === true);
      assert(set.has(2) === false);

      set.clear();
      assert([...set].length === 0);

      dispose();
    }));

  it("vitest gets reactivity in deps", () =>
    createRoot(dispose => {
      let n = 0;
      const [track, dirty] = createTrigger();
      const get = () => {
        track();
        return n;
      };
      const set = () => {
        ++n;
        dirty();
      };

      const captured = [];
      createComputed(() => captured.push(get()));

      expect(captured).to.deep.equal([0]);

      set();
      expect(captured).to.deep.equal([0, 1]);

      dispose();
    }));

  // it("has() is reactive", () =>
  //   createRoot(dispose => {
  //     const set = new ReactiveSet([1, 1, 2, 3]);

  //     let captured = [];
  //     createComputed(() => captured.push(set.has(2)));
  //     expect(captured).to.deep.equal([true]);

  //     set.add(4);
  //     expect(captured).to.deep.equal([true]);

  //     set.delete(4);
  //     expect(captured).to.deep.equal([true]);

  //     set.delete(2);
  //     expect(captured).to.deep.equal([true, false]);

  //     set.add(2);
  //     expect(captured).to.deep.equal([true, false, true]);

  //     set.clear();
  //     expect(captured).to.deep.equal([true, false, true, false]);

  //     dispose();
  //   }));
});

// const testSet = suite("ReactiveSet");

// testSet("has() is reactive", () =>
//   createRoot(dispose => {
//     const set = new ReactiveSet([1, 1, 2, 3]);

//     let captured = [];
//     createComputed(() => {
//       captured.push(set.has(2));
//     });
//     assert.equal(captured, [true], "1");

//     set.add(4);
//     assert.equal(captured, [true], "2");

//     set.delete(4);
//     assert.equal(captured, [true], "3");

//     set.delete(2);
//     assert.equal(captured, [true, false], "4");

//     set.add(2);
//     assert.equal(captured, [true, false, true], "5");

//     set.clear();
//     assert.equal(captured, [true, false, true, false], "6");

//     dispose();
//   })
// );

// testSet.run();
