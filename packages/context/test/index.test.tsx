import { render } from "solid-js/web";
import { createContextProvider } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const context = { message: 'Hello, Context!' };

const [TestProvider, useTestContext] = createContextProvider(() => context)
const TestChild = () => <div>{useTestContext().message}</div>;

const test = suite<{ container: HTMLElement, unmount: () => void }>('createContextProvider');

test.before.each((context) => {
  context.container = document.createElement('div');
  document.body.appendChild(context.container);
  context.unmount = render(() => <TestProvider><TestChild /></TestProvider>, context.container)
});
test.after.each(({ container, unmount }) => {
  unmount();
  document.body.removeChild(container);
});

test('renders the context message', ({ container }) => {
  assert.is(container.innerHTML, `<div>${context.message}</div>`, 'Not correctly rendered');
});

test.run();
