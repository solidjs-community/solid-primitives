import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createFileUploader } from "../src";

const test = suite("createFileUploader");

test("file upload", () => {
  createRoot(dispose => {
    const { files: file, selectFiles: selectFile } = createFileUploader();
    const { files, selectFiles } = createFileUploader({ multiple: true });

    assert.is(file(), undefined);
    assert.is(files(), undefined);
    dispose();
  });
});

test.run();
