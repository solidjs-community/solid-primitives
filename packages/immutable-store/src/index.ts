import {
  createRoot,
  createMemo,
  untrack,
  getOwner,
  runWithOwner,
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

export type ImmutablePrimitive = string | number | boolean | null | undefined;
export type ImmutableObject = { [key: string]: ImmutableValue; id?: ImmutablePrimitive };
export type ImmutableArray = ImmutableValue[];
export type ImmutableValue = ImmutablePrimitive | ImmutableObject | ImmutableArray;

const arrayEqualsOptions = { equals: arrayEquals };

class CommonTraps<T extends ImmutableObject | ImmutableArray> implements ProxyHandler<T> {
  owner: Owner;

  constructor(public source: Accessor<T>) {
    this.owner = getOwner()!;
  }

  getValue(property: PropertyKey) {
    const s = this.source() as any;
    return s && typeof s === "object" && property in s ? s[property] : undefined;
  }

  has(target: T, property: PropertyKey) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
      return true;
    this.ownKeys();
    return property in untrack(this.source);
  }

  #trackKeys?: Accessor<Array<string | symbol>>;
  ownKeys(): (string | symbol)[] {
    if (!this.#trackKeys && getListener())
      runWithOwner(
        this.owner,
        () =>
          (this.#trackKeys = createMemo(
            () => Reflect.ownKeys(this.source()),
            [],
            arrayEqualsOptions,
          )),
      );

    return this.#trackKeys ? this.#trackKeys() : Reflect.ownKeys(this.source());
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

class ObjectTraps extends CommonTraps<ImmutableObject> implements ProxyHandler<ImmutableObject> {
  #cache = new Map<PropertyKey, Accessor<ImmutableValue>>();

  constructor(source: Accessor<ImmutableObject>) {
    super(source);
  }

  get(target: ImmutableObject, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.source);
    if (property === $PROXY || property === $TRACK) return receiver;
    if (property === Symbol.iterator) return undefined;
    if (property === "id") return untrack(this.source).id;

    let cached = this.#cache.get(property);
    if (cached) return cached();

    let valueAccessor = () => this.getValue(property),
      memo = false;

    const value = () => {
      if (!memo && getListener()) {
        valueAccessor = runWithOwner(this.owner, () => createMemo(valueAccessor))!;
        memo = true;
      }
      return valueAccessor();
    };

    this.#cache.set(property, (cached = createWrapper(value, this.owner)));
    return cached();
  }
}

class ArrayTraps extends CommonTraps<ImmutableArray> implements ProxyHandler<ImmutableArray> {
  #trackLength!: Accessor<number>;

  #trackItems!: Accessor<Accessor<ImmutableValue>[]>;

  constructor(source: Accessor<ImmutableArray>) {
    super(source);

    this.#trackItems = createMemo(
      keyArray(
        this.source,
        (item, index) => (item && typeof item === "object" && "id" in item ? item.id : index),
        item => createWrapper(item, getOwner()!),
      ),
      [],
      arrayEqualsOptions,
    );

    this.#trackLength = createMemo(() => this.#trackItems().length, 0);
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

    return untrack(this.#trackItems)[property]?.();
  }
}

function createWrapper(source: Accessor<ImmutableValue>, owner: Owner): Accessor<ImmutableValue> {
  let id: ImmutableValue,
    prev: ImmutableValue,
    prevResult: ImmutableValue,
    dispose: VoidFunction | undefined,
    memo = false,
    get = () => {
      const v = source() as any;

      if (v === prev) return prevResult;
      prev = v;

      if (!v || typeof v !== "object") {
        id = undefined;
        dispose?.();
        return (prevResult = v);
      }

      if (v.id === id && prevResult) return prevResult;

      id = v.id;
      dispose?.();
      return createRoot(_dispose => ((dispose = _dispose), (prevResult = wrap(v, source))), owner);
    };

  runWithOwner(owner, () => onCleanup(() => dispose?.()));

  return () => {
    if (!memo && getListener()) {
      memo = true;
      get = runWithOwner(owner, () => createMemo(get))!;
    }
    return get();
  };
}

function wrap<T extends ImmutableObject | ImmutableArray>(initialValue: T, source: Accessor<T>): T {
  return new Proxy(
    initialValue.constructor(),
    new (Array.isArray(initialValue) ? ArrayTraps : ObjectTraps)(source as any),
  );
}

export function createImmutable<T extends ImmutableObject | ImmutableArray>(
  source: Accessor<T>,
): T {
  const memo = createMemo(source);
  return untrack(() => wrap(memo(), memo));
}
