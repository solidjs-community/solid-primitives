import { makeEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createHydratableSignal, trueFn, noop } from "@solid-primitives/utils";
import { createSignal, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";

// --- Types ---

export type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";

export type ConnectionType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "none"
  | "wifi"
  | "wimax"
  | "other"
  | "unknown";

/**
 * Snapshot of the current network state, combining `navigator.onLine` with
 * `navigator.connection` quality metrics. Properties from the Network Information
 * API are `undefined` when the browser doesn't support the API.
 */
export type NetworkState = {
  online: boolean;
  downlink: number | undefined;
  downlinkMax: number | undefined;
  effectiveType: EffectiveConnectionType | undefined;
  rtt: number | undefined;
  saveData: boolean | undefined;
  type: ConnectionType | undefined;
};

/**
 * Reactive accessors for the current network state. Each property is an
 * independent signal so consumers can subscribe to only what they need.
 */
export type NetworkInformationReturn = {
  /** Whether the browser considers itself online (`navigator.onLine`). */
  online: Accessor<boolean>;
  /** Effective bandwidth estimate in Mbit/s. */
  downlink: Accessor<number | undefined>;
  /** Maximum downlink speed in Mbit/s (not in current spec; may be undefined). */
  downlinkMax: Accessor<number | undefined>;
  /** Effective connection type as reported by the browser. */
  effectiveType: Accessor<EffectiveConnectionType | undefined>;
  /** Estimated round-trip latency in milliseconds. */
  rtt: Accessor<number | undefined>;
  /** Whether the user has requested reduced data usage. */
  saveData: Accessor<boolean | undefined>;
  /** Underlying connection technology type. */
  type: Accessor<ConnectionType | undefined>;
};

// Network Information API — not in TypeScript's standard lib.dom.d.ts
interface NetworkInformationConnection extends EventTarget {
  readonly downlink: number;
  readonly downlinkMax?: number;
  readonly effectiveType: EffectiveConnectionType;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type?: ConnectionType;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformationConnection;
  }
}

// --- Helpers ---

function readNetworkState(): NetworkState {
  const conn = navigator?.connection as NetworkInformationConnection | undefined;
  return {
    online: navigator.onLine,
    downlink: conn?.downlink,
    downlinkMax: conn?.downlinkMax,
    effectiveType: conn?.effectiveType,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
    type: conn?.type,
  };
}

// --- makeConnectivityListener ---

/**
 * Attaches event listeners and fires callback whenever `window.onLine` changes.
 * @param callback fired whenever `window.onLine` changes
 * @returns function clearing event listeners
 * @example
 * const clear = makeConnectivityListener(isOnline => {
 *    console.log(isOnline) // T: boolean
 * });
 * // remove event listeners (happens also on cleanup)
 * clear()
 */
export function makeConnectivityListener(callback: (isOnline: boolean) => void): VoidFunction {
  if (isServer) {
    return noop;
  }
  const clear1 = makeEventListener(window, "online", callback.bind(void 0, true));
  const clear2 = makeEventListener(window, "offline", callback.bind(void 0, false));
  return () => {
    clear1();
    clear2();
  };
}

// --- makeNetworkInformation ---

/**
 * Attaches event listeners and fires callback whenever the network state changes.
 * Covers both online/offline transitions (`window` events) and connection quality
 * changes (`navigator.connection` change event, where supported).
 * @param callback fired with a {@link NetworkState} snapshot on any change
 * @returns function clearing all event listeners
 * @example
 * const clear = makeNetworkInformation(state => {
 *   console.log(state.online, state.effectiveType);
 * });
 * clear();
 */
export function makeNetworkInformation(callback: (state: NetworkState) => void): VoidFunction {
  if (isServer) {
    return noop;
  }
  const fire = () => callback(readNetworkState());
  const clear1 = makeEventListener(window, "online", fire);
  const clear2 = makeEventListener(window, "offline", fire);
  const conn = navigator.connection as NetworkInformationConnection | undefined;
  const clear3 = conn ? makeEventListener(conn, "change", fire) : noop;
  return () => {
    clear1();
    clear2();
    clear3();
  };
}

// --- createConnectivitySignal ---

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 * @example
 * const isOnline = createConnectivitySignal()
 * isOnline() // T: boolean
 */
export function createConnectivitySignal(): Accessor<boolean> {
  if (isServer) {
    return trueFn;
  }
  const [status, setStatus] = createHydratableSignal<boolean>(true, () => navigator.onLine, {
    ownedWrite: true,
  });
  makeConnectivityListener(setStatus);
  return status;
}

// --- createNetworkInformation ---

const SERVER_NETWORK: NetworkInformationReturn = {
  online: trueFn,
  downlink: () => undefined,
  downlinkMax: () => undefined,
  effectiveType: () => undefined,
  rtt: () => undefined,
  saveData: () => undefined,
  type: () => undefined,
};

/**
 * Reactive signals for the full network state: `navigator.onLine` combined with
 * `navigator.connection` quality metrics (effective type, downlink, RTT, etc.).
 *
 * Network Information API properties fall back to `undefined` in browsers that
 * don't support the API (Firefox, Safari). Use alongside `<Show>` guards when
 * branching on specific values.
 *
 * @returns object of independent signal accessors for each network property
 * @example
 * const { online, effectiveType, saveData } = createNetworkInformation();
 * // adapt image quality based on connection
 * const quality = () => effectiveType() === "4g" && !saveData() ? "high" : "low";
 */
export function createNetworkInformation(): NetworkInformationReturn {
  if (isServer) {
    return SERVER_NETWORK;
  }
  const opts = { ownedWrite: true };
  const initial = readNetworkState();

  const [online, setOnline] = createSignal(initial.online, opts);
  const [downlink, setDownlink] = createSignal<number | undefined>(initial.downlink, opts);
  const [downlinkMax, setDownlinkMax] = createSignal<number | undefined>(
    initial.downlinkMax,
    opts,
  );
  const [effectiveType, setEffectiveType] = createSignal<EffectiveConnectionType | undefined>(
    initial.effectiveType,
    opts,
  );
  const [rtt, setRtt] = createSignal<number | undefined>(initial.rtt, opts);
  const [saveData, setSaveData] = createSignal<boolean | undefined>(initial.saveData, opts);
  const [type, setType] = createSignal<ConnectionType | undefined>(initial.type, opts);

  makeNetworkInformation(state => {
    setOnline(state.online);
    setDownlink(state.downlink);
    setDownlinkMax(state.downlinkMax);
    setEffectiveType(state.effectiveType);
    setRtt(state.rtt);
    setSaveData(state.saveData);
    setType(state.type);
  });

  return { online, downlink, downlinkMax, effectiveType, rtt, saveData, type };
}

// --- Singletons ---

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) except if during hydration.
 *
 * @return Returns a signal representing the online status. Read-only.
 * @example
 * const isOnline = useConnectivitySignal()
 * isOnline() // T: boolean
 */
export const useConnectivitySignal: () => Accessor<boolean> =
  /*#__PURE__*/ createHydratableSingletonRoot(createConnectivitySignal);

/**
 * {@link createNetworkInformation} as a singleton root — reuses a single set of
 * event listeners across all callers in the same application.
 *
 * @example
 * const { online, effectiveType } = useNetworkInformation();
 */
export const useNetworkInformation: () => NetworkInformationReturn =
  /*#__PURE__*/ createHydratableSingletonRoot(createNetworkInformation);
