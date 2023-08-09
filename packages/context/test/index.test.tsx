import { describe, test, expect } from "vitest";
import { createContext, createRoot, FlowComponent, JSX, untrack, useContext } from "solid-js";
import { render } from "solid-js/web";
import { createContextProvider, MultiProvider } from "../src/index.js";

const context = { message: "Hello, Context!" };
const fallback = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { text?: string; children: JSX.Element }) => {
    return {
      message: props.text ?? context.message,
      get children() {
        return props.children;
      },
    };
  },
  fallback,
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

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${context.message}</div>`);

    unmount();
    document.body.removeChild(container);
  });

  test("returns fallback if context is not provided", () => {
    let capture;
    const unmount = render(() => {
      const ctx = useTestContext();
      capture = ctx.message;
      return "";
    }, document.createElement("div"));
    expect(capture).toBe(fallback.message);
    unmount();
  });

  test("returns fallback if context is not provided", () => {
    let capture;
    let captureChildren;

    const TextComp = () => {
      const ctx = useTestContext();
      capture = ctx.message;
      captureChildren = ctx.children;
      return "";
    };

    const unmount = render(
      () => <TestProvider text="REPLACE">{TextComp}</TestProvider>,
      document.createElement("div"),
    );
    expect(capture).toBe("REPLACE");
    expect(captureChildren).toBe(TextComp);
    unmount();
  });
});

describe("MultiProvider", () => {
  test("provides multiple contexts", () => {
    createRoot(() => {
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
      </MultiProvider>;

      expect(runs).toBe(1);
      expect(capture1).toBe("Hello");
      expect(capture2).toBe("World");
      expect(capture3).toBe(context.message);
    });
  });
});
