import { entries, SetterValue } from "./common";
import { createSimpleEmitter } from "@solid-primitives/event-bus";
import { accessWith, createStaticStore, noop, warn } from "@solid-primitives/utils";
import { pick } from "@solid-primitives/immutable";
import { createEventListener } from "@solid-primitives/event-listener";
import { ReactiveURL } from "./url";
import { createSharedRoot } from "@solid-primitives/rootless";
import { isServer } from "solid-js/web";

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
};
export type WritableLocationFields = Exclude<keyof LocationState, "origin">;
export type LocationSetterRecord = Partial<Record<WritableLocationFields, string>>;

export type LocationSetter = {
  (record: SetterValue<LocationState, LocationSetterRecord>): void;
  (key: WritableLocationFields, value: SetterValue<string>): void;
};

export type UpdateLocationMethod = "push" | "replace" | "navigate";
export type LocationFallbackInit = LocationState | string | URL | ReactiveURL;

let LOCATION_FALLBACK: LocationState | undefined;

const LOCATION_FIELDS = [
  "origin",
  "hash",
  "host",
  "hostname",
  "href",
  "pathname",
  "port",
  "protocol",
  "search"
] as const;

let monkeyPatchedStateEvents = false;
const [listenStateEvents, triggerStateEvents] = /*#__PURE__*/ createSimpleEmitter();

/** @internal */
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

/** @internal */
function getLocationStateFromFallback(fallback: LocationFallbackInit): LocationState {
  if (typeof fallback === "string" || fallback instanceof URL || fallback instanceof ReactiveURL) {
    const instance = typeof fallback === "string" ? new URL(fallback) : fallback;
    return pick(instance, ...LOCATION_FIELDS);
  } else return fallback;
}

/**
 * Change window's location state, by pushing or replacing value in history stack, or by forcing a navigation to a new href.
 * @param href new location's href
 * @param method `"push" | "replace" | "navigate"`
 * - `"push"` - uses `history.pushState`
 * - `"replace"` - uses `history.replaceState`
 * - `"navigate"` - overwrites location
 */
export function updateLocation(href: string, method: UpdateLocationMethod): void {
  if (isServer) return;
  if (method === "push") return history.pushState({}, "", href);
  if (method === "replace") return history.replaceState({}, "", href);
  location.href = href;
}

/**
 * Set global server fallback for location for every `createLocationState`.
 *
 * Needs to be called before other primitives to take effect.
 */
export function setLocationFallback(fallback: LocationFallbackInit): void {
  if (isServer) LOCATION_FALLBACK = getLocationStateFromFallback(fallback);
}

/**
 * Creates a reactive `window.location` state. The state will update whenever the location changes. And the location can be modified using provided setters methods, to push, replace or navigate to a new href.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#createLocationState
 * @param fallback state to be used on the server *(default is an object with empty strings)*
 * @returns
 * ```ts
 * [ state, { push, replace, navigate } ]
 * ```
 * @example
 * const [state, { push }] = createLocationState();
 * state.href // => "http://example.com"
 * push(p => ({
 *    href: p.href + "?foo=bar",
 *    hash: "heading1"
 * }))
 */
export function createLocationState(fallback?: LocationFallbackInit): [
  state: LocationState,
  setters: {
    push: LocationSetter;
    replace: LocationSetter;
    navigate: LocationSetter;
  }
] {
  if (isServer && typeof location === "undefined") {
    const state = fallback ? getLocationStateFromFallback(fallback) : LOCATION_FALLBACK;
    if (!state)
      throw new Error(
        "createLocationState requires location fallback to be provided for the server execution."
      );
    return [
      state,
      {
        push: noop,
        replace: noop,
        navigate: noop
      }
    ];
  }

  const [state, setState] = createStaticStore<LocationState>(pick(location, ...LOCATION_FIELDS));
  const updateState = () => setState.bind(location);
  createEventListener(window, ["popstate", "hashchange"], updateState, false);
  patchStateEvents();
  listenStateEvents(updateState);

  const setter = (
    method: UpdateLocationMethod,
    a: WritableLocationFields | SetterValue<LocationState, LocationSetterRecord>,
    b?: SetterValue<string>
  ) => {
    if (isServer) return warn("Location doesn't exist on the server, hence cannot be overwritten.");
    const url = new URL(location.href);
    if (typeof a === "string") {
      url[a] = accessWith(b, [location[a]])!;
    } else {
      const record = accessWith(a, [state]);
      if (record instanceof URL || record instanceof ReactiveURL)
        return updateLocation(record.href, method);
      // @ts-expect-error origin filed is omitted from the types, but could still be passed to the setter
      delete record["origin"];
      if (Object.keys(record).length === 0) return;
      for (const [key, value] of entries(record)) value && (url[key] = value);
    }
    updateLocation(url.href, method);
  };

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
 * Uses a shared reactive `window.location` state, or creates one if one is not active. The state will update whenever the location changes. And the location can be modified using provided setters methods, to push, replace or navigate to a new href.
 *
 * Use `setLocationFallback` to set server fallback.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/url#useSharedLocationState
 * @returns
 * ```ts
 * [ state, { push, replace, navigate } ]
 * ```
 * @example
 * const [state, { push }] = useSharedLocationState();
 * state.href // => "http://example.com"
 * push(p => ({
 *    href: p.href + "?foo=bar",
 *    hash: "heading1"
 * }))
 */
export const useSharedLocationState = /*#__PURE__*/ createSharedRoot(
  createLocationState.bind(void 0, undefined)
);

/** @internal */
export const _useLocationState = (useShared: boolean) =>
  useShared ? useSharedLocationState() : createLocationState();
