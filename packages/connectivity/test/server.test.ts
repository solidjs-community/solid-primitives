import { describe, expect, vi, it } from "vitest";
import {
  makeConnectivityListener,
  createConnectivitySignal,
  makeNetworkInformation,
  createNetworkInformation,
} from "../src/index.js";

describe("makeConnectivityListener", () => {
  it("works in server", () => {
    const cb = vi.fn();
    makeConnectivityListener(cb);
    expect(cb).not.toBeCalled();
  });
});

describe("createConnectivitySignal", () => {
  it("works in server", () => {
    const onLine = createConnectivitySignal();
    expect(onLine()).toBe(true);
  });
});

describe("makeNetworkInformation", () => {
  it("works in server", () => {
    const cb = vi.fn();
    makeNetworkInformation(cb);
    expect(cb).not.toBeCalled();
  });
});

describe("createNetworkInformation", () => {
  it("works in server", () => {
    const info = createNetworkInformation();
    expect(info.online()).toBe(true);
    expect(info.downlink()).toBeUndefined();
    expect(info.downlinkMax()).toBeUndefined();
    expect(info.effectiveType()).toBeUndefined();
    expect(info.rtt()).toBeUndefined();
    expect(info.saveData()).toBeUndefined();
    expect(info.type()).toBeUndefined();
  });
});
