import { createStaticStore } from "@solid-primitives/static-store";
import { accessWith, entries } from "@solid-primitives/utils";
import { pick } from "@solid-primitives/utils/immutable";
import { untrack } from "solid-js";
import type { SetterValue } from "./common.js";
import { ReactiveSearchParams } from "./searchParams.js";

export type URLRecord = {
  readonly hash: string;
  readonly host: string;
  readonly hostname: string;
  readonly href: string;
  readonly origin: string;
  readonly password: string;
  readonly pathname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  readonly username: string;
};
export type WritableURLFields = Exclude<keyof URLRecord, "origin">;

export type URLSetter = {
  (record: SetterValue<URLRecord, URLSetterRecord>): URLRecord;
  (key: WritableURLFields, value: SetterValue<string>): URLRecord;
};
export type URLSetterRecord = Partial<Record<WritableURLFields, string>>;

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
  "username",
] as const satisfies readonly (keyof URLRecord)[];

/**
 * Provides a `URL` instance as a reactive store.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#createURLRecord
 * @param url
 * @param base
 * @returns
 * ```ts
 * [store, setter]
 * ```
 * @example
 * ```ts
 * const [url, setURL] = createURLRecord("http://example.com");
 * url.host; // => "example.com"
 * setURL({ hash: "heading1" });
 * url.hash; // => "#heading1"
 * ```
 */
export function createURLRecord(
  url: string | URL,
  base?: string | URL,
): [store: URLRecord, setter: URLSetter] {
  const instance = new URL(url, base);
  const [state, setState] = createStaticStore<URLRecord>(pick(instance, ...URL_KEYS));

  const setter = (
    a: WritableURLFields | SetterValue<URLRecord, URLSetterRecord>,
    b?: SetterValue<string>,
  ): URLRecord => {
    if (typeof a === "string") {
      instance[a] = accessWith(b as SetterValue<string>, instance[a]);
    } else {
      const record = accessWith(a, state);
      for (const [key, value] of entries(record)) {
        // `origin` is excluded from URLSetterRecord's type, but a plain JS caller
        // (or one spreading the full URLRecord) could still pass it at runtime —
        // assigning to it would throw, since it's a getter-only property on URL.
        if ((key as string) === "origin" || value == null) continue;
        instance[key] = value;
      }
    }
    for (const key of URL_KEYS) setState(key, instance[key]);
    // A plain snapshot straight off `instance`, not `state` — `state`'s fields may already be
    // real (batched) signals if a caller reads them reactively elsewhere, so reading them back
    // synchronously right after this write, like `ReactiveURL`'s search sync does, could see the
    // pre-write value until the next flush. `instance` is a plain `URL`, always synchronous.
    return pick(instance, ...URL_KEYS);
  };

  return [state, ((a: any, b?: any) => untrack(() => setter(a, b))) as URLSetter];
}

/**
 * Creates an instance of the {@link ReactiveURL} class — an object providing reactive setters and getters for managing a URL.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#createURL
 * @param url
 * @param base
 * @example
 * ```ts
 * const url = createURL("http://example.com");
 * url.host; // => "example.com"
 * url.search = "?foo=bar";
 * createEffect(() => console.log(url.href));
 * ```
 */
export function createURL(url: string, base?: string): ReactiveURL {
  return new ReactiveURL(url, base);
}

/**
 * An object providing reactive setters and getters for managing a URL — every property is
 * granularly reactive, causing updates only when its value has actually changed.
 *
 * As this is a reactive structure, it should be instantiated under a reactive root.
 *
 * `ReactiveURL` does **not** extend the `URL` class, so `x instanceof URL` won't work.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#ReactiveURL
 * @example
 * ```ts
 * const url = new ReactiveURL("http://example.com");
 * url.host; // => "example.com"
 * url.search = "?foo=bar";
 * createEffect(() => console.log(url.href));
 * ```
 */
export class ReactiveURL implements Pick<URL, WritableURLFields | "origin" | "toJSON"> {
  readonly #fields: URLRecord;
  readonly #set: URLSetter;
  #searchParamsInstance: ReactiveSearchParams | undefined;
  // Guards the two-way sync between `.search` and `.searchParams` against re-entrant
  // ping-pong: a write on one side notifies the other, which would otherwise write back.
  #syncingSearchParams = false;

  constructor(url: string, base?: string) {
    const [fields, setURL] = createURLRecord(url, base);
    this.#fields = fields;
    this.#set = ((a: any, b?: any): URLRecord =>
      untrack(() => {
        const result = setURL(a, b);
        this.#syncSearchParamsFromSearch(result.search);
        return result;
      })) as URLSetter;
  }

  /** Applies the current `.search` string onto `.searchParams`, diffing so unrelated keys are left untouched. */
  #syncSearchParamsFromSearch(search: string): void {
    const rsp = this.#searchParamsInstance;
    if (!rsp || this.#syncingSearchParams) return;
    this.#syncingSearchParams = true;
    try {
      // `rsp.keys()` is a tracked read (it dirties/tracks the "whole" trigger) — untrack it,
      // or calling this from inside a host's own reactive render (e.g. Storybook wraps story
      // renders in a computation) would taint that computation with this internal bookkeeping.
      untrack(() => {
        const stale = new Set(rsp.keys());
        new URLSearchParams(search).forEach((value, name) => {
          if (stale.delete(name)) rsp.set(name, value);
          else rsp.append(name, value);
        });
        stale.forEach(name => rsp.delete(name));
      });
    } finally {
      this.#syncingSearchParams = false;
    }
  }

  get hash(): string {
    return this.#fields.hash;
  }
  set hash(hash: string) {
    this.#set("hash", hash);
  }

  get host(): string {
    return this.#fields.host;
  }
  set host(host: string) {
    this.#set("host", host);
  }

  get hostname(): string {
    return this.#fields.hostname;
  }
  set hostname(hostname: string) {
    this.#set("hostname", hostname);
  }

  get href(): string {
    return this.#fields.href;
  }
  set href(href: string) {
    this.#set("href", href);
  }

  get origin(): string {
    return this.#fields.origin;
  }

  get password(): string {
    return this.#fields.password;
  }
  set password(password: string) {
    this.#set("password", password);
  }

  get pathname(): string {
    return this.#fields.pathname;
  }
  set pathname(pathname: string) {
    this.#set("pathname", pathname);
  }

  get port(): string {
    return this.#fields.port;
  }
  set port(port: string) {
    this.#set("port", port);
  }

  get protocol(): string {
    return this.#fields.protocol;
  }
  set protocol(protocol: string) {
    this.#set("protocol", protocol);
  }

  get search(): string {
    return this.#fields.search;
  }
  set search(search: string) {
    this.#set("search", search);
  }

  get username(): string {
    return this.#fields.username;
  }
  set username(username: string) {
    this.#set("username", username);
  }

  toString(): string {
    return this.href;
  }
  toJSON(): string {
    return this.href;
  }

  /**
   * Same as in the `URL` class, returns an instance of {@link ReactiveSearchParams}, connected to this `ReactiveURL` instance.
   *
   * The reference is stable — the `searchParams` field can be destructured without losing reactivity.
   * ```ts
   * const url = new ReactiveURL("http://example.com");
   * const { searchParams } = url;
   * createEffect(() => console.log(searchParams.get("foo")));
   * url.search = "?foo=bar"; // will cause the effect to rerun
   * ```
   */
  get searchParams(): ReactiveSearchParams {
    let rsp = this.#searchParamsInstance;
    if (!rsp) {
      // untrack: this getter's first call is often the initial synchronous read that seeds it
      // (e.g. a host framework's render/memo wrapping component setup) — reading `this.search`
      // here shouldn't make *that* computation depend on `.search`, or a later write to it
      // (from either side of the sync below) would incorrectly retrigger it.
      rsp = this.#searchParamsInstance = new ReactiveSearchParams(
        untrack(() => this.search),
        () => {
          if (this.#syncingSearchParams) return;
          this.#syncingSearchParams = true;
          try {
            // `rsp.toString()` is a tracked read — see the comment in #syncSearchParamsFromSearch.
            untrack(() => {
              this.search = rsp!.toString();
            });
          } finally {
            this.#syncingSearchParams = false;
          }
        },
      );
    }
    return rsp;
  }
}
