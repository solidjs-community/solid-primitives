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

const createMemo: typeof _createMemo = ((a: any, b: any, c: any) => {
  setNMemos(n => n + 1);
  onCleanup(() => setNMemos(n => n - 1));
  return _createMemo(a, b, c);
}) as any;

export type ImmutablePrimitive = string | number | boolean | null | undefined;
export type ImmutableObject = { [key: string]: ImmutableValue; id?: ImmutablePrimitive };
export type ImmutableArray = ImmutableValue[];
export type ImmutableValue = ImmutablePrimitive | ImmutableObject | ImmutableArray;

const arrayEqualsOptions = { equals: arrayEquals };

class CommonTraps<T extends ImmutableObject | ImmutableArray> implements ProxyHandler<T> {
  trackKeys?: Accessor<Array<string | symbol>>;
  owner: Owner;

  constructor(public source: Accessor<T>) {
    this.owner = createRoot(getOwner)!;
  }

  getValue(property: PropertyKey) {
    const s = this.source() as any;
    return s && typeof s === "object" ? s[property] : undefined;
  }

  has(target: T, property: PropertyKey) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
      return true;
    this.ownKeys();
    return property in untrack(this.source);
  }
  ownKeys(): (string | symbol)[] {
    if (getListener() && !this.trackKeys)
      runWithOwner(
        this.owner,
        () =>
          (this.trackKeys = createMemo(
            () => Reflect.ownKeys(this.source()),
            [],
            arrayEqualsOptions,
          )),
      );

    return this.trackKeys ? this.trackKeys() : Reflect.ownKeys(this.source());
  }
  getOwnPropertyDescriptor(target: T, property: PropertyKey): PropertyDescriptor | undefined {
    this.ownKeys();
    return property in untrack(this.source)
      ? {
          enumerable: true,
          get: () => this.getValue(property),
          configurable: true,
        }
      : undefined;
  }
  set = trueFn;
  deleteProperty = trueFn;
}

type ObjectTrapsCached = { get: () => ImmutableValue; memo: boolean };
class ObjectTraps extends CommonTraps<ImmutableObject> implements ProxyHandler<ImmutableObject> {
  #cache = new Map<PropertyKey, ObjectTrapsCached>();

  constructor(source: Accessor<ImmutableObject>) {
    super(source);
  }

  #getCachedResult(cached: ObjectTrapsCached) {
    if (!cached.memo && getListener()) {
      cached.memo = true;
      cached.get = runWithOwner(this.owner, () => createMemo(cached.get))!;
    }
    return cached.get();
  }

  #cacheProperty(property: PropertyKey) {
    let valueAccessor = this.getValue.bind(this, property),
      memo = false,
      prevWrapped: any,
      prevId: any;

    const value = () => {
      if (!memo && getListener()) {
        valueAccessor = runWithOwner(this.owner, () => createMemo(valueAccessor))!;
        memo = true;
      }
      return valueAccessor();
    };

    const cached = {
      get: () => {
        const v = value();

        if (v && typeof v === "object") {
          if (v.id !== prevId || !prevWrapped) {
            prevId = v.id;
            prevWrapped = wrap(v, value);
          }
          return prevWrapped;
        }

        prevId = undefined;
        prevWrapped = undefined;
        return v;
      },
      memo: false,
    };
    this.#cache.set(property, cached);

    return this.#getCachedResult(cached);
  }

  get(target: ImmutableObject, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.source);
    if (property === $PROXY || property === $TRACK) return receiver;
    if (property === Symbol.iterator) return undefined;
    if (property === "id") return untrack(this.source).id;

    const cached = this.#cache.get(property);
    return cached ? this.#getCachedResult(cached) : this.#cacheProperty(property);
  }
}

type ArrayTrapsCached = { get: () => ImmutableValue; dispose: VoidFunction | undefined };
class ArrayTraps extends CommonTraps<ImmutableArray> implements ProxyHandler<ImmutableArray> {
  #trackLength!: Accessor<number>;

  #trackItems!: Accessor<ArrayTrapsCached[]>;

  #cacheProperty(item: Accessor<ImmutableValue>) {
    let id: ImmutableValue;
    let prev: ImmutableValue;
    let prevResult: ImmutableValue;

    const cached: ArrayTrapsCached = {
      get() {
        const v = item() as any;

        if (v === prev) return prevResult;
        prev = v;

        if (v && typeof v === "object") {
          if (v.id === id && prevResult) return prevResult;

          id = v.id;
          return (prevResult = wrap(v, item));
        }

        id = undefined;
        return (prevResult = v);
      },
      dispose: undefined,
    };
    onCleanup(() => cached.dispose?.());
    return cached;
  }

  constructor(source: Accessor<ImmutableArray>) {
    super(source);

    runWithOwner(this.owner, () => {
      this.#trackItems = createMemo(
        keyArray(
          this.source,
          (item, index) => (item && typeof item === "object" && "id" in item ? item.id : index),
          this.#cacheProperty.bind(this),
        ),
        [],
        arrayEqualsOptions,
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

    if (property === Symbol.iterator) {
      this.#trackItems();
      return untrack(this.source)[property as any];
    }

    if (property === "length") return this.#trackLength();

    if (typeof property === "symbol") return this.getValue(property);

    if (property in Array.prototype) {
      return Array.prototype[property as any].bind(receiver);
    }

    if (typeof property === "string") {
      const num = Number(property);
      if (num === num) property = num;
      else return this.getValue(property);
    }

    if (property >= untrack(this.#trackLength)) return this.#trackLength(), this.getValue(property);

    const cached = untrack(this.#trackItems)[property];
    return cached ? this.#getCachedValue(cached) : undefined;
  }
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
