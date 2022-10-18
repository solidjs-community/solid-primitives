import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { createFileUploader } from "../src";

describe("createFileUploader", () => {
  it("file upload", () => {
    createRoot(dispose => {
      const { files: file, selectFiles: selectFile } = createFileUploader();
      const { files, selectFiles } = createFileUploader({ multiple: true });

      expect(file()).toEqual([]);
      expect(files()).toEqual([]);
      dispose();
    });
  });
});
