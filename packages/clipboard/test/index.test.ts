import "./setup";
import { createEffect, createRoot, createSignal, on } from "solid-js";
import { getLastClipboardEntry } from "./setup";
import { createClipboard, copyToClipboard } from "../src";
import * as assert from "uvu/assert";
import { suite } from "uvu";

const until = (value): Promise<void> =>
  new Promise(resolve => {
    const timeout = setTimeout(resolve, 2500);
    createRoot(dispose => {
      createEffect(
        on(
          value,
          () => {
            resolve();
            clearTimeout(timeout);
            dispose();
          },
          { defer: true }
        )
      );
    });
  });

const testCP = suite("createClipboard");

testCP("test initial read values", () =>
  createRoot(async dispose => {
    const [clipboard] = createClipboard();
    await until(clipboard);
    const items = clipboard();
    assert.equal(items.length, 1);
    const txt = items[0].text;
    await until(txt);
    assert.is(txt(), "InitialValue");
    dispose();
  })
);

testCP.run();
