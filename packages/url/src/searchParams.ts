import { createSharedRoot } from "@solid-primitives/rootless";
import { accessWith, createTriggerCache } from "@solid-primitives/utils";
import { createComputed, on, untrack } from "solid-js";
import { createStore, DeepMutable, Store } from "solid-js/store";
import { entries, SetterValue, WHOLE } from "./common";
import { UpdateLocationMethod, _useLocationState } from "./location";

export type SearchParamsRecord = Store<Record<string, string | string[]>>;
export type SearchParamsSetter = {
  (record: SetterValue<SearchParamsRecord>): void;
  (name: string, value?: SetterValue<string | string[]>): void;
};

export type ReactiveSearchParamsInit =
  | string
  | [string, string][]
  | Record<string, string>
  | URLSearchParams
  | ReactiveSearchParams;

/**
 * Relper for turning an `URLSearchParams` instance to a `SearchParamsRecord`.
 * @example
 * const searchParams = new URLSearchParams("?foo=bar");
 * const record = getSearchParamsRecord(searchParams);
 * record // => { foo: "bar" }
 */
export function getSearchParamsRecord(searchParams: URLSearchParams | string): SearchParamsRecord {
  const instance =
    searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams);
  const obj: DeepMutable<SearchParamsRecord> = {};
  instance.forEach((value, name) => {
    const p = obj[name];
    if (!p) obj[name] = value;
    else if (typeof p === "string") obj[name] = [p, value];
    else p.push(value);
  });
  return obj;
}

/** @internal */
function applySearchParamEntry(
  searchParams: URLSearchParams,
  name: string,
  value: string | readonly string[] | undefined
): void {
  if (typeof value === "string") searchParams.set(name, value);
  else if (!value) searchParams.delete(name);
  else {
    searchParams.set(name, value[0]);
    for (let i = 1; i < value.length; i++) searchParams.append(name, value[i]);
  }
}

/**
 * Provides a reactive record of `URLSearchParams` connected to the `window.location`. The record is granular, and updates whenever the search params in the Browser's URL change.
 *
 * Additionally provides different setters to update the location's search params.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#createLocationSearchParams
 * @param options primitive options:
 * - `useSharedState` - use shared-root version of reactive location state.
 * @returns
 * ```ts
 * [ SearchParamsRecord, { push, replace, navigate } ]
 * ```
 * @example
 * const [params, { push }] = createLocationSearchParams();
 * params.foo // T: string | strgin[] | undefined
 * push(p => ({
 *    ...p,
 *    foo: p.foo + "bar",
 *    page: 123
 * }));
 */
export function createLocationSearchParams(options?: { useSharedState?: boolean }): [
  access: Store<SearchParamsRecord>,
  write: {
    push: SearchParamsSetter;
    replace: SearchParamsSetter;
    navigate: SearchParamsSetter;
  }
] {
  const [_location, locationSetter] = _useLocationState(!!options?.useSharedState);
  const [state, setState] = createStore(getSearchParamsRecord(_location.search));

  createComputed(
    on(
      () => _location.search,
      search => setState(getSearchParamsRecord(search)),
      { defer: true }
    )
  );

  const setter = (
    method: UpdateLocationMethod,
    a: SetterValue<SearchParamsRecord> | string,
    b?: SetterValue<string | string[]>
  ) =>
    untrack(() => {
      let searchParams: URLSearchParams;
      if (typeof a === "string") {
        searchParams = new URLSearchParams(_location.search);
        // update only the value of passed param
        const value = accessWith(b, [state[a]]);
        applySearchParamEntry(searchParams, a, value);
      } else {
        // clear search params, and apply passed record as new params
        searchParams = new URLSearchParams("");
        const record = accessWith(a, [state]);
        entries(record).forEach(([name, value]) =>
          applySearchParamEntry(searchParams, name, value)
        );
      }
      locationSetter[method]("search", searchParams + "");
    });

  return [
    state,
    {
      push: setter.bind(void 0, "push"),
      replace: setter.bind(void 0, "replace"),
      navigate: setter.bind(void 0, "navigate")
    }
  ];
}

/**
 * Uses a shared-root reactive record of `URLSearchParams` connected to the `window.location`. The record is granular, and updates whenever the search params in the Browser's URL change.
 *
 * Additionally provides different setters to update the location's search params.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#createLocationSearchParams
 * @returns
 * ```ts
 * [ SearchParamsRecord, { push, replace, navigate } ]
 * ```
 * @example
 * const [params, { push }] = useSharedLocationSearchParams();
 * params.foo // T: string | strgin[] | undefined
 * push(p => ({
 *    ...p,
 *    foo: p.foo + "bar",
 *    page: 123
 * }));
 */
export const useSharedLocationSearchParams = /*#__PURE__*/ createSharedRoot(
  createLocationSearchParams.bind(void 0, { useSharedState: true })
);

/**
 * Creates an instance of the `ReactiveSearchParams` class.
 *
 * A Reactive version of `URLSearchParmas` class. All the method reads are granular – cause reactive updates only when the value changes.
 *
 * As this is a reactive structure, it should be instanciated under a reactive root.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#ReactiveSearchParams
 */
export function createSearchParams(init: ReactiveSearchParamsInit): ReactiveSearchParams {
  return new ReactiveSearchParams(init);
}

/**
 * A Reactive version of `URLSearchParmas` class. All the method reads are granular – cause reactive updates only when the value changes.
 *
 * As this is a reactive structure, it should be instanciated under a reactive root.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#ReactiveSearchParams
 */
export class ReactiveSearchParams extends URLSearchParams {
  private cache = createTriggerCache<string | typeof WHOLE>();

  constructor(init: ReactiveSearchParamsInit) {
    super(init instanceof ReactiveSearchParams ? init.toString() : init);
  }

  // writes
  append(name: string, value: string): void {
    super.append(name, value);
    this.cache.dirty(name);
    this.cache.dirty(WHOLE);
  }
  delete(name: string): void {
    if (super.has(name)) {
      super.delete(name);
      this.cache.dirty(name);
      this.cache.dirty(WHOLE);
    }
  }
  set(name: string, value: string): void {
    const prev = super.getAll(name);
    if (prev.length === 1 && prev[0] === value) return;
    super.set(name, value);
    this.cache.dirty(name);
    this.cache.dirty(WHOLE);
  }
  sort(): void {
    super.sort();
    this.cache.dirty(WHOLE);
  }

  // reads
  get(name: string): string | null {
    this.cache.track(name);
    return super.get(name);
  }
  getAll(name: string): string[] {
    this.cache.track(name);
    return super.getAll(name);
  }
  has(name: string): boolean {
    this.cache.track(name);
    return super.has(name);
  }
  toString(): string {
    this.cache.track(WHOLE);
    return super.toString();
  }
  keys(): IterableIterator<string> {
    this.cache.track(WHOLE);
    return super.keys();
  }
  entries(): IterableIterator<[string, string]> {
    this.cache.track(WHOLE);
    return super.entries();
  }
  values(): IterableIterator<string> {
    this.cache.track(WHOLE);
    return super.values();
  }
  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }
  forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void): void {
    this.cache.track(WHOLE);
    super.forEach(callbackfn);
  }
}
