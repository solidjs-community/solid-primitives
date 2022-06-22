import { createRoot, createSignal } from "solid-js";
import { getLastClipboardEntry } from "./setup";
import { createClipboard } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testCP = suite("createClipboard");

testCP("copies text to clipboard, and reads", () =>
  createRoot(async dispose => {
    const [data, setData] = createSignal('');
    const [clipboard, read] = createClipboard(data);
    await setData("hello");
    console.log(clipboard(), getLastClipboardEntry());
    // assert.is(clipboard(), "hello");
    dispose();
  })
);

testCP.run();
