import { describe, expect, it } from "vitest";

import { render } from "solid-js/web";

import { createSelection } from "../src/index.js";
import { createEffect, createRoot, type JSX } from "solid-js";

describe("createSelection", () => {
  const renderTest = (component: () => JSX.Element) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const unmount = render(component, container);
    return {
      container,
      unmount: () => {
        unmount();
        document.body.removeChild(container);
      },
    };
  };

  const dispatchKeyupEvent = (node: HTMLElement | Document) =>
    new Promise<void>(resolve => {
      node.addEventListener("keyup", () => resolve(), { once: true });
      node.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: false }));
    });

  it("reads selection from input", () =>
    createRoot(async dispose => {
      const [selection] = createSelection();
      expect(selection()).toEqual([null, NaN, NaN]);
      const { container, unmount } = renderTest(() => <input type="text" value="testing" />);
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input).toBeInstanceOf(HTMLInputElement);
      input.focus();
      input.setSelectionRange(1, 3);
      // only wrapped in createEffect, we will subscribe to changes
      await createEffect(async () => {
        await dispatchKeyupEvent(input);
        expect(selection()).toEqual([input, 1, 3]);
        unmount();
        dispose();
      });
    }));

  it("writes selection to an input", () =>
    createRoot(async dispose => {
      const [_selection, setSelection] = createSelection();
      const { container, unmount } = renderTest(() => <input type="text" value="testing" />);
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input).toBeInstanceOf(HTMLInputElement);
      setSelection([input, 2, 5]);
      await createEffect(async () => {
        await dispatchKeyupEvent(input);
        expect(input.selectionStart).toBe(2);
        expect(input.selectionEnd).toBe(5);
        unmount();
        dispose();
      });
    }));

  it("reads selection from textarea", () =>
    createRoot(async dispose => {
      const [selection] = createSelection();
      expect(selection()).toEqual([null, NaN, NaN]);
      const { container, unmount } = renderTest(() => <textarea>testing</textarea>);
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
      textarea.focus();
      textarea.setSelectionRange(2, 5);
      // only wrapped in createEffect, we will subscribe to changes
      await createEffect(async () => {
        await dispatchKeyupEvent(textarea);
        expect(selection()).toEqual([textarea, 2, 5]);
        unmount();
        dispose();
      });
    }));

  it("writes selection to a textarea", () =>
    createRoot(async dispose => {
      const [_selection, setSelection] = createSelection();
      const { container, unmount } = renderTest(() => <textarea>testing</textarea>);
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
      setSelection([textarea, 2, 5]);
      await createEffect(async () => {
        await dispatchKeyupEvent(textarea);
        expect(textarea.selectionStart).toBe(2);
        expect(textarea.selectionEnd).toBe(5);
        unmount();
        dispose();
      });
    }));

  it("reads selection from contentEditable div", () =>
    createRoot(async dispose => {
      const [selection] = createSelection();
      expect(selection()).toEqual([null, NaN, NaN]);
      const { container, unmount } = renderTest(() => <div contenteditable>testing</div>);
      const div = container.querySelector("div") as HTMLDivElement;
      expect(div).toBeInstanceOf(HTMLDivElement);
      div.focus();
      window
        .getSelection()
        ?.addRange(
          (range => (range.setStart(div.firstChild!, 0), range.setEnd(div.firstChild!, 6), range))(
            document.createRange(),
          ),
        );
      // only wrapped in createEffect, we will subscribe to changes
      await createEffect(async () => {
        await dispatchKeyupEvent(div);
        // might be delayed because of JSDOM
        if (selection()[0] !== null) {
          expect(selection()).toEqual([div, 0, 6]);
          unmount();
          dispose();
        }
      });
    }));

  it("writes selection to a contentEditable div", () =>
    createRoot(async dispose => {
      const [selection, setSelection] = createSelection();
      const { container, unmount } = renderTest(() => <div contenteditable>testing</div>);
      const div = container.querySelector("div") as HTMLDivElement;
      expect(div).toBeInstanceOf(HTMLDivElement);
      setSelection([div, 2, 5]);
      await createEffect(async () => {
        await dispatchKeyupEvent(div);
        // might be delayed because of JSDOM
        if (selection()[0] !== null) {
          const range = window.getSelection()?.getRangeAt(0);
          expect(range?.startContainer).toBe(div);
          expect(range?.startOffset).toBe(2);
          expect(range?.endOffset).toBe(5);
          unmount();
          dispose();
        }
      });
    }));
});
