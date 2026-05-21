import { describe, test, expect } from "vitest";
import { createContext, type FlowComponent, type Element, untrack, useContext } from "solid-js";
import { renderToString } from "@solidjs/web";
import {
  createContextProvider,
  createStrictContextProvider,
  createLayeredContext,
  MultiProvider,
} from "../src/index.js";

type TestContextValue = {
  message: string;
  children: Element;
};

const TEST_MESSAGE = "Hello, Context!";
const FALLBACK: TestContextValue = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { children: Element }): TestContextValue => {
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
        values={[[Ctx1, "Ignored"], [Ctx1, "Hello"], [Ctx2, "World"], BoundProvider]}
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

describe("createStrictContextProvider (SSR)", () => {
  test("provides context value to descendants", () => {
    const [StrictProvider, useStrict] = createStrictContextProvider(
      () => ({ greeting: "hello from server" }),
    );
    let captured = "";
    renderToString(() => (
      <StrictProvider>
        {untrack(() => {
          captured = useStrict().greeting;
          return captured;
        })}
      </StrictProvider>
    ));
    expect(captured).toBe("hello from server");
  });
});

describe("createLayeredContext (SSR)", () => {
  test("nested providers extend parent value", () => {
    const [LayeredProvider, useLayered] = createLayeredContext(
      (props: { level?: number }, parent) => ({
        ...parent,
        level: props.level ?? parent.level,
      }),
      { level: 0, base: "ssr" },
    );

    let capturedInner: { level: number; base: string } | undefined;
    renderToString(() => (
      <LayeredProvider level={1}>
        <LayeredProvider level={2}>
          {untrack(() => {
            capturedInner = useLayered();
            return "";
          })}
        </LayeredProvider>
      </LayeredProvider>
    ));

    expect(capturedInner?.level).toBe(2);
    expect(capturedInner?.base).toBe("ssr");
  });
});
