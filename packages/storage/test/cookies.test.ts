import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { cookieStorage } from "../src";
import { createCookieStorage, createCookieStorageSignal } from "../src/cookies";

const testCookieStorage = suite("cookieStorage");

testCookieStorage("adds/gets/removes an item", () => {
  assert.is(cookieStorage.getItem("test"), null);
  cookieStorage.setItem("test", "1");
  assert.is(cookieStorage.getItem("test"), "1");
  cookieStorage.removeItem("test");
  assert.is(cookieStorage.getItem("test"), null);
});

testCookieStorage.run();

const testCreateCookieStorage = suite("createCookieStorage");

testCreateCookieStorage("creates a storage", () =>
  createRoot(dispose => {
    cookieStorage.clear();
    const [storage, setStorage, { remove, clear }] = createCookieStorage();
    setStorage("test", "1");
    cookieStorage.setItem("test2", "2");
    assert.is(storage.test, cookieStorage.getItem("test"));
    assert.is(storage.test, "1");
    assert.is(storage.test2, "2");
    remove("test2");
    assert.is(storage.test2, null);
    clear();
    assert.is(cookieStorage.length, 0);
    dispose();
  })
);

testCreateCookieStorage.run();

const testCreateCookieSignal = suite("createCookieSignal");

testCreateCookieSignal("creates a signal", () =>
  createRoot(dispose => {
    const [getter, setter] = createCookieStorageSignal("test3");
    assert.is(getter(), undefined);
    setter("3");
    assert.is(getter(), "3");
    dispose();
  })
);

testCreateCookieSignal.run();
