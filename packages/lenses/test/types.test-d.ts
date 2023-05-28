import type { ArrayFilterFn, StorePathRange } from "solid-js/store";
import { describe, expectTypeOf, test } from "vitest";
import type { EvaluatePath, StorePath } from "../src/types";

// Run via `pnpm typecheck` inside `/packages/lenses`

describe("StorePath", () => {
  test("objects can be indexed by string", () => {
    type StoreType = { a: number };
    type MyPath = ["a"];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("object keys must be valid", () => {
    type StoreType = { a: number };
    type MyPath = ["b"];
    expectTypeOf<MyPath>().not.toMatchTypeOf<StorePath<StoreType>>();
  });

  test("invalid paths give type errors", () => {
    type StoreType = { a: number };
    expectTypeOf<["a", "b"]>().not.toMatchTypeOf<StorePath<StoreType>>();
    expectTypeOf<[0]>().not.toMatchTypeOf<StorePath<StoreType>>();
  });

  test("objects can be nested", () => {
    type StoreType = { a: { b: number } };
    type MyPath = ["a", "b"];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("arrays can be indexed by number", () => {
    type StoreType = number[];
    type MyPath = [number];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("arrays can be nested", () => {
    type StoreType = number[][];
    type MyPath = [number, number];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("objects can contain arrays", () => {
    type StoreType = { a: number[] };
    type MyPath = ["a", number];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("arrays can contain objects", () => {
    type StoreType = { a: number }[];
    type MyPath = [number, "a"];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
  });

  test("arrays can be filtered by a function", () => {
    type StoreType = [1, 2, 3, 4];
    type MyPath = [(i: number) => boolean];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
    expectTypeOf<MyPath[0]>().toMatchTypeOf<ArrayFilterFn<number>>();
  });

  test("arrays can be filtered by a range", () => {
    type StoreType = [1, 2, 3, 4];
    type MyPath = [{ from: number; to: number }];
    expectTypeOf<MyPath>().toMatchTypeOf<StorePath<StoreType>>();
    expectTypeOf<MyPath[0]>().toMatchTypeOf<StorePathRange>();
  });
});

describe("EvaluatePath", () => {
  test("navigates an object type", () => {
    type StoreType = { a: { b: { c: string } } };
    type MyPath = ["a", "b", "c"];
    type DerivedStoreType = EvaluatePath<StoreType, MyPath>;
    expectTypeOf<DerivedStoreType>().toMatchTypeOf<string>();
    expectTypeOf<DerivedStoreType>().not.toMatchTypeOf<Record<string, any>>();
  });

  test("navigates an array type", () => {
    type StoreType = number[][];
    type MyPath = [0, 0];
    type DerivedStoreType = EvaluatePath<StoreType, MyPath>;
    expectTypeOf<DerivedStoreType>().toMatchTypeOf<number>();
    expectTypeOf<DerivedStoreType>().not.toMatchTypeOf<Record<string, any>>();
  });

  test("navigates nested objects and arrays", () => {
    type StoreType = { array: { nested: { doubleNested: string }[][] }[] };
    type MyPath = ["array", 0, "nested", 0, 0];
    type DerivedStoreType = EvaluatePath<StoreType, MyPath>;
    expectTypeOf<DerivedStoreType>().toMatchTypeOf<{ doubleNested: string }>();
    expectTypeOf<DerivedStoreType>().not.toMatchTypeOf<string>();
  });

  test("produces type error for invalid types", () => {
    type StoreType = { array: { nested: { doubleNested: string }[][] }[] };
    type MyPath = ["a", "b", "c"];
    // @ts-expect-error invalid path
    type DerivedStoreType = EvaluatePath<StoreType, MyPath>;
    expectTypeOf<DerivedStoreType>().toMatchTypeOf<never>();
    expectTypeOf<DerivedStoreType>().not.toMatchTypeOf<any>();
  });
});
