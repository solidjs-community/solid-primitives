/*

To do:
- [x] objects
- [ ] arrays
- [ ] circular references
- [ ] multiple references
- [ ] memoize?
- [ ] toggle check deleted/added object properties
- [ ] reuse object/array cache
- [ ] can objects be handled as arrays?

*/

import { createLazyMemo } from "@solid-primitives/memo";
import { Accessor, createRoot } from "solid-js";

export type AllNestedValues<T> = T extends (infer U)[]
  ? AllNestedValues<U> | T
  : T extends Record<string | number, infer U>
  ? AllNestedValues<U> | T
  : T;

export type Diff<T> = {
  path: (string | number)[];
  value: AllNestedValues<T> | undefined;
  prev: AllNestedValues<T> | undefined;
};

const checkIsObject = (value: any) => value != null && typeof value === "object";

export function createStoreDiff<T extends object>(): (newStore: T) => Diff<T>[] {
  type CacheRecord = Record<string | number, CacheNode>;

  type CacheNode = {
    ref: any;
    record?: CacheRecord;
    dirty?: Accessor<{ v: boolean }>;
  };

  const cache: CacheRecord = {
    root: {
      ref: undefined,
    },
  };

  let diffs: Diff<T>[];

  function createNodes(value: any, isObject: boolean): CacheRecord | undefined {
    if (isObject) {
      const record: CacheRecord = { ...value };

      for (const [key, node] of Object.entries(value)) {
        record[key] = {
          ref: node,
          record: createNodes(node, checkIsObject(node)),
        };
      }

      return record;
    }
  }

  function compare(
    value: any,
    parent: CacheRecord,
    key: string | number,
    path: (string | number)[],
  ): void {
    const node = parent[key];

    const prev = node && node.ref;
    const isObject = checkIsObject(value);
    const isArray = Array.isArray(value);
    let isSame = node && node.ref === value;

    let isDirty: { v: boolean } | undefined;
    if (isSame && isArray && (isDirty = node!.dirty!()).v) {
      isSame = isDirty.v = false;
    }

    // console.log({ value, node, prev, parent, key, path, isSame, isObject });

    if (isSame) {
      if (isArray) {
        for (let i = 0; i < value.length; i++) {
          compare(value[i], node.record!, i, [...path, i]);
        }
      } else if (isObject) {
        for (const key in value) {
          compare(value[key], node.record!, key, [...path, key]);
        }
        // removed keys
        for (const key in node.record!) {
          if (!(key in value)) {
            diffs.push({ path: [...path, key], value: undefined, prev: node.record[key]!.ref });
            delete node.record[key];
          }
        }
      }
    } else {
      diffs.push({ path, value, prev });
      if (isArray) {
        const dirty = createRoot(() => createLazyMemo(p => ((p.v = true), p), { v: false }));
        parent[key] = {
          ref: value,
          dirty,
          record: createNodes(value, isObject),
        };
      } else {
        parent[key] = {
          ref: value,
          record: createNodes(value, isObject),
        };
      }
    }
  }

  return (obj: T) => {
    console.log("-------------------");
    diffs = [];
    compare(obj, cache, "root", []);

    return diffs;
  };
}
