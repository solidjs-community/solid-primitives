import type { ConnectionType, EffectiveConnectionType } from "../src/index.js";

// --- online/offline mock ---

let online = true;

export const setOnline = (value: boolean) => {
  online = value;
  window.dispatchEvent(new Event(value ? "online" : "offline"));
};

Object.defineProperty(navigator, "onLine", {
  get: () => online,
});

// --- Network Information API mock ---

export type MockConnectionState = {
  downlink: number;
  downlinkMax: number | undefined;
  effectiveType: EffectiveConnectionType;
  rtt: number;
  saveData: boolean;
  type: ConnectionType;
};

const DEFAULT_CONNECTION: MockConnectionState = {
  downlink: 10,
  downlinkMax: undefined,
  effectiveType: "4g",
  rtt: 50,
  saveData: false,
  type: "wifi",
};

class MockNetworkConnection extends EventTarget {
  downlink = DEFAULT_CONNECTION.downlink;
  downlinkMax = DEFAULT_CONNECTION.downlinkMax;
  effectiveType = DEFAULT_CONNECTION.effectiveType;
  rtt = DEFAULT_CONNECTION.rtt;
  saveData = DEFAULT_CONNECTION.saveData;
  type = DEFAULT_CONNECTION.type;
}

export const mockConnection = new MockNetworkConnection();

Object.defineProperty(navigator, "connection", {
  get: () => mockConnection,
  configurable: true,
});

export const setConnection = (updates: Partial<MockConnectionState>) => {
  Object.assign(mockConnection, updates);
  mockConnection.dispatchEvent(new Event("change"));
};

export const resetConnection = () => {
  Object.assign(mockConnection, DEFAULT_CONNECTION);
};
