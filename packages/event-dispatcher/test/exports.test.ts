import { test, expect } from "vitest";
import * as API from "../src";
import * as Server from "../src/server";

test("exports match between server and index", () => {
  (Object.keys(API) as (keyof typeof API)[]).forEach(key => {
    expect(typeof API[key]).toBe(typeof Server[key]);
  });
});
