import { setOnline } from "./setup";
import { newConnectivityListener, createConnectivitySignal } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testNCL = suite("newConnectivityListener");

testNCL("newConnectivityListener", () =>
  createRoot(dispose => {
    let captured!: boolean;
    newConnectivityListener(e => (captured = e));
    assert.is(captured, undefined, "0");
    setOnline(false);
    assert.is(captured, false, "1");
    setOnline(true);
    assert.is(captured, true, "2");
    dispose();
  })
);

testNCL.run();

const testCCS = suite("createConnectivitySignal");

testCCS("createConnectivitySignal", () =>
  createRoot(dispose => {
    const onLine = createConnectivitySignal();
    assert.equal(onLine(), true);
    setOnline(false);
    assert.equal(onLine(), false);
    dispose();
  })
);

testCCS.run();
