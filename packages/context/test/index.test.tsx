import { describe, test, expect } from "vitest";
import {
  createContext,
  type FlowComponent,
  type Element,
  untrack,
  useContext,
} from "solid-js";
import { render } from "@solidjs/web";
import { createContextProvider, MultiProvider } from "../src/index.js";

type TestContextValue = {
  message: string;
  children: Element;
};

const TEST_MESSAGE = "Hello, Context!";
const FALLBACK: TestContextValue = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { text?: string; children: Element }): TestContextValue => {
    return {
      message: props.text ?? TEST_MESSAGE,
      get children() {
        return props.children;
      },
    };
  },
  FALLBACK,
);
const TestChild = () => <div>{useTestContext().message}</div>;

describe("createContextProvider", () => {
  test("renders the context message", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const unmount = render(
      () => (
        <TestProvider>
          <TestChild />
        </TestProvider>
      ),
      container,
    );

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${TEST_MESSAGE}</div>`);

    unmount();
    document.body.removeChild(container);
  });

  test("returns fallback if context is not provided", () => {
    let ctx!: TestContextValue;
    const unmount = render(() => {
      ctx = useTestContext();
      return "";
    }, document.createElement("div"));
    expect(ctx.message).toBe(FALLBACK.message);
    unmount();
  });

  test("returns fallback if context is not provided", () => {
    let ctx!: TestContextValue;

    const TextComp = () => {
      ctx = useTestContext();
      return "";
    };

    const unmount = render(
      () => <TestProvider text="REPLACE">{TextComp as any}</TestProvider>,
      document.createElement("div"),
    );
    expect(ctx.message).toBe("REPLACE");
    expect(ctx.children).toBe(TextComp);
    unmount();
  });
});

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

    const container = document.createElement("div");
    const unmount = render(
      () => (
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
      ),
      container,
    );

    expect(runs).toBe(1);
    expect(capture1).toBe("Hello");
    expect(capture2).toBe("World");
    expect(capture3).toBe(TEST_MESSAGE);

    unmount();
  });
});
