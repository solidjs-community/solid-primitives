import { Destructure, destructure } from "@solid-primitives/destructure";
import { createEventListener } from "@solid-primitives/event-listener";
import { accessWith, createTriggerCache } from "@solid-primitives/utils";
import {
  Accessor,
  createComputed,
  createMemo,
  createSignal,
  getOwner,
  on,
  runWithOwner,
  untrack,
  batch
} from "solid-js";

export type LocationState = Readonly<Omit<Location, "toString" | "assign" | "reload" | "replace">>;
export type HistoryState = Readonly<{
  length: number;
  scrollRestoration: ScrollRestoration;
  state: any;
}>;

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

export type URLSetter = (
  record: URLSetterRecord | ((prev: URLRecord) => URLSetterRecord)
) => URLRecord;
export type URLSetterRecord = Partial<Omit<URLRecord, "origin">>;

export type ReactiveSearchParamsInit =
  | string
  | [string, string][]
  | Record<string, string>
  | URLSearchParams
  | ReactiveSearchParams;

const WHOLE = Symbol("watch_whole");

let globalLocationState: Accessor<LocationState> | undefined;
let globalHistoryState: Accessor<HistoryState> | undefined;
let globalReactiveURL: ReactiveURL | undefined;
let globalReactiveSearchParams: ReactiveSearchParams | undefined;

export function createLocationState(): Accessor<LocationState> {
  const [state, setState] = createSignal<LocationState>(
    { ...location },
    {
      equals: (a, b) => a.href === b.href
    }
  );
  const updateState = () => setState({ ...location });
  createEventListener(window, ["popstate", "hashchange"], updateState, false);
  return state;
}

export function useLocationState(): Accessor<LocationState> {
  if (!globalLocationState) globalLocationState = createLocationState();
  return globalLocationState;
}

export function createHistoryState(): Accessor<HistoryState> {
  const [state, setState] = createSignal<HistoryState>({ ...history });
  const updateState = () => setState({ ...history });
  createEventListener(window, "popstate", updateState, false);
  return state;
}

export function useHistoryState(): Accessor<HistoryState> {
  if (!globalHistoryState) globalHistoryState = createHistoryState();
  return globalHistoryState;
}

export function createURLSignal(
  url: string,
  base?: string
): [accessor: Accessor<URLRecord>, setter: URLSetter] {
  const [signal, setSignal] = createSignal(new URL(url, base), {
    equals: (a, b) => a.href === b.href
  });
  const setter: URLSetter = get => {
    const record = accessWith(get, () => [signal()]);
    // @ts-expect-error origin filed is omitted from the types, but could still be passed to the setter
    delete record.origin;
    if (Object.keys(record).length === 0) return untrack(signal);
    return setSignal(p => ({ ...p, ...record }));
  };
  return [signal, setter];
}

export function createURL(url: string, base?: string) {
  return new ReactiveURL(url, base);
}

export function createLocationURL(): ReactiveURL {
  const state = useLocationState();
  const href = createMemo(() => state().href);
  const url = new ReactiveURL(href());
  let causedRead = true;
  let causedWrite = true;

  // update ReactiveURL instance on read
  createComputed(
    on(href, href => {
      console.log("href update", href, causedRead);
      if (causedRead) return (causedRead = false);
      (causedWrite = true), (url.href = href);
    })
  );

  // update location on write
  createComputed(
    on(
      () => url.href,
      href => {
        if (causedWrite) return (causedWrite = false);
        (causedRead = true), (location.href = href);
      }
    )
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
  const state = useLocationState();
  const search = createMemo(() => state().search);
  const searchParams = new ReactiveSearchParams(search());
  let causedChange = true;

  // update ReactiveSearchParams instance on location change
  createComputed(
    on(search, search => {
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
    })
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
  private fields: Destructure<URLRecord>;
  private set: URLSetter;
  private rsp?: ReactiveSearchParams;
  private owner = getOwner()!;

  constructor(url: string, base?: string) {
    const [getURL, setURL] = createURLSignal(url, base);
    this.fields = destructure(getURL, { lazy: true });
    this.set = setURL;
  }

  get hash() {
    return this.fields.hash();
  }
  set hash(hash) {
    this.set({ hash });
  }

  get host() {
    return this.fields.host();
  }
  set host(host) {
    this.set({ host });
  }

  get hostname() {
    return this.fields.hostname();
  }
  set hostname(hostname) {
    this.set({ hostname });
  }

  get href() {
    return this.fields.href();
  }
  set href(href) {
    this.set({ href });
  }

  get origin() {
    return this.fields.origin();
  }

  get password() {
    return this.fields.password();
  }
  set password(password) {
    this.set({ password });
  }

  get pathname() {
    return this.fields.pathname();
  }
  set pathname(pathname) {
    this.set({ pathname });
  }

  get port() {
    return this.fields.port();
  }
  set port(port) {
    this.set({ port });
  }

  get protocol() {
    return this.fields.protocol();
  }
  set protocol(protocol) {
    this.set({ protocol });
  }

  get search() {
    return this.fields.search();
  }
  set search(search) {
    this.set({ search });
  }

  get username() {
    return this.fields.username();
  }
  set username(username) {
    this.set({ username });
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
