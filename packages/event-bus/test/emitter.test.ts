import { describe, test, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createEmitter, createGlobalEmitter } from "../src/index.js";

describe("createEmitter", () => {
  test("listening and emiting", () =>
    createRoot(() => {
      const hub = createEmitter<{
        busA: number;
        busB: string;
      }>();

      const cbA = vi.fn();
      const cbB = vi.fn();

      hub.on("busA", cbA);
      hub.on("busB", cbB);

      hub.emit("busA", 0);
      hub.emit("busA", 1);
      hub.emit("busB", "foo");
      hub.emit("busB", "bar");

      expect(cbA).toBeCalledTimes(2);
      expect(cbA).nthCalledWith(1, 0);
      expect(cbA).nthCalledWith(2, 1);

      expect(cbB).toBeCalledTimes(2);
      expect(cbB).nthCalledWith(1, "foo");
      expect(cbB).nthCalledWith(2, "bar");
    }));
});

describe("createGlobalEmitter", () => {
  test("listening and emiting", () =>
    createRoot(() => {
      const hub = createGlobalEmitter<{
        busA: number;
        busB: string;
      }>();

      const cbA = vi.fn();
      const cbB = vi.fn();
      const cbAny = vi.fn();

      hub.on("busA", cbA);
      hub.on("busB", cbB);
      hub.listen(cbAny);

      hub.emit("busA", 0);
      hub.emit("busA", 1);
      hub.emit("busB", "foo");
      hub.emit("busB", "bar");

      expect(cbA).toBeCalledTimes(2);
      expect(cbA).nthCalledWith(1, 0);
      expect(cbA).nthCalledWith(2, 1);

      expect(cbB).toBeCalledTimes(2);
      expect(cbB).nthCalledWith(1, "foo");
      expect(cbB).nthCalledWith(2, "bar");

      expect(cbAny).toBeCalledTimes(4);
      expect(cbAny).nthCalledWith(1, { name: "busA", details: 0 });
      expect(cbAny).nthCalledWith(2, { name: "busA", details: 1 });
      expect(cbAny).nthCalledWith(3, { name: "busB", details: "foo" });
      expect(cbAny).nthCalledWith(4, { name: "busB", details: "bar" });
    }));
});
