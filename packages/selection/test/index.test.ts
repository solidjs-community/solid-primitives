import { createEffect, createRoot } from "solid-js";
import { createInputSelection } from "../src";

describe("createInputSelection", () => {
  const selections = (window as any)._selections;
  const getInput = document.createElement('input');
  getInput.type = 'text';
  getInput.value = 'longer value to allow selection';
  selections.set(getInput, { start: 5, end: 5 });
  document.body.appendChild(getInput);

  test("reads selection range", () =>
    createRoot(dispose => {
      const [selection] = createInputSelection(getInput);
      expect(selection()).toEqual({ start: 5, end: 5 });
      dispose();
    }));

  const setInput = document.createElement('input');
  setInput.type = 'text';
  setInput.value = 'another longer value to allow selection';
  document.body.appendChild(setInput);

  test("sets selection range", () =>
    createRoot(dispose => {
      const [_, setSelection] = createInputSelection(setInput);
      setSelection({ start: 7, end: 7 });
      expect(selections.get(setInput)).toEqual({ start: 7, end: 7 });
      dispose();
    }));

  const evInput = document.createElement('input');
  evInput.type = 'text';
  evInput.value = 'and another even longer value to allow selection';
  selections.set(evInput, { start: 0, end: 0 });
  document.body.appendChild(evInput);

  test("updates the selection on selectionupdate event", () => new Promise<void>(resolve => createRoot(dispose => {
    const [selection] = createInputSelection(evInput);
    const expectedSelections = [{ start: 0, end: 0 }, { start: 1, end: 1 }];
    createEffect(() => {
      expect(selection()).toEqual(expectedSelections.shift());
      if (expectedSelections.length === 1) {
        selections.set(evInput, { start: 1, end: 1 });
        evInput.dispatchEvent(new Event('selectionchange'));
      } else if (expectedSelections.length === 0) {
        dispose();
        resolve();
      }
    })
  })));
});
