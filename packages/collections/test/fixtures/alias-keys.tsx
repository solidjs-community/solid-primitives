import { createEffect, createMemo, Loading } from "solid-js";
import { createReactiveMap, createReactiveWeakMap } from "../../src/index.ts";

export let aliasCurrent: {
  has: boolean[];
  get: (number | undefined)[];
  read(): [boolean, number | undefined];
};

export function AliasKeyFixture(props: { weak: boolean; optimistic: boolean }) {
  const key = createMemo(async () => ({ tag: "transported" }));
  const compute = async () => {
    const k = key();
    await new Promise(resolve => setTimeout(resolve, 20));
    return new Map([[k, 1]]);
  };
  const map = props.weak
    ? createReactiveWeakMap(compute, { optimistic: props.optimistic, loadingValue: [] })
    : createReactiveMap(compute, { optimistic: props.optimistic, loadingValue: new Map() });
  const has: boolean[] = [],
    get: (number | undefined)[] = [];
  createEffect(
    () => map.has(key()),
    value => {
      has.push(value);
    },
  );
  createEffect(
    () => map.get(key()),
    value => {
      get.push(value);
    },
  );
  aliasCurrent = { has, get, read: () => [map.has(key()), map.get(key())] };
  return (
    <Loading fallback="loading">
      <span>{String(map.has(key()))}</span>
      <b>{String(map.get(key()))}</b>
    </Loading>
  );
}
