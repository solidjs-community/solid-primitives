import { suite } from "uvu";
import * as assert from "uvu/assert";

import { render } from "solid-js/web";

import { createInputMask } from "../src/index";

const test = suite<{ container: HTMLElement; unmount: () => void }>("createInputMask");

test.before.each(context => {
  context.container = document.createElement("div");
  document.body.appendChild(context.container);
  context.unmount = () => document.body.removeChild(context.container);
});

test.after.each(({ unmount }) => unmount());

const dispatchInputEvent = (node: HTMLElement) =>
  new Promise<void>(resolve => {
    node.addEventListener("input", () => resolve(), { once: true });
    node.dispatchEvent(new Event("input", { bubbles: true, cancelable: false }));
  });

test("adds placeholder (e.g. to an iso date)", async ({ container }) => {
  const unmount = render(() => <input onInput={createInputMask("9999-99-99")} />, container);
  const input = container.querySelector("input") as HTMLInputElement;
  input.value = "11111";
  await dispatchInputEvent(input);
  assert.is(input.value, "1111-1");
  input.value = "1111-11";
  await dispatchInputEvent(input);
  assert.is(input.value, "1111-11");
  input.value = "1111-111";
  await dispatchInputEvent(input);
  assert.is(input.value, "1111-11-1");
  input.value = "1111-11-11";
  await dispatchInputEvent(input);
  assert.is(input.value, "1111-11-11");
  input.value = "1111-11-111";
  await dispatchInputEvent(input);
  assert.is(input.value, "1111-11-11");
  unmount();
});

test("removes wrongful input (e.g. from iso-date)", async ({ container }) => {
  const unmount = render(() => <input onInput={createInputMask("9999-99-99")} />, container);
  const input = container.querySelector("input") as HTMLInputElement;
  input.value = "a";
  await dispatchInputEvent(input);
  assert.is(input.value, "");
  input.value = "-";
  await dispatchInputEvent(input);
  assert.is(input.value, "");
  unmount();
});

test("works with regex mask", async ({ container }) => {
  const unmount = render(
    () => (
      <input
        onInput={createInputMask([
          /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
          () => ""
        ])}
      />
    ),
    container
  );
  const input = container.querySelector("input") as HTMLInputElement;
  input.value = "https://meet.goto.com/test";
  await dispatchInputEvent(input);
  assert.is(input.value, "test");
  unmount();
});
