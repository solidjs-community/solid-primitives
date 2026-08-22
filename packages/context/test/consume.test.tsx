import { describe, test, expect } from "vitest";
import { createContext, createRoot } from "solid-js";
import { ConsumeContext, createContextConsumer } from "../src/index";

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

  test("consumes multiple contexts simultaneously", () => {
    const CtxA = createContext<string>("A");
    const CtxB = createContext<number>(42);

    createRoot(dispose => {
      let capturedA = "";
      let capturedB = 0;

      <CtxA.Provider value="Alpha">
        <CtxB.Provider value={100}>
          <ConsumeContext use={[CtxA, CtxB]}>
            {([a, b]) => {
              capturedA = a;
              capturedB = b;
              return <div>{a} {b}</div>;
            }}
          </ConsumeContext>
        </CtxB.Provider>
      </CtxA.Provider>;

      expect(capturedA).toBe("Alpha");
      expect(capturedB).toBe(100);
      dispose();
    });
  });
});
