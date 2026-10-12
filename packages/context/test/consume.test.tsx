import { describe, test, expect } from "vitest";
import { createContext, createRoot } from "solid-js";
import { ConsumeContext } from "../src/index";

describe("ConsumeContext", () => {
  test("consumes single context", () => {
    const Ctx = createContext<string>("default");

    createRoot(dispose => {
      let captured = "";
      <Ctx.Provider value="hello">
        <ConsumeContext use={Ctx}>
          {val => {
            captured = val;
            return <div>{val}</div>;
          }}
        </ConsumeContext>
      </Ctx.Provider>;

      expect(captured).toBe("hello");
      dispose();
    });
  });
});
