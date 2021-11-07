import { createRoot } from "solid-js";
import { createI18nContext } from "../src/index";
import { dict } from "./setup";

describe("createI18nContext", () => {
  test("test locale switching", async () => {
    const result = createRoot(() => createI18nContext(dict, "en"));
    console.log(result);
    // expect(locale()).toBe('en');
  });
});
