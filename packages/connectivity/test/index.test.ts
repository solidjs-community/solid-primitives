import { setOnline, setConnection, resetConnection } from "./setup.js";
import { afterEach, describe, expect, it } from "vitest";
import { createRoot, flush } from "solid-js";
import {
  makeConnectivityListener,
  createConnectivitySignal,
  makeNetworkInformation,
  createNetworkInformation,
  type NetworkState,
} from "../src/index.js";

afterEach(() => {
  setOnline(true);
  resetConnection();
});

describe("makeConnectivityListener", () => {
  it("works", () =>
    createRoot(dispose => {
      let captured!: boolean;
      makeConnectivityListener(e => (captured = e));
      expect(captured, "0").toBe(undefined);
      setOnline(false);
      expect(captured, "1").toBe(false);
      setOnline(true);
      expect(captured, "2").toBe(true);
      dispose();
    }));
});

describe("createConnectivitySignal", () => {
  it("works", () =>
    createRoot(dispose => {
      const onLine = createConnectivitySignal();
      expect(onLine()).toBe(true);
      setOnline(false);
      flush();
      expect(onLine()).toBe(false);
      setOnline(true);
      flush();
      expect(onLine()).toBe(true);
      dispose();
    }));
});

describe("makeNetworkInformation", () => {
  it("fires callback on online/offline events", () =>
    createRoot(dispose => {
      let captured: NetworkState | undefined;
      makeNetworkInformation(s => (captured = s));

      setOnline(false);
      expect(captured?.online).toBe(false);

      setOnline(true);
      expect(captured?.online).toBe(true);
      dispose();
    }));

  it("fires callback on connection change", () =>
    createRoot(dispose => {
      let captured: NetworkState | undefined;
      makeNetworkInformation(s => (captured = s));

      setConnection({ effectiveType: "2g", rtt: 400 });
      expect(captured?.effectiveType).toBe("2g");
      expect(captured?.rtt).toBe(400);
      dispose();
    }));

  it("includes all connection fields in snapshot", () =>
    createRoot(dispose => {
      let captured: NetworkState | undefined;
      makeNetworkInformation(s => (captured = s));

      setConnection({ downlink: 1.5, saveData: true, type: "cellular" });
      expect(captured?.downlink).toBe(1.5);
      expect(captured?.saveData).toBe(true);
      expect(captured?.type).toBe("cellular");
      dispose();
    }));

  it("returns noop on first call without event", () =>
    createRoot(dispose => {
      let callCount = 0;
      makeNetworkInformation(() => callCount++);
      expect(callCount).toBe(0);
      dispose();
    }));
});

describe("createNetworkInformation", () => {
  it("returns initial network state", () =>
    createRoot(dispose => {
      const info = createNetworkInformation();
      expect(info.online()).toBe(true);
      expect(info.effectiveType()).toBe("4g");
      expect(info.downlink()).toBe(10);
      expect(info.rtt()).toBe(50);
      expect(info.saveData()).toBe(false);
      expect(info.type()).toBe("wifi");
      expect(info.downlinkMax()).toBeUndefined();
      dispose();
    }));

  it("updates online signal on window events", () =>
    createRoot(dispose => {
      const info = createNetworkInformation();

      setOnline(false);
      flush();
      expect(info.online()).toBe(false);

      setOnline(true);
      flush();
      expect(info.online()).toBe(true);
      dispose();
    }));

  it("updates connection signals on navigator.connection change", () =>
    createRoot(dispose => {
      const info = createNetworkInformation();

      setConnection({ effectiveType: "3g", downlink: 2, rtt: 200 });
      flush();
      expect(info.effectiveType()).toBe("3g");
      expect(info.downlink()).toBe(2);
      expect(info.rtt()).toBe(200);
      dispose();
    }));

  it("updates saveData and type signals", () =>
    createRoot(dispose => {
      const info = createNetworkInformation();

      setConnection({ saveData: true, type: "cellular" });
      flush();
      expect(info.saveData()).toBe(true);
      expect(info.type()).toBe("cellular");
      dispose();
    }));

  it("updates online signal when online/offline fires alongside connection change", () =>
    createRoot(dispose => {
      const info = createNetworkInformation();

      setOnline(false);
      flush();
      expect(info.online()).toBe(false);
      expect(info.effectiveType()).toBe("4g");
      dispose();
    }));
});
