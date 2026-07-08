import { makeEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createStaticStore } from "@solid-primitives/static-store";
import { accessWith, entries, noop, tryOnCleanup } from "@solid-primitives/utils";
import { pick } from "@solid-primitives/utils/immutable";
import { getRequestEvent, isServer } from "@solidjs/web";
import type { SetterValue } from "./common.ts";

export type LocationState = {
  readonly hash: string;
  readonly host: string;
  readonly hostname: string;
  readonly href: string;
  readonly origin: string;
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
export type LocationFallbackInit = LocationState | string | URL;

const LOCATION_FIELDS = [
  "hash",
  "host",
  "hostname",
  "href",
  "origin",
  "pathname",
  "port",
  "protocol",
  "search",
] as const satisfies readonly (keyof LocationState)[];

let locationFallback: LocationState | undefined;

// history.pushState/replaceState don't dispatch any event on their own, so every
// createLocationState instance needs to know when either was called — not just
// on back/forward (popstate) or #hash changes — hence the one-time monkey-patch.
const historyStateListeners = new Set<VoidFunction>();
// Keyed on the `history` object itself (not a plain boolean) — a module can outlive
// the realm it was first patched in (e.g. an iframe/popup's own `history`, or a test
// runner that reuses the module cache across per-file jsdom realms), so a global flag
// would leave every later realm's `history` unpatched and its listeners un-notified.
const patchedHistories = new WeakSet<History>();

function patchHistoryState(): void {
  if (patchedHistories.has(history)) return;
  patchedHistories.add(history);

  const pushState = history.pushState.bind(history);
  const replaceState = history.replaceState.bind(history);
  const notify = () => historyStateListeners.forEach(listener => listener());

  history.pushState = (...args: Parameters<History["pushState"]>) => {
    pushState(...args);
    notify();
  };
  history.replaceState = (...args: Parameters<History["replaceState"]>) => {
    replaceState(...args);
    notify();
  };
}

function getLocationStateFromFallback(fallback: LocationFallbackInit): LocationState {
  if (typeof fallback === "string" || fallback instanceof URL) {
    return pick(new URL(fallback), ...LOCATION_FIELDS);
  }
  return fallback;
}

/**
 * Changes window's location state, by pushing or replacing a value in the history stack, or by forcing a navigation to a new href.
 *
 * @param href new location's href
 * @param method `"push" | "replace" | "navigate"`
 * - `"push"` — uses `history.pushState`
 * - `"replace"` — uses `history.replaceState`
 * - `"navigate"` — overwrites `location.href`
 */
export function updateLocation(href: string, method: UpdateLocationMethod): void {
  if (isServer) return;
  if (method === "push") return history.pushState(null, "", href);
  if (method === "replace") return history.replaceState(null, "", href);
  location.href = href;
}

/**
 * Sets a global server fallback for `window.location`, used by every {@link createLocationState} that doesn't provide its own.
 *
 * Needs to be called before the primitives that rely on it, to take effect.
 */
export function setLocationFallback(fallback: LocationFallbackInit): void {
  if (isServer) locationFallback = getLocationStateFromFallback(fallback);
}

/**
 * Creates a reactive `window.location` state.
 *
 * The state updates whenever the location changes — via back/forward navigation, a `#hash`
 * change, or `history.pushState`/`replaceState` — and can be modified using the provided
 * setter methods, to push, replace, or navigate to a new href.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#createLocationState
 * @param fallback state to use during SSR, when `window.location` isn't available. Falls back to the current request's URL (via `getRequestEvent`), then to {@link setLocationFallback}'s value, if not provided.
 * @returns
 * ```ts
 * [state, { push, replace, navigate }]
 * ```
 * @example
 * ```ts
 * const [state, { push }] = createLocationState();
 * state.href; // => "http://example.com"
 * push({ hash: "heading1" });
 * ```
 */
export function createLocationState(fallback?: LocationFallbackInit): [
  state: LocationState,
  setters: {
    push: LocationSetter;
    replace: LocationSetter;
    navigate: LocationSetter;
  },
] {
  if (isServer) {
    let state: LocationState | undefined;
    if (fallback) {
      state = getLocationStateFromFallback(fallback);
    } else {
      const requestEvent = getRequestEvent();
      state = requestEvent
        ? getLocationStateFromFallback(requestEvent.request.url)
        : locationFallback;
    }
    if (!state) {
      throw new Error(
        "createLocationState requires a location fallback for server execution. " +
          "Pass one as an argument, set a global one with setLocationFallback, or " +
          "run inside a request context that provides one via getRequestEvent.",
      );
    }
    return [state, { push: noop, replace: noop, navigate: noop }];
  }

  const [state, setState] = createStaticStore<LocationState>(pick(location, ...LOCATION_FIELDS));
  const updateState = () => setState(pick(location, ...LOCATION_FIELDS));

  makeEventListener(window, "popstate", updateState);
  makeEventListener(window, "hashchange", updateState);
  patchHistoryState();
  historyStateListeners.add(updateState);
  tryOnCleanup(() => historyStateListeners.delete(updateState));

  const setter = (
    method: UpdateLocationMethod,
    a: WritableLocationFields | SetterValue<LocationState, LocationSetterRecord>,
    b?: SetterValue<string>,
  ) => {
    const url = new URL(location.href);
    // `origin` is excluded from WritableLocationFields/LocationSetterRecord's types, but a
    // plain JS caller could still pass it at runtime — assigning to it would throw, since
    // it's a getter-only property on URL.
    if (typeof a === "string") {
      if ((a as string) === "origin") return;
      url[a] = accessWith(b as SetterValue<string>, state[a]);
    } else {
      const record = accessWith(a, state);
      for (const [key, value] of entries(record)) {
        if ((key as string) === "origin" || value == null) continue;
        url[key] = value;
      }
    }
    updateLocation(url.href, method);
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
 * Reuses a shared-root {@link createLocationState}, or creates one if one isn't active.
 *
 * Use it instead of {@link createLocationState} to avoid recreating signals, computations, and event listeners for every consumer.
 *
 * Its interface is the same as {@link createLocationState}, but without a `fallback` argument — use {@link setLocationFallback} to set the server fallback instead.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/url#useSharedLocationState
 */
export const useSharedLocationState: ReturnType<typeof createHydratableSingletonRoot<ReturnType<typeof createLocationState>>> = /*#__PURE__*/ createHydratableSingletonRoot(() =>
  createLocationState(),
);

/** @internal */
export const _useLocationState: (useShared: boolean) => ReturnType<typeof createLocationState> = (useShared: boolean): ReturnType<typeof createLocationState> =>
  useShared ? useSharedLocationState() : createLocationState();
