import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createFileUploader } from "../src";

const test = suite("createFileUploader");

test("file upload", () => {
  createRoot(dispose => {
    const { files: file, selectFiles: selectFile } = createFileUploader();
    const { files, selectFiles } = createFileUploader({ multiple: true });

    assert.equal(file(), []);
    assert.equal(files(), []);
    dispose();
  });
});

test.run();
