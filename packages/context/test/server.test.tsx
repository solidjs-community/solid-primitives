import { describe, test, expect } from "vitest";
import { createContext, FlowComponent, JSX, untrack, useContext } from "solid-js";
import { renderToString } from "solid-js/web";
import { ConsumeContext, createContextProvider, MultiProvider } from "../src/index.js";

type TestContextValue = {
  message: string;
  children: JSX.Element;
};

const TEST_MESSAGE = "Hello, Context!";
const FALLBACK: TestContextValue = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { children: JSX.Element }): TestContextValue => {
    return {
      message: TEST_MESSAGE,
      get children() {
        return props.children;
      },
    };
  },
  FALLBACK,
);

describe("MultiProvider", () => {
  test("provides multiple contexts", () => {
    const Ctx1 = createContext<string>();
    const Ctx2 = createContext<string>();

    let runs = 0;
    let capture1;
    let capture2;
    let capture3;

    const BoundProvider: FlowComponent = props => {
      expect(useContext(Ctx1)).toBe("Hello");
      expect(useContext(Ctx2)).toBe("World");
      return <TestProvider>{props.children}</TestProvider>;
    };

    renderToString(() => (
      <MultiProvider
        values={[[Ctx1, "Ignored"], [Ctx1, "Hello"], [Ctx2.Provider, "World"], BoundProvider]}
      >
        {untrack(() => {
          runs++;
          capture1 = useContext(Ctx1);
          capture2 = useContext(Ctx2);
          capture3 = useTestContext().message;
          return "";
        })}
      </MultiProvider>
    ));

    expect(runs).toBe(1);
    expect(capture1).toBe("Hello");
    expect(capture2).toBe("World");
    expect(capture3).toBe(TEST_MESSAGE);
  });
});

describe("ConsumeContext", () => {
  test("consumes a context via use-function", () => {
    const Ctx = createContext<string>("Hello");

    function useCtx() {
      return useContext(Ctx);
    }

    let capture;
    renderToString(() => {
      <Ctx.Provider value="World">
        <ConsumeContext useFn={useCtx}>
          {value => (
            capture = value
          )}
        </ConsumeContext>
      </Ctx.Provider>;
    });

    expect(capture).toBe("World");
  });

  test("consumes a context via context object", () => {
    const Ctx = createContext<string>("Hello");

    let capture;
    renderToString(() => {
      <Ctx.Provider value="World">
        <ConsumeContext context={Ctx}>
          {value => (
            capture = value
          )}
        </ConsumeContext>
      </Ctx.Provider>;
    });

    expect(capture).toBe("World");
  });
});
