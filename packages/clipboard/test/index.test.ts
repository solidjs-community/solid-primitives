import "./setup";
import { createEffect, createRoot, createSignal, on } from "solid-js";
import { getLastClipboardEntry } from "./setup";
import { createClipboard, copyToClipboard } from "../src";
import { describe, expect, it } from 'vitest';

const until = (value): Promise<void> =>
  new Promise(resolve => {
    const timeout = setTimeout(resolve, 2500);
    createRoot(dispose => {
      createEffect(
        on(
          value,
          () => {
            resolve();
            clearTimeout(timeout);
            dispose();
          },
          { defer: true }
        )
      );
    });
  });

describe("createClipboard", () => {
  it("test initial read values", () =>
    createRoot(async dispose => {
      const [clipboard] = createClipboard();
      await until(clipboard);
      const items = clipboard();
      expect(items).toHaveLength(1);
      const txt = items![0].text;
      await until(txt);
      expect(txt()).toBe("InitialValue");
      dispose();
    })
  );
});
