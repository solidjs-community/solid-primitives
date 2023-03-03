import { describe, test, expect } from "vitest";
import { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createContextProvider } from "../src";

const context = { message: "Hello, Context!" };
const fallback = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { text?: string; children: JSX.Element }) => {
    if (props.text) return { message: props.text, children: props.children };
    return {
      message: context.message,
      children: props.children,
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
