import { expectTypeOf } from "vitest";
import { refresh, type Refreshable } from "solid-js";
import {
  createReactiveMap,
  type CreateReactiveMapComputeFunction,
  createReactiveWeakMap,
  createReactiveSet,
  type CreateReactiveSetComputeFunction,
  createReactiveWeakSet,
} from "@solid-primitives/collections";

// Compiled by tsconfig.test.json; never execute async work just to test types.
function types() {
  const entries = [["a", 1]] as const;
  expectTypeOf(createReactiveMap(entries)).toEqualTypeOf<Map<"a", 1>>();
  expectTypeOf(createReactiveSet([1, 2] as const)).toEqualTypeOf<Set<1 | 2>>();
  expectTypeOf(createReactiveMap(() => new Map<string, number>())).toEqualTypeOf<
    Refreshable<Map<string, number>>
  >();
  expectTypeOf(createReactiveMap(async () => new Map<string, number>())).toEqualTypeOf<
    Refreshable<Map<string, number>>
  >();
  expectTypeOf(createReactiveSet(() => new Set<number>())).toEqualTypeOf<
    Refreshable<Set<number>>
  >();
  expectTypeOf(
    createReactiveSet(async function* () {
      yield new Set<number>();
    }),
  ).toEqualTypeOf<Refreshable<Set<number>>>();
  const mapCompute: CreateReactiveMapComputeFunction<string, number> = draft => {
    draft.set("a", 1);
  };
  const setCompute: CreateReactiveSetComputeFunction<number> = async draft => {
    draft.add(1);
  };
  refresh(createReactiveMap(mapCompute));
  refresh(
    createReactiveSet(setCompute, {
      loadingValue: new Set([0]),
      ssrSource: "hybrid",
      deferStream: true,
      optimistic: true,
      name: "numbers",
    }),
  );
  const readonlyMap: ReadonlyMap<string, number> = new Map();
  const readonlySet: ReadonlySet<number> = new Set();
  createReactiveMap(() => readonlyMap, { loadingValue: readonlyMap });
  createReactiveSet(() => readonlySet, { loadingValue: readonlySet });
  // @ts-expect-error compute-only options require a compute function
  createReactiveSet([1], { loadingValue: new Set([0]) });
  // @ts-expect-error wrong map value type
  createReactiveMap<string, number>(() => new Map([["a", "wrong"]]));
  // @ts-expect-error no refresh contract on an iterable-only collection
  refresh(createReactiveSet([1]));

  const weakKey = { id: 1 };
  expectTypeOf(createReactiveWeakMap([[weakKey, 1]] as const)).toEqualTypeOf<
    WeakMap<{ id: number }, 1>
  >();
  expectTypeOf(createReactiveWeakSet([weakKey])).toEqualTypeOf<WeakSet<{ id: number }>>();
  expectTypeOf(createReactiveWeakMap(async () => [[weakKey, 1]] as const)).toEqualTypeOf<
    Refreshable<WeakMap<{ id: number }, 1>>
  >();
  expectTypeOf(
    createReactiveWeakSet(async function* () {
      yield [weakKey];
    }),
  ).toEqualTypeOf<Refreshable<WeakSet<{ id: number }>>>();
  refresh(
    createReactiveWeakMap<object, number>(
      async draft => {
        draft.set(weakKey, 1);
      },
      { loadingValue: [[weakKey, 0]], optimistic: true, ssrSource: "hybrid" },
    ),
  );
  createReactiveWeakSet<WeakKey>(draft => {
    draft.add(Symbol("weak"));
  });
  // @ts-expect-error primitive keys cannot be weak
  createReactiveWeakMap([[1, "no"]]);
  // @ts-expect-error native weak replacements are not enumerable
  createReactiveWeakMap(() => new WeakMap<object, number>());
  // @ts-expect-error native weak loading values are not enumerable
  createReactiveWeakSet<object>(() => {}, { loadingValue: new WeakSet<object>() });
  // @ts-expect-error compute-only options require a compute function
  createReactiveWeakSet([weakKey], { ssrSource: "client" });
  // @ts-expect-error iterable-only collections do not implement refresh
  refresh(createReactiveWeakMap([[weakKey, 1]]));
}
void types;
