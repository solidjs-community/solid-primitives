import { test } from "uvu";
import * as assert from "uvu/assert";
import * as API from "../src";
import * as Server from "../src/server";

test("exports match between server and index", () => {
  (Object.keys(API) as (keyof typeof API)[]).forEach(key => {
    assert.is(
      typeof API[key],
      typeof Server[key],
      `API.${key} is not the same type as Server.${key}`
    );
  });
});
