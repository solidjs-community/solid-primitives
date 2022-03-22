import { pick } from "@solid-primitives/immutable";
import { accessWith, biSyncSignals, createStaticStore } from "@solid-primitives/utils";
import { batch, getOwner, runWithOwner, untrack } from "solid-js";
import { entries, SetterValue } from "./common";
import { ReactiveSearchParams } from "./searchParams";

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
  "username"
] as const;

/**
 * Provides a `URL` instance as a reactive store.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#createURLRecord
 * @param url
 * @param base
 * @returns
 * ```ts
 * [ store, setter ]
 * ```
 * @example
 * const [url, setURL] = createURLRecord('http://example.com');
 * url.host // => "example.com"
 * setURL(p => ({
 *    href: p.href + "?foo=bar",
 *    hash: "heading1"
 * }))
 * url.search // => "?foo=bar"
 */
export function createURLRecord(
  url: string | URL,
  base?: string | URL
): [store: URLRecord, setter: URLSetter] {
  let instance = new URL(url, base);
  const [state, setState] = createStaticStore<URLRecord>(pick(instance, ...URL_KEYS));

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

/**
 * Creates an instance of the `ReactiveURL` class. The ReactiveURL interface represents an object providing reactive setters and getters used for managing object URLs.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#ReactiveURL
 * @param url
 * @param base
 * @returns an instance of the `ReactiveURL` class
 * @example
 * const url = createURL('http://example.com');
 * url.host // => "example.com"
 * url.search = "?foo=bar"
 * url.hash = "heading1"
 * url.search // => "?foo=bar"
 * createEffect(() => {
 *    console.log(url.href)
 * })
 */
export function createURL(url: string, base?: string): ReactiveURL {
  return new ReactiveURL(url, base);
}

/**
 * The ReactiveURL interface represents an object providing reactive setters and getters used for managing object URLs.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#ReactiveURL
 * @param url
 * @param base
 * @example
 * const url = new ReactiveURL('http://example.com');
 * url.host // => "example.com"
 * url.search = "?foo=bar"
 * url.hash = "heading1"
 * url.search // => "?foo=bar"
 * createEffect(() => {
 *    console.log(url.href)
 * })
 */
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
    this.set("search", search);
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
      untrack(
        runWithOwner.bind(void 0, this.owner, () => {
          const rsp = (this.rsp = new ReactiveSearchParams(this.search));
          biSyncSignals(
            {
              get: () => rsp + "",
              set: search => {
                // TODO: figure out a way to update search params granularly (currently causes needless updates)
                const keys = new Set(rsp.keys());
                const newSearchParams = new URLSearchParams(search);
                batch(() => {
                  newSearchParams.forEach((value, name) => {
                    if (keys.has(name)) {
                      keys.delete(name);
                      rsp.set(name, value);
                    } else rsp.append(name, value);
                  });
                  keys.forEach(key => rsp.delete(key));
                });
              }
            },
            {
              get: () => this.search,
              set: search => (this.search = search)
            }
          );
        })
      );
    return this.rsp!;
  }
}
