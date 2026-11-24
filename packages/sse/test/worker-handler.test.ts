import "./setup";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SSEReadyState } from "../src/sse.js";
import type { SSEWorkerMessage } from "../src/worker.js";

/** Post a message to the handler exactly as the main thread would. */
const post = (data: unknown) =>
  self.dispatchEvent(new MessageEvent("message", { data: data as SSEWorkerMessage }));

describe("worker-handler", () => {
  beforeAll(async () => {
    // The handler registers its listeners on `self` as a side effect of loading.
    vi.spyOn(self as any, "postMessage").mockImplementation(() => {});
    await import("../src/worker-handler.js");
  });

  it("closes the EventSource on disconnect", () => {
    post({ type: "connect", id: "a", url: "/events" });
    expect(SSEInstances).toHaveLength(1);
    const source = SSEInstances[0]!;
    post({ type: "disconnect", id: "a" });
    expect(source.readyState).toBe(SSEReadyState.CLOSED);
  });

  it("ignores a disconnect for an id that was never connected", () => {
    expect(() => post({ type: "disconnect", id: "missing" })).not.toThrow();
  });

  it("never invokes inherited Object properties for hostile ids", () => {
    for (const id of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
      expect(() => post({ type: "disconnect", id })).not.toThrow();
    }
  });
});
