import { describe, test, expect } from "vitest";
import {
  createContext,
  type FlowComponent,
  type Element,
  untrack,
  useContext,
} from "solid-js";
import { render } from "@solidjs/web";
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

  test("accepts a debug name without affecting behavior", () => {
    const [NamedProvider, useNamed] = createContextProvider(() => ({ value: 1 }), { value: 0 }, {
      name: "Named",
    });
    let captured = -1;
    const unmount = render(() => {
      captured = useNamed().value;
      return "";
    }, document.createElement("div"));
    expect(captured).toBe(0);
    unmount();

    const unmount2 = render(
      () => <NamedProvider>{untrack(() => { captured = useNamed().value; return ""; })}</NamedProvider>,
      document.createElement("div"),
    );
    expect(captured).toBe(1);
    unmount2();
  });
});

describe("createStrictContextProvider", () => {
  test("provides context value to descendants", () => {
    const [StrictProvider, useStrict] = createStrictContextProvider(
      (props: { value: number }) => ({ value: props.value }),
    );

    let captured = -1;
    const container = document.createElement("div");
    const unmount = render(
      () => (
        <StrictProvider value={42}>
          {untrack(() => {
            captured = useStrict().value;
            return "";
          })}
        </StrictProvider>
      ),
      container,
    );
    expect(captured).toBe(42);
    unmount();
  });

  test("accepts a debug name", () => {
    const [StrictProvider, useStrict] = createStrictContextProvider(() => ({ ok: true }), {
      name: "Strict",
    });
    let captured = false;
    const unmount = render(
      () => (
        <StrictProvider>
          {untrack(() => {
            captured = useStrict().ok;
            return "";
          })}
        </StrictProvider>
      ),
      document.createElement("div"),
    );
    expect(captured).toBe(true);
    unmount();
  });

  test("throws ContextNotFoundError when used outside a provider", () => {
    const [, useStrict] = createStrictContextProvider(() => ({ value: 1 }));
    expect(() => {
      render(() => {
        useStrict();
        return "";
      }, document.createElement("div"));
    }).toThrow();
  });
});

describe("createLayeredContext", () => {
  test("factory receives defaults as parent at the root level", () => {
    const [LayeredProvider, useLayered] = createLayeredContext(
      (props: { extra?: number }, parent) => ({ ...parent, extra: props.extra ?? parent.extra }),
      { base: "root", extra: 0 },
    );

    let captured: { base: string; extra: number } | undefined;
    const unmount = render(
      () => (
        <LayeredProvider extra={7}>
          {untrack(() => {
            captured = useLayered();
            return "";
          })}
        </LayeredProvider>
      ),
      document.createElement("div"),
    );
    expect(captured?.base).toBe("root");
    expect(captured?.extra).toBe(7);
    unmount();
  });

  test("nested providers extend the parent context value", () => {
    const [LayeredProvider, useLayered] = createLayeredContext(
      (props: { level?: number; tag?: string }, parent) => ({
        ...parent,
        level: props.level ?? parent.level,
        tag: props.tag ?? parent.tag,
      }),
      { level: 0, tag: "default" },
    );

    let capturedInner: { level: number; tag: string } | undefined;
    let capturedOuter: { level: number; tag: string } | undefined;

    const unmount = render(
      () => (
        <LayeredProvider level={1} tag="outer">
          {untrack(() => {
            capturedOuter = useLayered();
          }) as any}
          <LayeredProvider level={2}>
            {untrack(() => {
              capturedInner = useLayered();
              return "";
            })}
          </LayeredProvider>
        </LayeredProvider>
      ),
      document.createElement("div"),
    );

    expect(capturedOuter?.level).toBe(1);
    expect(capturedOuter?.tag).toBe("outer");
    expect(capturedInner?.level).toBe(2);
    expect(capturedInner?.tag).toBe("outer"); // inherited from outer provider
    unmount();
  });

  test("returns defaults when used outside any provider", () => {
    const [, useLayered] = createLayeredContext(
      (_props, parent) => parent,
      { value: 99 },
    );
    let captured = -1;
    const unmount = render(() => {
      captured = useLayered().value;
      return "";
    }, document.createElement("div"));
    expect(captured).toBe(99);
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
