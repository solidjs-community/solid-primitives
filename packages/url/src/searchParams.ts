import { createSingletonRoot } from "@solid-primitives/rootless";
import { createTriggerCache } from "@solid-primitives/trigger";
import { accessWith, entries } from "@solid-primitives/utils";
import { createStore, untrack, type Store } from "solid-js";
import type { SetterValue } from "./common.ts";
import { _useLocationState, type UpdateLocationMethod } from "./location.ts";

export type SearchParamsRecord = Store<Record<string, string | string[]>>;
export type SearchParamsSetter = {
  (record: SetterValue<SearchParamsRecord>): void;
  (name: string, value?: SetterValue<string | string[] | undefined>): void;
};

export type ReactiveSearchParamsInit =
  string | string[][] | Record<string, string> | URLSearchParams | ReactiveSearchParams;

/**
 * Turns a `URLSearchParams` instance (or a string of search params) into a plain record —
 * a single value for names that appear once, an array of values for names that repeat.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#getSearchParamsRecord
 * @example
 * ```ts
 * const record = getSearchParamsRecord("?foo=bar");
 * record; // => { foo: "bar" }
 * ```
 */
export function getSearchParamsRecord(
  searchParams: URLSearchParams | string,
): Record<string, string | string[]> {
  const instance =
    searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams);
  const record: Record<string, string | string[]> = {};
  instance.forEach((value, name) => {
    const prev = record[name];
    if (!prev) record[name] = value;
    else if (typeof prev === "string") record[name] = [prev, value];
    else prev.push(value);
  });
  return record;
}

/** @internal */
function applySearchParamEntry(
  searchParams: URLSearchParams,
  name: string,
  value: string | readonly string[] | undefined,
): void {
  if (typeof value === "string") searchParams.set(name, value);
  else if (!value || value.length === 0) searchParams.delete(name);
  else {
    searchParams.set(name, value[0]!);
    for (let i = 1; i < value.length; i++) searchParams.append(name, value[i]!);
  }
}

/**
 * Provides a reactive record of `URLSearchParams` reflecting `window.location.search`. The
 * record updates whenever the search params in the browser's URL change, and provides
 * different setter methods to update the location's search params.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#createLocationSearchParams
 * @param options `useSharedState` — use the shared-root version of the reactive location state. See {@link useSharedLocationState}.
 * @returns
 * ```ts
 * [state, { push, replace, navigate }]
 * ```
 * @example
 * ```ts
 * const [params, { push }] = createLocationSearchParams();
 * params.foo; // T: string | string[] | undefined
 * push({ ...params, page: "2" });
 * ```
 */
export function createLocationSearchParams(options?: { useSharedState?: boolean }): [
  state: SearchParamsRecord,
  setters: {
    push: SearchParamsSetter;
    replace: SearchParamsSetter;
    navigate: SearchParamsSetter;
  },
] {
  const [_location, locationSetter] = _useLocationState(!!options?.useSharedState);
  const [state] = createStore(() => getSearchParamsRecord(_location.search), {});

  const setter = (
    method: UpdateLocationMethod,
    a: SetterValue<SearchParamsRecord> | string,
    b?: SetterValue<string | string[] | undefined>,
  ) => {
    let searchParams: URLSearchParams;
    if (typeof a === "string") {
      searchParams = new URLSearchParams(_location.search);
      applySearchParamEntry(searchParams, a, accessWith(b, state[a]));
    } else {
      searchParams = new URLSearchParams();
      const record = accessWith(a, state);
      for (const [name, value] of entries(record)) applySearchParamEntry(searchParams, name, value);
    }
    locationSetter[method]("search", searchParams.toString());
  };

  return [
    state,
    {
      push: setter.bind(void 0, "push"),
      replace: setter.bind(void 0, "replace"),
      navigate: setter.bind(void 0, "navigate"),
    },
  ];
}

/**
 * Reuses a shared-root {@link createLocationSearchParams}, or creates one if one isn't active.
 *
 * Use it instead of {@link createLocationSearchParams} to avoid recreating signals, computations, and event listeners for every consumer.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#useSharedLocationSearchParams
 */
export const useSharedLocationSearchParams: ReturnType<typeof createSingletonRoot<ReturnType<typeof createLocationSearchParams>>> = /*#__PURE__*/ createSingletonRoot(() =>
  createLocationSearchParams({ useSharedState: true }),
);

/**
 * Creates an instance of the {@link ReactiveSearchParams} class — a reactive version of `URLSearchParams`.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#createSearchParams
 */
export function createSearchParams(init: ReactiveSearchParamsInit = ""): ReactiveSearchParams {
  return new ReactiveSearchParams(init);
}

/**
 * A reactive version of the `URLSearchParams` class. Every read method is granular — it causes
 * an update only when the value it read has actually changed.
 *
 * As this is a reactive structure, it should be instantiated under a reactive root.
 *
 * `ReactiveSearchParams` extends `URLSearchParams`, so `x instanceof URLSearchParams` holds.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#ReactiveSearchParams
 * @example
 * ```ts
 * const params = new ReactiveSearchParams("foo=1&foo=2&bar=baz");
 * createEffect(() => console.log(params.getAll("foo")));
 * params.append("foo", "3");
 * ```
 */
/** Tracking key standing in for "any part of the collection" — reads that iterate the whole thing (`toString`, `keys`, `entries`, `values`, `forEach`) depend on it, and every mutation dirties it. */
const WHOLE = Symbol("whole");

export class ReactiveSearchParams extends URLSearchParams {
  readonly #track: (key: string | typeof WHOLE) => void;
  readonly #dirty: (key: string | typeof WHOLE) => void;
  readonly #onChange: VoidFunction | undefined;

  /**
   * @param init same as the `URLSearchParams` constructor's argument.
   * @param onChange @internal called after every mutation — used by {@link ReactiveURL} to sync `url.search` from its `.searchParams`.
   */
  constructor(init: ReactiveSearchParamsInit, onChange?: VoidFunction) {
    super(init instanceof ReactiveSearchParams ? untrack(() => init.toString()) : init);
    // A single lazy TriggerCache — its signals are only created the first time a key is
    // actually `track`ed from within a reactive read, never eagerly at construction. Mutating
    // (or constructing) a `ReactiveSearchParams` that no one has read yet is then a plain,
    // signal-free operation — important since this class gets constructed and written to from
    // plenty of non-reactive contexts (e.g. `ReactiveURL`'s internal `.search` sync).
    const [track, dirty] = createTriggerCache<string | typeof WHOLE>();
    this.#track = track;
    this.#dirty = dirty;
    this.#onChange = onChange;
  }

  #notify(name?: string): void {
    if (name !== undefined) this.#dirty(name);
    this.#dirty(WHOLE);
    this.#onChange?.();
  }

  // writes
  override append(name: string, value: string): void {
    super.append(name, value);
    this.#notify(name);
  }
  override delete(name: string): void {
    if (!super.has(name)) return;
    super.delete(name);
    this.#notify(name);
  }
  override set(name: string, value: string): void {
    const prev = super.getAll(name);
    if (prev.length === 1 && prev[0] === value) return;
    super.set(name, value);
    this.#notify(name);
  }
  override sort(): void {
    super.sort();
    this.#notify();
  }

  // reads
  override get(name: string): string | null {
    this.#track(name);
    return super.get(name);
  }
  override getAll(name: string): string[] {
    this.#track(name);
    return super.getAll(name);
  }
  override has(name: string): boolean {
    this.#track(name);
    return super.has(name);
  }
  override toString(): string {
    this.#track(WHOLE);
    return super.toString();
  }
  override keys(): ReturnType<URLSearchParams["keys"]> {
    this.#track(WHOLE);
    return super.keys();
  }
  override entries(): ReturnType<URLSearchParams["entries"]> {
    this.#track(WHOLE);
    return super.entries();
  }
  override values(): ReturnType<URLSearchParams["values"]> {
    this.#track(WHOLE);
    return super.values();
  }
  override forEach(
    callbackfn: (value: string, key: string, parent: URLSearchParams) => void,
  ): void {
    this.#track(WHOLE);
    super.forEach(callbackfn);
  }
  override [Symbol.iterator](): ReturnType<URLSearchParams["entries"]> {
    return this.entries();
  }
}
