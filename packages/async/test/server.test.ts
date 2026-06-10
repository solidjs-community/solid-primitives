import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createRoot } from "solid-js";
import { fromStream } from "../src/index.js";
import { createReadStream } from "fs";
import { Readable } from "stream";

describe("fromStream", () => {
  test("works on readable streams in SSR", async () => {
    const stream = Readable.toWeb(createReadStream('../../README.md'));
    const readme = fromStream(() => stream);
    let parts = 0;
    for await (const data of readme()) {
      parts++;
      expect(data).toBeDefined();
    }
    expect(parts).toBeGreaterThan(0);
  });
});
