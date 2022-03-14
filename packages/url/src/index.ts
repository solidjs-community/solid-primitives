import { createComputed, getOwner, on, runWithOwner, untrack, batch } from "solid-js";
import { createEventListener } from "@solid-primitives/event-listener";
import { createSimpleEmitter } from "@solid-primitives/event-bus";
import {
  accessWith,
  createTriggerCache,
  createStaticStore,
  entries,
  biSyncSignals
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

type SetterValue<Prev, Next = Prev> = Next | ((prev: Prev) => Next);
export type URLSetter = {
  (record: SetterValue<URLRecord, URLSetterRecord>): URLRecord;
  (key: WritableURLFields, value: SetterValue<string>): URLRecord;
};
export type URLSetterRecord = Partial<Record<WritableURLFields, string>>;

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

let globalReactiveURL: ReactiveURL | undefined;
let globalReactiveSearchParams: ReactiveSearchParams | undefined;

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
  useSharedState: boolean;
}): [accessor: URLRecord, setter: URLSetter] {
  const state = options?.useSharedState ? useSharedLocationState() : createLocationState();
  const [url, setURL] = createURLRecord(state.href);
  biSyncSignals(
    {
      get: () => state.href,
      set: () => history.replaceState({}, "", url.href)
    },
    {
      get: () => url.href,
      set: href => setURL("href", href)
    }
  );
  return [url, setURL];
}

export const useSharedLocationURLRecord = createSharedRoot(
  createLocationURLRecord.bind(void 0, { useSharedState: true })
);

export function createLocationURL(): ReactiveURL {
  const state = createLocationState();
  const url = new ReactiveURL(state.href);
  biSyncSignals(
    {
      get: () => state.href,
      set: () => history.replaceState({}, "", url)
    },
    {
      get: () => url.href,
      set: href => (url.href = href)
    }
  );
  return url;
}

export function useLocationURL(): ReactiveURL {
  if (!globalReactiveURL) globalReactiveURL = createLocationURL();
  return globalReactiveURL;
}

export function createSearchParams(init: ReactiveSearchParamsInit) {
  return new ReactiveSearchParams(init);
}

export function createLocationSearchParams(): ReactiveSearchParams {
  const state = createLocationState();
  const searchParams = new ReactiveSearchParams(state.search);
  let causedChange = true;

  // update ReactiveSearchParams instance on location change
  createComputed(
    on(
      () => state.search,
      search => {
        if (causedChange) return (causedChange = false);
        const keys = new Set(searchParams.keys());
        const newSearchParams = new URLSearchParams(search);
        batch(() => {
          newSearchParams.forEach((value, name) => {
            if (keys.has(name)) {
              keys.delete(name);
              searchParams.set(name, value);
            } else searchParams.append(name, value);
          });
          keys.forEach(key => searchParams.delete(key));
        });
      }
    )
  );

  // update location on write
  createComputed(
    on(
      () => searchParams + "",
      search => ((causedChange = true), (location.search = search)),
      { defer: true }
    )
  );

  return searchParams;
}

export function useLocationSearchParams(): ReactiveSearchParams {
  if (!globalReactiveSearchParams) globalReactiveSearchParams = createLocationSearchParams();
  return globalReactiveSearchParams;
}

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
