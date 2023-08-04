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

const isObject = (v: unknown): v is Record<PropertyKey, any> => !!v && typeof v === "object";

abstract class CommonTraps<T extends ImmutableObject | ImmutableArray> implements ProxyHandler<T> {
  o = getOwner()!;

  constructor(
    public s: Accessor<T>,
    public c: Config,
  ) {}

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
  abstract get(target: T, property: PropertyKey, receiver: unknown): unknown;
  getOwnPropertyDescriptor(target: T, property: PropertyKey): PropertyDescriptor | undefined {
    return this.has(target, property)
      ? {
          enumerable: true,
          get: () => this.get(target, property, this),
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

    let valueAccessor = () => {
        const source = this.s() as unknown;
        return source ? source[property as never] : undefined;
      },
      memo = false;

    this.#cache.set(
      property,
      (cached = new PropertyWrapper(
        () => {
          const v = valueAccessor();
          // memoize property access if it is an object limit traversal to one level
          if (!memo && isObject(v)) {
            runWithOwner(this.o, () => (valueAccessor = createMemo(valueAccessor)));
            memo = true;
            return valueAccessor();
          }
          return v;
        },
        this.o,
        this.c,
      )),
    );
    return cached.get();
  }
}

const getArrayItemKey = (item: unknown, index: number, { key, merge }: Config) =>
  isObject(item) && key in item ? item[key as never] : merge ? index : item;

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

    if (typeof property === "symbol") return this.s()[property as any];

    if (property in Array.prototype) return Array.prototype[property as any].bind(receiver);

    if (typeof property === "string") {
      const num = Number(property);
      if (isNaN(num)) return this.s()[property as any];
      property = num;
    }

    if (property >= untrack(this.#trackLength))
      return this.#trackLength(), this.s()[property as any];

    return untrack(this.#trackItems)[property]?.get();
  }
}

class PropertyWrapper {
  constructor(
    private s: Accessor<ImmutableValue>,
    private o: Owner,
    private c: Config,
  ) {
    runWithOwner(o, () => onCleanup(() => this.#dispose()));
  }

  #lastId: ImmutableValue;
  #prev: ImmutableValue;
  #dispose: VoidFunction = noop;
  #memo: Accessor<ImmutableValue> | undefined;
  #calc(): ImmutableValue {
    const v = this.s() as any;

    if (!isObject(v)) {
      this.#lastId = undefined;
      this.#dispose();
      return (this.#prev = v);
    }

    const id = v[this.c.key];
    if (id === this.#lastId && isObject(this.#prev)) return this.#prev;

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

const wrap = (
  initialValue: ImmutableObject | ImmutableArray,
  source: Accessor<ImmutableValue>,
  config: Config,
): ImmutableObject | ImmutableArray =>
  new Proxy(
    initialValue.constructor(),
    new (Array.isArray(initialValue) ? ArrayTraps : ObjectTraps)(source as any, config),
  );

/**
 * Creates a deeply nested reactive object derived from the given immutable source. The source can be any signal that is updated in an immutable fashion.
 * @param source reactive function returning an immutable object
 * @param options optional configuration
 * - `key` property name to use as unique identifier for objects when their reference changes
 * - `merge` controls how objects witohut a unique identifier are identified when reconciling an array. If `true` the index is used, otherwise the object reference itself is used.
 * @returns a reactive object derived from the given source
 * @example
 * ```ts
 * const [data, setData] = createSignal({ a: 1, b: 2 });
 * const state = createImmutable(data);
 * const a = () => state().a;
 * const b = () => state().b;
 * createEffect(() => console.log(a(), b()));
 * // logs 1 2
 * setData({ a: 2, b: 3 });
 * // logs 2 3
 * ```
 */
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
  ) as T;
}
