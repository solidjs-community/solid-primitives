import { type ArrayFilterFn, type StorePathRange } from "solid-js/store";
import { describe, expectTypeOf, test } from "vitest";
import { type StorePath } from "../src/types";

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
