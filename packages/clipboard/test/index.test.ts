import { getLastClipboardEntry } from "./setup";
import createClipboard from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createClipboard");

test("copies text to clipboard, and reads", () => {
  const [write, read] = createClipboard();
  write("hello");
  setTimeout(() => {
    assert.is(getLastClipboardEntry(), "hello");

    write("readTest");
    setTimeout(() => {
      read().then(res => {
        assert.is(res, "readTest");
      });
    }, 0);
  }, 0);
});

test.run();
