import {
  createRoot,
  createMemo as _createMemo,
  untrack,
  getOwner,
  runWithOwner,
  createSignal,
  $TRACK,
  $PROXY,
  onCleanup,
  getListener,
  Owner,
} from "solid-js";
import { $RAW } from "solid-js/store";
import { trueFn } from "@solid-primitives/utils";

export const [nMemos, setNMemos] = createSignal(0);

const log = (label: string, ...a: any[]) =>
  console.log("\x1b[90m%s\x1b[0m", `${label.toUpperCase()}|`, ...a);

const createMemo: typeof _createMemo = ((a: any, b: any, c: any) => {
  setNMemos(n => n + 1);
  onCleanup(() => setNMemos(n => n - 1));
  return _createMemo(a, b, c);
}) as any;

type ImmutablePrimitive = string | number | boolean | null | undefined;
type ImmutableObject = { [key: string]: ImmutableValue; id?: ImmutablePrimitive };
type ImmutableArray = ImmutableValue[];
type ImmutableValue = ImmutablePrimitive | ImmutableObject | ImmutableArray;

type Target<T extends ImmutableObject | ImmutableArray = ImmutableObject | ImmutableArray> = {
  source: () => T;
  owner: Owner;
  trackArray: VoidFunction | undefined;
  trackKeys: (() => Array<string | symbol>) | undefined;
  cache: Map<any, Cached>;
};
type Cached<T extends ImmutableValue = ImmutableValue> = {
  get: () => T;
  memo: boolean;
};

/**
 * Compares two arrays for immutable changes
 */
function arrayEquals(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i],
      bVal = b[i];
    if (
      aVal !== bVal &&
      (!aVal ||
        !bVal ||
        typeof aVal !== "object" ||
        typeof bVal !== "object" ||
        aVal.id !== bVal.id)
    )
      return false;
  }
  return true;
}

function trackArraySelf(target: Target<ImmutableArray>) {
  if (getListener()) {
    if (!target.trackArray)
      runWithOwner(target.owner, () => {
        let prev: unknown[] = [];
        target.trackArray = createMemo<boolean>(
          () => {
            const arr = target.source();
            const prevArr = prev;
            prev = arr;
            return Array.isArray(arr) && arrayEquals(arr, prevArr);
          },
          true,
          { equals: (_, b) => b },
        );
      });
    target.trackArray!();
  }
}

function ownKeysTrap(target: Target): Array<string | symbol> {
  if (getListener() && !target.trackKeys)
    runWithOwner(target.owner, () => {
      target.trackKeys = createMemo<Array<string | symbol>>(prev => {
        const keys = Reflect.ownKeys(target.source());
        return arrayEquals(keys, prev) ? prev : keys;
      }, []);
    });
  return target.trackKeys!();
}

function hasTrap(target: Target, property: any) {
  if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
    return true;
  return property in target.source();
}

function getSourceValue(target: Target, property: any) {
  return Reflect.get(target.source(), property);
}

function getValue(target: Target, cached: Cached) {
  if (!cached.memo && getListener()) {
    cached.memo = true;
    cached.get = runWithOwner(target.owner, () => createMemo(cached.get))!;
  }
  return cached.get();
}

const objectProxyTraps: ProxyHandler<Target<ImmutableObject>> = {
  get(target, property, receiver) {
    if (property === $RAW) return untrack(target.source);
    if (property === $PROXY || property === $TRACK) return receiver;
    if (property === Symbol.iterator) return undefined;

    if (property === "id") return getSourceValue(target, property);

    let cached = target.cache.get(property);
    if (cached) return getValue(target, cached);

    let id: ImmutableValue;
    let prevValue: ImmutableValue;
    let prevResult: ImmutableValue;

    cached = {
      get: () => {
        const v = getSourceValue(target, property);

        if (v === prevValue) return prevResult;
        prevValue = v;

        return untrack(() => {
          if (v && typeof v === "object") {
            if (v.id === id && prevResult) return prevResult;
            id = v.id;
            return (prevResult = wrap(v, getSourceValue.bind(null, target, property)));
          }

          id = undefined;
          return (prevResult = v);
        });
      },
      memo: false,
    };
    target.cache.set(property, cached);
    return getValue(target, cached);
  },
  has: hasTrap,
  ownKeys: ownKeysTrap,
  set: trueFn,
  deleteProperty: trueFn,
};

const arrayProxyTraps: ProxyHandler<Target<ImmutableArray>> = {
  get(target, property, receiver) {
    if (property === $RAW) return untrack(target.source);
    if (property === $PROXY) return receiver;
    if (property === $TRACK) {
      trackArraySelf(target);
      return receiver;
    }
    if (property === Symbol.iterator) {
      trackArraySelf(target);
      return untrack(target.source)[Symbol.iterator];
    }

    if (property === "id") return getSourceValue(target, property);

    let cached = target.cache.get(property);
    if (cached) return getValue(target, cached);

    let id: ImmutableValue;
    let prevValue: ImmutableValue;
    let prevResult: ImmutableValue;

    cached = {
      get: () => {
        const v = getSourceValue(target, property);

        if (v === prevValue) return prevResult;
        prevValue = v;

        return untrack(() => {
          if (v && typeof v === "object") {
            if (v.id === id && prevResult) return prevResult;
            id = v.id;
            return (prevResult = wrap(v, getSourceValue.bind(null, target, property)));
          }

          id = undefined;
          return (prevResult = v);
        });
      },
      memo: false,
    };
    target.cache.set(property, cached);
    return getValue(target, cached);
  },
  has: hasTrap,
  ownKeys: ownKeysTrap,
  set: trueFn,
  deleteProperty: trueFn,
};

function wrap<T extends ImmutableObject | ImmutableArray>(source: T, sourceMemo: () => T): T {
  const target = source.constructor() as Target<T>;
  target.source = sourceMemo;
  target.owner = createRoot(getOwner)!;
  target.trackArray = undefined;
  target.trackKeys = undefined;
  target.cache = new Map<any, Cached>();

  return new Proxy(target, Array.isArray(source) ? arrayProxyTraps : objectProxyTraps);
}

export function createImmutable<T extends object>(source: () => T): T {
  return wrap(source(), createMemo(source));
}
