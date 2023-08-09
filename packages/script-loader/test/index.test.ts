// @vitest-environment node
import { createRoot, createSignal } from "solid-js";
import { afterAll, describe, expect, it } from "vitest";
import { createScriptLoader } from "../src/index.js";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><title>.</title>", {
  resources: "usable",
  runScripts: "dangerously",
  url: "http://localhost:3000",
});
const g = globalThis as any;
g.window = dom.window;
g.document = window.document;
g.Event = dom.window.Event;
g.EventTarget = dom.window.EventTarget;

const dispatchAndWait = (script?: HTMLScriptElement, name: "load" | "error" = "load") =>
  new Promise<void>(resolve => {
    script?.addEventListener(name, () => {
      resolve();
    });
    script?.dispatchEvent(new Event(name));
  });

describe("createScriptLoader", () => {
  const http = require("node:http");
  const server = http
    .createServer(
      (
        _: unknown,
        res: NodeJS.WritableStream & {
          writeHead: (status: number, header: Record<string, string>) => void;
        },
      ) => {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write("scriptLoaderTest = true");
        res.end();
      },
    )
    .listen(12345, "127.0.0.1");

  afterAll(() => server.close());

  it("will create a script tag with src", () =>
    createRoot(dispose => {
      createScriptLoader({ src: "http://127.0.0.1:12345/script.js" });
      const script = document.querySelector('script[src="http://127.0.0.1:12345/script.js"]');
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
        src: "http://127.0.0.1:12345/script.js",
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
        src: "http://127.0.0.1:12345/script.js",
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
        const [src, setSrc] = createSignal("http://127.0.0.1:12345/script.js");
        const script = createScriptLoader({
          src: src,
          onLoad: () => setSrc("http://127.0.0.1:12345/script2.js"),
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
      "http://127.0.0.1:12345/script.js",
      "http://127.0.0.1:12345/script2.js",
    ]);
  });

  it("will automatically remove the script tag on disposal", async () => {
    const script = createRoot(dispose => {
      const script = createScriptLoader({ src: "http://127.0.0.1:12345/script.js" });
      dispose();
      return script;
    });
    // need to wait a tick for the dispose to happen
    await Promise.resolve();
    expect(script).toBeInstanceOf(window.HTMLScriptElement);
    expect(script?.parentNode).not.toBe(document.head);
  });

  it("will actually load a script", () =>
    new Promise<void>((resolve, reject) => {
      createRoot(dispose => {
        const teardown = () => {
          try {
            expect((window as any).scriptLoaderTest).toBe(true);
          } catch (e) {
            reject(e);
          }
          server.closeAllConnections();
          server.close();
          dispose();
          resolve();
        };
        const timeout = setTimeout(teardown, 1000);
        const s = createScriptLoader({
          src: "http://127.0.0.1:12345",
        });
        s?.addEventListener("load", () => {
          clearTimeout(timeout);
          teardown();
        });
      });
    }));
});
