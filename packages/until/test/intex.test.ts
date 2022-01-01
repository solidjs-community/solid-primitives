import { until } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal } from "solid-js";

const testUntil = suite("until");

testUntil("awaits reactive condition", () =>
  createRoot(dispose => {
    const [state, setState] = createSignal(false);

    until(state).then(res => {
      assert.is(res, true);
      dispose();
    });

    setTimeout(() => {
      setState(true);
    }, 0);
  })
);

testUntil.run();
