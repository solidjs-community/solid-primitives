import { createRoot } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { createDateNow } from "../src";

test("returns an signal an update function", () => {
  createRoot(dispose => {
    const test_now = Date.now();
    const [now, update] = createDateNow(0);

    assert.type(now, "function", "should return a signal");
    assert.instance(now(), Date, "signal should return an instance of Date");
    const time = now().getTime();
    assert.ok(time > test_now - 100 && time < test_now + 100, "the date should be 'now'");

    assert.type(update, "function", "should return an update function");
    dispose();
  });
});

test("autoupdates", () => {
  createRoot(dispose => {
    const [now] = createDateNow(1);
    const time1 = now().getTime();

    setTimeout(() => {
      const time2 = now().getTime();
      assert.ok(time2 > time1, "the newer timestamp should have bigger value");
      dispose();
    }, 20);
  });
});

test("manual updating", () => {
  createRoot(dispose => {
    const [now, update] = createDateNow(() => false);
    const time1 = now().getTime();

    setTimeout(() => {
      const time2 = now().getTime();
      assert.ok(time1 === time2, "the time shouldn't update");
      update();

      setTimeout(() => {
        const time3 = now().getTime();
        assert.ok(time3 > time2, "the timestamp after update() should have bigger value");
        dispose();
      }, 2);
    }, 2);
  });
});

test("stop autoupdating onCleanup", () => {
  createRoot(dispose => {
    const [now] = createDateNow(1);
    const time1 = now().getTime();

    dispose();

    setTimeout(() => {
      const time2 = now().getTime();
      assert.ok(time1 === time2, "the time shouldn't update");
    }, 2);
  });
});

test.run();
