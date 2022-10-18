import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createFileUploader } from "../src";

describe("createFileUploader", () => {
  test("file upload", () => {
    createRoot(dispose => {
      const { files: file } = createFileUploader();
      const { files } = createFileUploader({ multiple: true });

      expect(file()).toEqual([]);
      expect(files()).toEqual([]);
      dispose();
    });
  });
});
