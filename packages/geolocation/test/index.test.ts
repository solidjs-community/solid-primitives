import "./setup";
import { mockCoordinates } from "./setup";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createGeolocation, createGeolocationWatcher } from "../src/index";

const testCG = suite("createGeolocation");

testCG("test basic geolocation", () =>
  createRoot(async dispose => {
    const [location] = createGeolocation();
    assert.is(location.loading, true);
    await location.loading;
    assert.is(location.loading, false);
    assert.is(location(), mockCoordinates);
    dispose();
  })
);

testCG("test basic geolocation error", () =>
  createRoot(async dispose => {
    navigator.geolocation.getCurrentPosition = (_, reject: any) => {
      reject({ code: 1, message: "GeoLocation error" });
    };
    const [location] = createGeolocation();
    await location();
    assert.is(location.loading, false);
    assert.equal(location.error, { code: 1, message: "GeoLocation error" });
    dispose();
  })
);

testCG.run();

const testCGW = suite("createGeolocation");

testCGW("test basic geolocation", () =>
  createRoot(async dispose => {
    const [enabled, setEnabled] = createSignal(false);
    const watcher = createGeolocationWatcher(enabled);
    assert.is(watcher.location, null);
    assert.is(watcher.error, null);
    await setEnabled(true);
    assert.is(watcher.location, mockCoordinates);
    dispose();
  })
);

testCGW.run();
