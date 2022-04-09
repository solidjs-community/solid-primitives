import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createFileUploader from "../src";

const test = suite("createFileUploader");

test("file upload", () => {
  createRoot(dispose => {
    const { files, selectFiles } = createFileUploader();

    assert.is(files(), null);
    dispose();
  });
});

test.run();

/**
 * - selectFiles is called
 * - input element is created with type of 'file'
 * - 'change' event listener is attached
 * - 'change' event listener is called
 * - event.files is parsed
 * - files updated to array or object
 * - user provided callback is called
 */
