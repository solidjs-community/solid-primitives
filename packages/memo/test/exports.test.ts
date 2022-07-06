import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as API from "../src/index";
import * as noopAPI from "../src/server";

const test = suite("exports");

test("server have to exports match client exports", () => {
  (Object.keys(API) as (keyof typeof API)[]).forEach(name => {
    assert.is(typeof noopAPI[name], typeof API[name]);
  });
});

test.run();
