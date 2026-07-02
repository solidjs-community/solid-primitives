import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createRoot } from "solid-js";
import { fromStream } from "../src/index.js";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { join } from "path";

describe("fromStream", () => {
  // this is only relevant on streaming SSR, which is not supported by our tests,
  // so we will test it outside of Solid
  test("works on node readable streams", async () => {
    const stream = Readable.toWeb(createReadStream(join(import.meta.dirname, "../README.md")));
    const readme = fromStream(() => stream);
    let parts = 0;
    for await (const data of readme()) {
      parts++;
      expect(data).toBeDefined();
    }
    expect(parts).toBeGreaterThan(0);
  });
});
