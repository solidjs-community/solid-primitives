import { setOnline } from "./setup";
import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { makeConnectivityListener, createConnectivitySignal } from "../src";

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
      expect(onLine()).toBe(false);
      setOnline(true);
      expect(onLine()).toBe(true);
      dispose();
    }));
});
