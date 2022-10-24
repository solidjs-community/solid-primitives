import { describe, expect, it } from "vitest";

import { createEffect, createRoot, createSignal } from "solid-js";

import { createScriptLoader } from "../src";

const dispatchAndWait = (script?: HTMLScriptElement, name: "load" | "error" = "load") =>
  new Promise<void>(resolve => {
    script?.addEventListener(name, () => {
      resolve();
    });
    script?.dispatchEvent(new Event(name));
  });

describe("createScriptLoader", () => {
  it("will create a script tag with src", () =>
    createRoot(dispose => {
      const [_, remove] = createRoot(() =>
        createScriptLoader({ src: "https://localhost:3000/script.js" })
      );
      const script = document.querySelector('script[src="https://localhost:3000/script.js"]');
      expect(script).toBeInstanceOf(window.HTMLScriptElement);
      remove();
    }));

  it("will create a script tag with textContent", () =>
    createRoot(dispose => {
      const src = "!(function(){ window.test = true; })();";
      const [script, remove] = createRoot(() => createScriptLoader({ src }));
      expect(script).toBeInstanceOf(window.HTMLScriptElement);
      expect(script?.textContent).toBe(src);
      remove();
    }));

  it("will call the onload handler", async () => {
    let loadCalled = false;
    const [script, remove] = createRoot(() =>
      createScriptLoader({
        src: "https://localhost:3000/script.js",
        onload: () => {
          loadCalled = true;
        }
      })
    );
    dispatchAndWait(script, "load");
    expect(loadCalled).toBe(true);
    remove();
  });

  it("will call the onerror handler", async () => {
    let errorCalled = false;
    const [script, remove] = createRoot(() =>
      createScriptLoader({
        src: "https://localhost:3000/script.js",
        onerror: () => {
          errorCalled = true;
        }
      })
    );
    dispatchAndWait(script, "error");
    expect(errorCalled).toBe(true);
    remove();
  });

  it("will update the url from an accessor", async () => {
    const actualSrcUrls: (string | undefined)[] = [];
    await new Promise<void>(resolve =>
      createRoot(async dispose => {
        const [src, setSrc] = createSignal("https://localhost:3000/script.js");
        const [script] = createScriptLoader({
          src: src,
          onload: () => setSrc("https://localhost:3000/script2.js")
        });
        actualSrcUrls.push(script?.src);
        await dispatchAndWait(script, "load");
        createEffect(() => {
          actualSrcUrls.push(script?.src);
          dispose();
          resolve();
        });
      })
    );
    expect(actualSrcUrls).toEqual([
      "https://localhost:3000/script.js",
      "https://localhost:3000/script2.js"
    ]);
  });

  it("will automatically remove the script tag on disposal", async () => {
    const script = createRoot(dispose => {
      const [script] = createScriptLoader({ src: "https://localhost:3000/script.js" });
      dispose();
      return script;
    });
    // need to wait a tick for the dispose to happen
    await Promise.resolve();
    expect(script).toBeInstanceOf(window.HTMLScriptElement);
    expect(script?.parentNode).not.toBe(document.head);
  });
});
