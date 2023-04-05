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
import { $RAW, ReconcileOptions } from "solid-js/store";
import { trueFn, arrayEquals, noop } from "@solid-primitives/utils";
import { keyArray } from "@solid-primitives/keyed";

export type ImmutablePrimitive = string | number | boolean | null | undefined;
export type ImmutableObject = { [key: string]: ImmutableValue };
export type ImmutableArray = ImmutableValue[];
export type ImmutableValue = ImmutablePrimitive | ImmutableObject | ImmutableArray;

type Config = {
  key: string | typeof $NO_KEY;
  merge: boolean | undefined;
};

const $NO_KEY = Symbol("no-key");
const ARRAY_EQUALS_OPTIONS = { equals: arrayEquals };

class CommonTraps<T extends ImmutableObject | ImmutableArray> implements ProxyHandler<T> {
  o = getOwner()!;

  constructor(public s: Accessor<T>, public c: Config) {}

  getProp(property: PropertyKey) {
    const s = this.s() as any;
    return s && typeof s === "object" && property in s ? s[property] : undefined;
  }

  has(target: T, property: PropertyKey) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
      return true;
    this.ownKeys();
    return property in untrack(this.s);
  }

  #trackKeys?: Accessor<Array<string | symbol>>;
  ownKeys(): (string | symbol)[] {
    if (!this.#trackKeys && getListener())
      runWithOwner(
        this.o,
        () =>
          (this.#trackKeys = createMemo(() => Reflect.ownKeys(this.s()), [], ARRAY_EQUALS_OPTIONS)),
      );

    return this.#trackKeys ? this.#trackKeys() : Reflect.ownKeys(this.s());
  }
  getOwnPropertyDescriptor(target: T, property: PropertyKey): PropertyDescriptor | undefined {
    this.ownKeys();
    return property in untrack(this.s)
      ? {
          enumerable: true,
          get: () => this.getProp(property),
          configurable: true,
        }
      : undefined;
  }
  set = trueFn;
  deleteProperty = trueFn;
}

class ObjectTraps extends CommonTraps<ImmutableObject> implements ProxyHandler<ImmutableObject> {
  #cache = new Map<PropertyKey, PropertyWrapper>();

  constructor(source: Accessor<ImmutableObject>, config: Config) {
    super(source, config);
  }

  get(target: ImmutableObject, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.s);
    if (property === $PROXY || property === $TRACK) return receiver;
    if (property === Symbol.iterator) return undefined;
    if (property === this.c.key) return untrack(this.s)[this.c.key as never];

    let cached = this.#cache.get(property);
    if (cached) return cached.get();

    let valueAccessor = () => this.getProp(property),
      memo = false;

    const value = () => {
      if (!memo && getListener()) {
        runWithOwner(this.o, () => (valueAccessor = createMemo(valueAccessor)));
        memo = true;
      }
      return valueAccessor();
    };

    this.#cache.set(property, (cached = new PropertyWrapper(value, this.o, this.c)));
    return cached.get();
  }
}

const getArrayItemKey = (item: unknown, index: number, { key, merge }: Config) =>
  item && typeof item === "object" && key in item ? item[key as never] : merge ? index : item;

class ArrayTraps extends CommonTraps<ImmutableArray> implements ProxyHandler<ImmutableArray> {
  #trackLength!: Accessor<number>;

  #trackItems!: Accessor<PropertyWrapper[]>;

  constructor(source: Accessor<ImmutableArray>, config: Config) {
    super(source, config);

    this.#trackItems = createMemo(
      keyArray(
        source,
        (item, index) => getArrayItemKey(item, index, config),
        item => new PropertyWrapper(item, getOwner()!, config),
      ),
      [],
      ARRAY_EQUALS_OPTIONS,
    );

    this.#trackLength = createMemo(() => this.#trackItems().length, 0);
  }

  get(target: ImmutableArray, property: PropertyKey, receiver: unknown) {
    if (property === $RAW) return untrack(this.s);
    if (property === $PROXY) return receiver;
    if (property === $TRACK) return this.#trackItems(), receiver;

    if (property === Symbol.iterator) return this.#trackItems(), untrack(this.s)[property as any];
    if (property === "length") return this.#trackLength();

    if (typeof property === "symbol") return this.getProp(property);

    if (property in Array.prototype) return Array.prototype[property as any].bind(receiver);

    if (typeof property === "string") {
      const num = Number(property);
      if (isNaN(num)) return this.getProp(property);
      property = num;
    }

    if (property >= untrack(this.#trackLength)) return this.#trackLength(), this.getProp(property);

    return untrack(this.#trackItems)[property]?.get();
  }
}

class PropertyWrapper {
  constructor(private s: Accessor<ImmutableValue>, private o: Owner, private c: Config) {
    runWithOwner(o, () => onCleanup(() => this.#dispose()));
  }

  #lastId: ImmutableValue;
  #prev: ImmutableValue;
  #dispose: VoidFunction = noop;
  #memo: Accessor<ImmutableValue> | undefined;
  #calc(): ImmutableValue {
    const v = this.s() as any;

    if (!v || typeof v !== "object") {
      this.#lastId = undefined;
      this.#dispose();
      return (this.#prev = v);
    }

    const id = v[this.c.key];
    if (id === this.#lastId && this.#prev && typeof this.#prev === "object") return this.#prev;

    this.#lastId = id;
    this.#dispose();
    return createRoot(
      _dispose => ((this.#dispose = _dispose), (this.#prev = wrap(v, this.s, this.c))),
      this.o,
    );
  }

  get(): ImmutableValue {
    if (!this.#memo && getListener())
      runWithOwner(this.o, () => (this.#memo = createMemo(() => this.#calc())));
    return this.#memo ? this.#memo() : this.#calc();
  }
}

function wrap<T extends ImmutableObject | ImmutableArray>(
  initialValue: T,
  source: Accessor<T>,
  config: Config,
): T {
  return new Proxy(
    initialValue.constructor(),
    new (Array.isArray(initialValue) ? ArrayTraps : ObjectTraps)(source as any, config),
  );
}

export function createImmutable<T extends ImmutableObject | ImmutableArray>(
  source: Accessor<T>,
  options: ReconcileOptions = {},
): T {
  const memo = createMemo(source);
  return untrack(() =>
    wrap(memo(), memo, {
      key: options.key === null ? $NO_KEY : options.key ?? "id",
      merge: options.merge,
    }),
  );
}
