import { createComputed, getOwner, on, runWithOwner, untrack, batch } from "solid-js";
import { createStore, Store, DeepReadonly } from "solid-js/store";
import { createEventListener } from "@solid-primitives/event-listener";
import { createSimpleEmitter } from "@solid-primitives/event-bus";
import {
  accessWith,
  createTriggerCache,
  createStaticStore,
  entries,
  biSyncSignals,
  Get,
  Fn,
  AnyObject
} from "@solid-primitives/utils";
import { pick } from "@solid-primitives/immutable";
import { createSharedRoot } from "@solid-primitives/rootless";

export type LocationState = {
  readonly origin: string;
  readonly hash: string;
  readonly host: string;
  readonly hostname: string;
  readonly href: string;
  readonly pathname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  readonly ancestorOrigins: DOMStringList;
};

export type URLFields = {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  username: string;
};
export type URLRecord = Readonly<URLFields>;
type WritableURLFields = Exclude<keyof URLFields, "origin">;

type SetterValue<Prev, Next = Prev> = Next | ((prev: DeepReadonly<Prev>) => Next);
export type URLSetter = {
  (record: SetterValue<URLRecord, URLSetterRecord>): URLRecord;
  (key: WritableURLFields, value: SetterValue<string>): URLRecord;
};
export type URLSetterRecord = Partial<Record<WritableURLFields, string>>;

type SearchParamRecord = Record<string, string | string[]>;
type SearchParamsSetter = {
  (record: SetterValue<SearchParamRecord>): Store<SearchParamRecord>;
  (name: string, value: SetterValue<string | string[]>): Store<SearchParamRecord>;
};

export type UpdateLocationMethod = "push" | "replace" | "navigate";

export type ReactiveSearchParamsInit =
  | string
  | [string, string][]
  | Record<string, string>
  | URLSearchParams
  | ReactiveSearchParams;

const WHOLE = Symbol("watch_whole");

const URL_KEYS = [
  "hash",
  "host",
  "hostname",
  "href",
  "origin",
  "password",
  "pathname",
  "port",
  "protocol",
  "search",
  "username"
] as (keyof URLFields)[];

let monkeyPatchedStateEvents = false;
const [listenStateEvents, triggerStateEvents] = createSimpleEmitter();

function patchStateEvents() {
  if (monkeyPatchedStateEvents) return;
  const replaceState = history.replaceState.bind(history);
  const pushState = history.pushState.bind(history);
  history.replaceState = (...args) => {
    replaceState(...args);
    triggerStateEvents();
  };
  history.pushState = (...args) => {
    pushState(...args);
    triggerStateEvents();
  };
  monkeyPatchedStateEvents = true;
}

function getSearchParamRecord(searchParams: URLSearchParams): SearchParamRecord {
  const obj: SearchParamRecord = {};
  searchParams.forEach((value, name) => {
    const p = obj[name];
    if (!p) obj[name] = value;
    else if (typeof p === "string") obj[name] = [p, value];
    else p.push(value);
  });
  return obj;
}

function applySearchParamEntry(
  searchParams: URLSearchParams,
  name: string,
  value?: string | string[]
): void {
  if (!value) return;
  if (Array.isArray(value)) {
    searchParams.set(name, value[0]);
    for (let i = 1; i < value.length; i++) searchParams.append(name, value[i]);
  } else searchParams.set(name, value);
}

function getSearchParamEntry(searchParams: URLSearchParams, name: string): string | string[] {
  const value = searchParams.getAll(name);
  return value.length > 1 ? value : value[0];
}

function updateLocation(href: string, method: UpdateLocationMethod): void {
  if (method === "push") return history.pushState({}, "", href);
  if (method === "replace") return history.replaceState({}, "", href);
  location.href = href;
}

export function createLocationState(): LocationState {
  const [state, setState] = createStaticStore<LocationState>(
    pick(
      location,
      "origin",
      "hash",
      "host",
      "hostname",
      "href",
      "pathname",
      "port",
      "protocol",
      "search",
      "ancestorOrigins"
    )
  );
  const updateState = () => setState(location);
  createEventListener(window, ["popstate", "hashchange"], updateState, false);
  patchStateEvents();
  listenStateEvents(updateState);
  return state;
}

export const useSharedLocationState = createSharedRoot(createLocationState);

export function createURLRecord(
  url: string,
  base?: string
): [accessor: URLRecord, setter: URLSetter] {
  let instance = new URL(url, base);
  const [state, setState] = createStaticStore<URLRecord>(
    (() => {
      const copy = {} as any;
      URL_KEYS.forEach(key => (copy[key] = instance[key]));
      return copy;
    })()
  );

  const setter = (
    a: WritableURLFields | SetterValue<URLRecord, URLSetterRecord>,
    b?: SetterValue<string>
  ) => {
    if (typeof a === "string") instance[a] = accessWith(b, [instance[a]])!;
    else {
      let record = accessWith(a, [state]);
      if (record instanceof URL) instance = new URL(record);
      else {
        // @ts-expect-error origin filed is omitted from the types, but could still be passed to the setter
        delete record.origin;
        if (Object.keys(record).length === 0) return state;
        for (const [key, value] of entries(record)) instance[key] = value as string;
      }
    }
    batch(() => URL_KEYS.forEach(key => setState(key, instance[key])));
    return state;
  };

  return [state, ((a, b) => untrack(setter.bind(void 0, a, b))) as URLSetter];
}

export function createLocationURLRecord(options?: {
  useSharedState?: boolean;
}): [accessor: URLRecord, setters: { push: URLSetter; replace: URLSetter; navigate: URLSetter }] {
  const state = options?.useSharedState ? useSharedLocationState() : createLocationState();
  const [url, setURL] = createURLRecord(state.href);
  let updateMethod: UpdateLocationMethod;

  biSyncSignals(
    {
      get: () => state.href,
      set: () => updateLocation(url.href, updateMethod)
    },
    {
      get: () => url.href,
      set: href => setURL("href", href)
    }
  );

  return [
    url,
    {
      push: (a: any, b?: any) => {
        updateMethod = "push";
        return setURL(a[0], a[1]);
      },
      replace: (a: any, b?: any) => {
        updateMethod = "replace";
        return setURL(a[0], a[1]);
      },
      navigate: (a: any, b?: any) => {
        updateMethod = "navigate";
        return setURL(a[0], a[1]);
      }
    }
  ];
}

export const useSharedLocationURLRecord = createSharedRoot(
  createLocationURLRecord.bind(void 0, { useSharedState: true })
);

export function createLocationURL(
  options: {
    useSharedState?: boolean;
    updateMethod?: UpdateLocationMethod;
  } = {}
): ReactiveURL {
  const { useSharedState = false, updateMethod = "replace" } = options;
  const state = useSharedState ? useSharedLocationState() : createLocationState();
  const url = new ReactiveURL(state.href);
  biSyncSignals(
    {
      get: () => state.href,
      set: () => updateLocation(url.href, updateMethod)
    },
    {
      get: () => url.href,
      set: href => (url.href = href)
    }
  );
  return url;
}

export const useSharedLocationURL = createSharedRoot(
  createLocationURL.bind(void 0, { useSharedState: true })
);

export function createLocationSearchParamRecord(options?: { useSharedState?: boolean }): [
  access: Store<SearchParamRecord>,
  write: {
    push: SearchParamsSetter;
    replace: SearchParamsSetter;
    navigate: SearchParamsSetter;
  }
] {
  const state = options?.useSharedState ? useSharedLocationState() : createLocationState();
  const url = new URL(state.href);
  const [store, setStore] = createStore(getSearchParamRecord(url.searchParams));
  let changedLocation = true;

  createComputed(
    on(
      () => state.href,
      href => {
        if (changedLocation) return;
        // update local instance when url changes
        url.href = href;
        setStore(getSearchParamRecord(url.searchParams));
      }
    )
  );

  const setter = (updateMethod: UpdateLocationMethod, a: any, b?: any) =>
    untrack(() => {
      if (typeof a === "string") {
        // update only the value of passed param
        const value = accessWith(b, () => [getSearchParamEntry(url.searchParams, a)]);
        applySearchParamEntry(url.searchParams, a, value);
      } else {
        // clear search params, and apply passed record as new params
        url.search = "";
        const record = accessWith(a, [store]);
        Object.entries(record).forEach(([name, value]) => {
          applySearchParamEntry(url.searchParams, name, value as string | string[]);
        });
      }
      changedLocation = true;
      updateLocation(url.href, updateMethod);
      changedLocation = false;
      const record: AnyObject = {};
      Object.keys(store).forEach(key => (record[key] = undefined));
      setStore({
        ...record,
        ...getSearchParamRecord(url.searchParams)
      });
      return store;
    });

  return [
    store,
    {
      push: setter.bind(void 0, "push"),
      replace: setter.bind(void 0, "replace"),
      navigate: setter.bind(void 0, "navigate")
    }
  ];
}

export const useSharedLocationSearchParamRecord = createSharedRoot(
  createLocationSearchParamRecord.bind(void 0, { useSharedState: true })
);

export class ReactiveURL implements URL {
  private fields: URLRecord;
  private set: URLSetter;
  private rsp?: ReactiveSearchParams;
  private owner = getOwner()!;

  constructor(url: string, base?: string) {
    const [fields, setURL] = createURLRecord(url, base);
    this.fields = fields;
    this.set = setURL;
  }

  get hash() {
    return this.fields.hash;
  }
  set hash(hash) {
    this.set("hash", hash);
  }

  get host() {
    return this.fields.host;
  }
  set host(host) {
    this.set("host", host);
  }

  get hostname() {
    return this.fields.hostname;
  }
  set hostname(hostname) {
    this.set("hostname", hostname);
  }

  get href() {
    return this.fields.href;
  }
  set href(href) {
    this.set("href", href);
  }

  get origin() {
    return this.fields.origin;
  }

  get password() {
    return this.fields.password;
  }
  set password(password) {
    this.set("password", password);
  }

  get pathname() {
    return this.fields.pathname;
  }
  set pathname(pathname) {
    this.set("pathname", pathname);
  }

  get port() {
    return this.fields.port;
  }
  set port(port) {
    this.set("port", port);
  }

  get protocol() {
    return this.fields.protocol;
  }
  set protocol(protocol) {
    this.set("protocol", protocol);
  }

  get search() {
    return this.fields.search;
  }
  set search(search) {
    const new_url = new URL(location.href);
    new_url.search = search;
    this.set(new_url);
  }

  get username() {
    return this.fields.username;
  }
  set username(username) {
    this.set("username", username);
  }

  toString(): string {
    return this.href;
  }
  toJSON(): string {
    return this.href;
  }

  get searchParams(): ReactiveSearchParams {
    if (!this.rsp)
      runWithOwner(this.owner, () => {
        this.rsp = new ReactiveSearchParams(this.search);
        createComputed(
          on(
            () => this.rsp + "",
            search => (this.search = search),
            { defer: true }
          )
        );
      });
    return this.rsp!;
  }
}

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
}
