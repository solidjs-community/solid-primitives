import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createChunkedUpload } from "../src/chunker";

describe("createChunkedUpload", () => {
  it("initializes with 0% progress and inactive state", () => {
    createRoot(dispose => {
      const upload = createChunkedUpload();
      expect(upload.progress()).toBe(0);
      expect(upload.isProcessing()).toBe(false);
      dispose();
    });
  });
});
