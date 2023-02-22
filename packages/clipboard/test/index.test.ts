import "./setup";
import { createComputed, createRoot } from "solid-js";
import { createClipboard } from "../src";
import { describe, expect, it } from "vitest";

describe("createClipboard", () => {
  it("test initial read values", () =>
    createRoot(async () => {
      const [clipboard, refetch] = createClipboard();
      let i = 0;

      await new Promise<void>(resolve => {
        createComputed(() => {
          const items = clipboard();
          if (i === 0) {
            expect(items).toHaveLength(0);
            queueMicrotask(() => refetch());
          } else {
            expect(items).toHaveLength(1);
            expect(items[0]!.text).toBe("InitialValue");
            resolve();
          }
          i++;
        });
      });
    }));
});
