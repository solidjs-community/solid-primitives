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
  Accessor,
} from "solid-js";
import { $RAW } from "solid-js/store";
import { trueFn, arrayEquals } from "@solid-primitives/utils";
import { keyArray } from "@solid-primitives/keyed";

export const [nMemos, setNMemos] = createSignal(0);

const log = (label: string, ...a: any[]) =>
  console.log("\x1b[90m%s\x1b[0m", `${label.toUpperCase()}|`, ...a);

const createMemo: typeof _createMemo = ((a: any, b: any, c: any) => {
  setNMemos(n => n + 1);
  onCleanup(() => setNMemos(n => n - 1));
  return _createMemo(a, b, c);
}) as any;

export type ImmutablePrimitive = string | number | boolean | null | undefined;
export type ImmutableObject = { [key: string]: ImmutableValue; id?: ImmutablePrimitive };
export type ImmutableArray = ImmutableValue[];
export type ImmutableValue = ImmutablePrimitive | ImmutableObject | ImmutableArray;

class CommonTraps<T extends ImmutableObject | ImmutableArray> implements ProxyHandler<T> {
  trackKeys?: Accessor<Array<string | symbol>>;
  owner: Owner;

  constructor(public source: Accessor<T>) {
    this.owner = createRoot(getOwner)!;
  }

  getSourceValue(property: PropertyKey) {
    const s = this.source() as any;
    return s && typeof s === "object" ? s[property] : undefined;
  }

  has(target: T, property: PropertyKey) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
      return true;
    return property in this.source();
  }
  ownKeys(): Array<string | symbol> {
    if (getListener() && !this.trackKeys)
      runWithOwner(this.owner, () => {
        this.trackKeys = createMemo<Array<string | symbol>>(prev => {
          const keys = Reflect.ownKeys(this.source());
          return arrayEquals(keys, prev) ? prev : keys;
        }, []);
      });
    return this.trackKeys ? this.trackKeys() : Reflect.ownKeys(this.source());
  }
  set = trueFn;
  deleteProperty = trueFn;
}

type ObjectTrapsCached = { get: () => ImmutableValue; memo: boolean };
class ObjectTraps extends CommonTraps<ImmutableObject> implements ProxyHandler<ImmutableObject> {
  cache = new Map<PropertyKey, ObjectTrapsCached>();

  constructor(source: Accessor<ImmutableObject>) {
    super(source);
  }

  getCachedValue(cached: ObjectTrapsCached) {
    if (!cached.memo && getListener()) {
      cached.memo = true;
      cached.get = runWithOwner(this.owner, () => createMemo(cached.get))!;
    }
    return cached.get();
  }

  get(target: ImmutableObject, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.source);
    if (property === $PROXY || property === $TRACK) return receiver;
    if (property === Symbol.iterator) return undefined;
    if (property === "id") return untrack(this.source).id;

    let cached = this.cache.get(property);
    if (cached) return this.getCachedValue(cached);

    cached = {
      get: createWrapper(() => this.getSourceValue(property)),
      memo: false,
    };
    this.cache.set(property, cached);
    return this.getCachedValue(cached);
  }
}

type ArrayTrapsCached = { get: () => ImmutableValue; dispose: VoidFunction | undefined };
class ArrayTraps extends CommonTraps<ImmutableArray> implements ProxyHandler<ImmutableArray> {
  #trackLength!: Accessor<number>;

  #trackItems!: Accessor<ArrayTrapsCached[]>;

  constructor(source: Accessor<ImmutableArray>) {
    super(source);

    runWithOwner(this.owner, () => {
      this.#trackItems = createMemo(
        keyArray(
          this.source,
          (item, index) => (item && typeof item === "object" && "id" in item ? item.id : index),
          item => {
            const cached: ArrayTrapsCached = {
              get: createWrapper(item),
              dispose: undefined,
            };
            onCleanup(() => cached.dispose?.());
            return cached;
          },
        ),
        [],
        { equals: arrayEquals },
      );

      this.#trackLength = createMemo(() => this.#trackItems().length, 0);
    });
  }

  #getCachedValue(cached: ArrayTrapsCached) {
    if (!cached.dispose && getListener())
      createRoot(dispose => {
        cached.dispose = dispose;
        cached.get = createMemo(cached.get);
      }, this.owner);
    return cached.get();
  }

  get(target: ImmutableArray, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.source);
    if (property === $PROXY) return receiver;
    if (property === $TRACK) {
      this.#trackItems();
      return receiver;
    }

    if (property === Symbol.iterator || property === "slice") {
      this.#trackItems();
      return untrack(this.source)[property as any];
    }

    if (property === "length") return this.#trackLength();

    if (typeof property === "symbol") return this.getSourceValue(property);

    if (typeof property === "string") {
      const num = Number(property);
      if (num === num) property = num;
      else return this.getSourceValue(property);
    }

    if (property >= untrack(this.#trackLength))
      return this.#trackLength(), this.getSourceValue(property);

    const cached = untrack(this.#trackItems)[property];
    return cached ? this.#getCachedValue(cached) : undefined;
  }
}

function createWrapper<T extends ImmutableValue>(source: () => T): () => T {
  let id: ImmutableValue;
  let prev: ImmutableValue;
  let prevResult: ImmutableValue;

  return () => {
    const v = source() as any;

    if (v === prev) return prevResult;
    prev = v;

    if (v && typeof v === "object") {
      if (v.id === id && prevResult) return prevResult;

      id = v.id;
      return (prevResult = wrap(v, source));
    }

    id = undefined;
    return (prevResult = v);
  };
}

function wrap<T extends ImmutableObject | ImmutableArray>(initialValue: T, source: () => T): T {
  return untrack(
    () =>
      new Proxy(
        initialValue.constructor(),
        new (Array.isArray(initialValue) ? ArrayTraps : ObjectTraps)(source as any),
      ),
  );
}

export function createImmutable<T extends ImmutableObject | ImmutableArray>(source: () => T): T {
  const memo = createMemo(source);
  return wrap(memo(), memo);
}
