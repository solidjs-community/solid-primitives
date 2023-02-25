import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
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
      createScriptLoader({ src: "https://localhost:3000/script.js" });
      const script = document.querySelector('script[src="https://localhost:3000/script.js"]');
      expect(script).toBeInstanceOf(window.HTMLScriptElement);
      dispose();
    }));

  it("will create a script tag with textContent", () =>
    createRoot(dispose => {
      const src = "!(function(){ window.test = true; })();";
      const script = createRoot(() => createScriptLoader({ src }));
      expect(script).toBeInstanceOf(window.HTMLScriptElement);
      expect(script?.textContent).toBe(src);
      dispose();
    }));

  it("will call the onload handler", async () => {
    createRoot(dispose => {
      let loadCalled = false;
      const script = createScriptLoader({
        src: "https://localhost:3000/script.js",
        onLoad: () => {
          loadCalled = true;
        },
      });
      dispatchAndWait(script, "load");
      expect(loadCalled).toBe(true);
      dispose();
    });
  });

  it("will call the onerror handler", async () => {
    createRoot(dispose => {
      let errorCalled = false;
      const script = createScriptLoader({
        src: "https://localhost:3000/script.js",
        onError: () => {
          errorCalled = true;
        },
      });
      dispatchAndWait(script, "error");
      expect(errorCalled).toBe(true);
      dispose();
    });
  });

  it("will update the url from an accessor", async () => {
    const actualSrcUrls: (string | undefined)[] = [];
    await new Promise<void>(resolve =>
      createRoot(async dispose => {
        const [src, setSrc] = createSignal("https://localhost:3000/script.js");
        const script = createScriptLoader({
          src: src,
          onLoad: () => setSrc("https://localhost:3000/script2.js"),
        });
        actualSrcUrls.push(script?.src);
        await dispatchAndWait(script, "load");
        queueMicrotask(() => {
          actualSrcUrls.push(script?.src);
          dispose();
          resolve();
        });
      }),
    );
    expect(actualSrcUrls).toEqual([
      "https://localhost:3000/script.js",
      "https://localhost:3000/script2.js",
    ]);
  });

  it("will automatically remove the script tag on disposal", async () => {
    const script = createRoot(dispose => {
      const script = createScriptLoader({ src: "https://localhost:3000/script.js" });
      dispose();
      return script;
    });
    // need to wait a tick for the dispose to happen
    await Promise.resolve();
    expect(script).toBeInstanceOf(window.HTMLScriptElement);
    expect(script?.parentNode).not.toBe(document.head);
  });
});
