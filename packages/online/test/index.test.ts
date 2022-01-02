import { setOnline } from "./setup";
import { createConnectivity } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createOnline");

test("createPrimitiveTemplate return values", () =>
  createRoot(dispose => {
    const onLine = createConnectivity();
    assert.equal(onLine(), true);
    setOnline(false);
    assert.equal(onLine(), false);
    dispose();
  }));

test.run();
