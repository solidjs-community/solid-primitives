import { test } from "uvu";
import * as assert from "uvu/assert";

import { createEffect, createRoot, createSignal } from "solid-js";

import { createScriptLoader } from "../src";

const dispatchAndWait = (script: HTMLScriptElement, name: "load" | "error") =>
  new Promise<void>(resolve => {
    script.addEventListener(name, () => {
      resolve();
    });
    script.dispatchEvent(new Event(name));
  });

test("will create a script tag with src", () =>
  createRoot(dispose => {
    const [_, remove] = createRoot(() =>
      createScriptLoader({ src: "https://localhost:3000/script.js" })
    );
    const script = document.querySelector('script[src="https://localhost:3000/script.js"]');
    assert.instance(script, window.HTMLScriptElement);
    remove();
  }));

test("will create a script tag with textContent", () =>
  createRoot(dispose => {
    const src = "!(function(){ window.test = true; })();";
    const [script, remove] = createRoot(() => createScriptLoader({ src }));
    assert.instance(script, window.HTMLScriptElement);
    assert.is(script.textContent, src);
    remove();
  }));

test("will call the onload handler", async () => {
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
  assert.is(loadCalled, true);
  remove();
});

test("will call the onerror handler", async () => {
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
  assert.is(errorCalled, true);
  remove();
});

test("will update the url from an accessor", async () => {
  const actualSrcUrls = [];
  await new Promise<void>(resolve =>
    createRoot(async dispose => {
      const [src, setSrc] = createSignal("https://localhost:3000/script.js");
      const [script] = createScriptLoader({
        src: src,
        onload: () => setSrc("https://localhost:3000/script2.js")
      });
      actualSrcUrls.push(script.src);
      await dispatchAndWait(script, "load");
      createEffect(() => {
        actualSrcUrls.push(script.src);
        dispose();
        resolve();
      });
    })
  );
  assert.equal(actualSrcUrls, [
    "https://localhost:3000/script.js",
    "https://localhost:3000/script2.js"
  ]);
});

test("will automatically remove the script tag on disposal", async () => {
  const script = createRoot(dispose => {
    const [script] = createScriptLoader({ src: "https://localhost:3000/script.js" });
    dispose();
    return script;
  });
  // need to wait a tick for the dispose to happen
  await Promise.resolve();
  assert.instance(script, window.HTMLScriptElement, "error when creating script");
  assert.ok(script.parentNode !== document.head, "error when removing script");
});

test.run();
