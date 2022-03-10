import { createEventListener } from "@solid-primitives/event-listener";
import { Destructure, destructure } from "@solid-primitives/destructure";
import {
  createProxy,
  createTrigger,
  entries,
  Fn,
  forEachEntry,
  Get,
  keys,
  Values,
  accessWith,
  createTriggerCache
} from "@solid-primitives/utils";
import {
  Accessor,
  createSignal,
  getOwner,
  runWithOwner,
  Setter,
  untrack,
  createComputed
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

let globalLocationState: Accessor<LocationState> | undefined;
let globalHistoryState: Accessor<HistoryState> | undefined;

export function createLocationState(): Accessor<LocationState> {
  const [state, setState] = createSignal<LocationState>(location);
  const updateState = () => setState(location);
  createEventListener(window, ["popstate", "hashchange"], updateState, false);
  return state;
}

export function useLocationState(): Accessor<LocationState> {
  if (!globalLocationState) globalLocationState = createLocationState();
  return globalLocationState;
}

export function createHistoryState(): Accessor<HistoryState> {
  const [state, setState] = createSignal<HistoryState>(history);
  const updateState = () => setState(history);
  createEventListener(window, "popstate", updateState, false);
  return state;
}

export function useHistoryState(): Accessor<HistoryState> {
  if (!globalHistoryState) globalHistoryState = createHistoryState();
  return globalHistoryState;
}

function createURL(url: string, base?: string): [accessor: Accessor<URLRecord>, setter: URLSetter] {
  const [signal, setSignal] = createSignal(new URL(url, base), { equals: false });
  const setter: URLSetter = get => {
    const record = accessWith(get, () => [signal()]);
    // @ts-expect-error origin filed is omitted from the types, but could still be passed to the setter
    delete record.origin;
    if (Object.keys(record).length === 0) return untrack(signal);
    return setSignal(p => Object.assign(p, record));
  };
  return [signal, setter];
}

export class ReactiveURL implements URL {
  private fields: Destructure<URLRecord>;
  private set: URLSetter;
  private rsp?: ReactiveSearchParams;
  private owner = getOwner()!;

  constructor(url: string, base?: string) {
    const [getURL, setURL] = createURL(url, base);
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
    if (!this.rsp) {
      this.rsp = new ReactiveSearchParams(this.search);
      runWithOwner(this.owner, () => createComputed(() => (this.search = this.rsp + "")));
    }
    return this.rsp;
  }
}

const WHOLE = Symbol("watch_whole");

export class ReactiveSearchParams extends URLSearchParams {
  private cache = createTriggerCache<string | typeof WHOLE>();

  constructor(
    init:
      | string
      | [string, string][]
      | Record<string, string>
      | URLSearchParams
      | ReactiveSearchParams
  ) {
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

/**
 * readonly:
 * - createLocationState
 * - createHistoryState
 * editable:
 * - createLocationSearchParams
 * - createLocationURL
 * independent:
 * - createSearchParams | ReactiveSearchParams class
 * - createURL | ReactiveURL class
 * functions:
 * - updateLocationSearchParams
 */
