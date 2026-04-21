import "./setup";
import { createRoot, flush, resolve } from "solid-js";
import { createClipboard, type ClipboardResourceItem } from "../src/index.js";
import { describe, expect, it } from "vitest";

// flush/resolve are Solid 2.0 APIs; they don't exist in 1.x.
// Skip tests that require them when running from the monorepo root against 1.x.
const it2 = it.skipIf(typeof flush !== "function");

describe("createClipboard", () => {
  it("starts with an empty array synchronously", () => {
    createRoot(dispose => {
      const [clipboard] = createClipboard();
      expect(clipboard()).toEqual([]);
      dispose();
    });
  });

  it2("reads clipboard items after refetch", async () => {
    let clipboardRef!: () => ClipboardResourceItem[];
    let refetchRef!: VoidFunction;

    const dispose = createRoot(d => {
      const [clipboard, refetch] = createClipboard();
      clipboardRef = clipboard;
      refetchRef = refetch;
      return d;
    });

    expect(clipboardRef()).toHaveLength(0);

    refetchRef();
    // flush() forces the async memo to start its pending read synchronously,
    // so that resolve() correctly waits for it rather than seeing the stale [].
    flush();
    await resolve(() => clipboardRef());

    expect(clipboardRef()).toHaveLength(1);
    expect(clipboardRef()[0]!.text).toBe("InitialValue");

    dispose();
  });
});
