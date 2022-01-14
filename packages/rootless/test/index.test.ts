import {  } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createPrimitiveTemplate");

test("createPrimitiveTemplate return values", () =>
  createRoot(dispose => {}));

test.run();
