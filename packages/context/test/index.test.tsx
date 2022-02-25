import { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createContextProvider } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const context = { message: "Hello, Context!" };
const fallback = { message: "FALLBACK", children: undefined };

const [TestProvider, useTestContext] = createContextProvider(
  (props: { text?: string; children: JSX.Element }) => {
    if (props.text) return { message: props.text, children: props.children };
    return {
      message: context.message,
      children: props.children
    };
  },
  fallback
);
const TestChild = () => <div>{useTestContext().message}</div>;

const test = suite<{ container: HTMLElement; unmount: () => void }>("createContextProvider");

test.before.each(context => {
  context.container = document.createElement("div");
  document.body.appendChild(context.container);
  context.unmount = render(
    () => (
      <TestProvider>
        <TestChild />
      </TestProvider>
    ),
    context.container
  );
});
test.after.each(({ container, unmount }) => {
  unmount();
  document.body.removeChild(container);
});

test("renders the context message", ({ container }) => {
  assert.is(container.innerHTML, `<div>${context.message}</div>`, "Not correctly rendered");
});

test.run();

const testFallback = suite("createContextProvider fallback");

testFallback("returns fallback if context is not provided", () => {
  let capture;
  const unmount = render(() => {
    const ctx = useTestContext();
    capture = ctx.message;
    return "";
  }, document.createElement("div"));
  assert.is(capture, fallback.message);
  unmount();
});

testFallback.run();

const testProps = suite("createContextProvider props");

testProps("returns fallback if context is not provided", () => {
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
    document.createElement("div")
  );
  assert.is(capture, "REPLACE");
  assert.is(captureChildren, TextComp);
  unmount();
});

testProps.run();
