import { describe, it, expect } from "vitest";
import { createWorkerRPC } from "../src/rpc";

describe("createWorkerRPC", () => {
  it("returns safe proxy structure in node environment", () => {
    const rpc = createWorkerRPC<any>("dummy.js");
    expect(typeof rpc.terminate).toBe("function");
  });
});
