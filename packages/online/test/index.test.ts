import { setOnline } from "./setup";
import { createOnline } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createOnline");

test("createPrimitiveTemplate return values", () =>
  createRoot(dispose => {
    const onLine = createOnline();
    assert.equal(onLine(), true);
    setOnline(false);
    assert.equal(onLine(), false);
    dispose();
  }));

test.run();
