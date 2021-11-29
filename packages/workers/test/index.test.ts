// import { createRoot } from "solid-js";
import createPrimitiveTemplate from "../src/index";

describe("createPrimitiveTemplate", () => {
  test("set the getter and teseter", async () => {
    const [value, setValue] = createPrimitiveTemplate(true);
    expect(value()).toBe(true);
    setValue(false);
    expect(value()).toBe(false);
  });
});
