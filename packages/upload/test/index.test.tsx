import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createFileUploader } from "../src";

describe("createFileUploader", () => {
  it("file upload", () => {
    createRoot(dispose => {
      const { files: file } = createFileUploader();
      const { files } = createFileUploader({ multiple: true });

      expect(file()).toEqual([]);
      expect(files()).toEqual([]);
      dispose();
    });
  });
});
