import * as assert from "uvu/assert";
import { suite } from "uvu";
import { createRoot } from "solid-js";
import { createPageVisibility } from "../src";

const test = suite("createPageVisibility");

test("observes visibilitychange events", () =>
  createRoot(dispose => {
    let doc_visibility = "prerender";
    Object.defineProperty(document, "visibilityState", {
      get() {
        return doc_visibility;
      }
    });

    const visibility = createPageVisibility();
    assert.is(visibility(), false, "jsdom defaults to false");

    doc_visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    assert.is(visibility(), true);

    doc_visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    assert.is(visibility(), false);

    dispose();

    doc_visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    assert.is(visibility(), false, "doesn't listen after dispose");
  }));

test.run();
