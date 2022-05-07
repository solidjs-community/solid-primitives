import { suite } from "uvu";
import * as assert from "uvu/assert";

import { render } from "solid-js/web";

import { createSelection } from "../src/index";
import { createEffect, createRoot } from "solid-js";

const test = suite<{ container: HTMLElement; unmount: () => void }>("createSelection");

test.before.each(context => {
  context.container = document.createElement("div");
  document.body.appendChild(context.container);
  context.unmount = () => document.body.removeChild(context.container);
});

test.after.each(({ unmount }) => unmount());

const dispatchKeyupEvent = (node: HTMLElement | Document) =>
  new Promise<void>(resolve => {
    node.addEventListener("keyup", () => resolve(), { once: true });
    node.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: false }));
  });

test("reads selection from input", ({ container }) =>
  createRoot(async dispose => {
    const [selection] = createSelection();
    assert.equal(selection(), [null, NaN, NaN]);
    const unmount = render(() => <input type="text" value="testing" />, container);
    const input = container.querySelector("input") as HTMLInputElement;
    assert.instance(input, HTMLInputElement);
    input.focus();
    input.setSelectionRange(1, 3);
    // only wrapped in createEffect, we will subscribe to changes
    await createEffect(async () => {
      await dispatchKeyupEvent(input);
      assert.equal(selection(), [input, 1, 3]);
      unmount();
      dispose();
    });
  }));

test("writes selection to an input", ({ container }) =>
  createRoot(async dispose => {
    const [_selection, setSelection] = createSelection();
    const unmount = render(() => <input type="text" value="testing" />, container);
    const input = container.querySelector("input") as HTMLInputElement;
    assert.instance(input, HTMLInputElement);
    setSelection([input, 2, 5]);
    await createEffect(async () => {
      await dispatchKeyupEvent(input);
      assert.is(input.selectionStart, 2);
      assert.is(input.selectionEnd, 5);
      unmount();
      dispose();
    });
  }));

test("reads selection from textarea", ({ container }) =>
  createRoot(async dispose => {
    const [selection] = createSelection();
    assert.equal(selection(), [null, NaN, NaN]);
    const unmount = render(() => <textarea>testing</textarea>, container);
    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    assert.instance(textarea, HTMLTextAreaElement);
    textarea.focus();
    textarea.setSelectionRange(2, 5);
    // only wrapped in createEffect, we will subscribe to changes
    await createEffect(async () => {
      await dispatchKeyupEvent(textarea);
      assert.equal(selection(), [textarea, 2, 5]);
      unmount();
      dispose();
    });
  }));

test("writes selection to a textarea", ({ container }) =>
  createRoot(async dispose => {
    const [_selection, setSelection] = createSelection();
    const unmount = render(() => <textarea>testing</textarea>, container);
    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    assert.instance(textarea, HTMLTextAreaElement);
    setSelection([textarea, 2, 5]);
    await createEffect(async () => {
      await dispatchKeyupEvent(textarea);
      assert.is(textarea.selectionStart, 2);
      assert.is(textarea.selectionEnd, 5);
      unmount();
      dispose();
    });
  }));

test("reads selection from contentEditable div", ({ container }) =>
  createRoot(async dispose => {
    const [selection] = createSelection();
    assert.equal(selection(), [null, NaN, NaN]);
    const unmount = render(() => <div contenteditable>testing</div>, container);
    const div = container.querySelector("div") as HTMLDivElement;
    assert.instance(div, HTMLDivElement);
    div.focus();
    window
      .getSelection()
      ?.addRange(
        (range => (range.setStart(div.firstChild!, 0), range.setEnd(div.firstChild!, 6), range))(
          document.createRange()
        )
      );
    // only wrapped in createEffect, we will subscribe to changes
    await createEffect(async () => {
      await dispatchKeyupEvent(div);
      // might be delayed because of JSDOM
      if (selection()[0] !== null) {
        assert.equal(selection(), [div, 0, 6]);
        unmount();
        dispose();
      }
    });
  }));

test("writes selection to a contentEditable div", ({ container }) =>
  createRoot(async dispose => {
    const [selection, setSelection] = createSelection();
    const unmount = render(() => <div contenteditable>testing</div>, container);
    const div = container.querySelector("div") as HTMLDivElement;
    assert.instance(div, HTMLDivElement);
    setSelection([div, 2, 5]);
    await createEffect(async () => {
      await dispatchKeyupEvent(div);
      // might be delayed because of JSDOM
      if (selection()[0] !== null) {
        const range = window.getSelection()?.getRangeAt(0);
        assert.is(range?.startContainer, div);
        assert.is(range?.startOffset, 2);
        assert.is(range?.endOffset, 5);
        unmount();
        dispose();
      }
    });
  }));

test.run();
