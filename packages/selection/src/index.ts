import { isArrayExpression } from "@babel/types";
import { Accessor, createEffect, createSignal, onCleanup, onMount, Setter } from "solid-js";

export type InputSelection = {
  start: number;
  end: number;
};

export const createInputSelection = (
  ref?: HTMLInputElement | HTMLTextAreaElement
): [selection: Accessor<InputSelection>, setSelection: Setter<InputSelection>] => {
  const [selection, setSelection] = createSignal({
    start: ref?.selectionStart ?? -1,
    end: ref?.selectionEnd ?? -1
  });
  
  onMount(() => {
    const listener = () => {
      setSelection((last) => {
        const start = ref?.selectionStart ?? -1,
          end = ref?.selectionEnd ?? -1;
        return (last.start === start && last.end === end) 
          ? last
          : { start, end };
      });
    }
    ref?.addEventListener('selectionchange', listener);
    onCleanup(() => ref?.removeEventListener('selectionChange', listener));
  });

  return [selection, (sel) => {
    const next = setSelection(sel)
    ref?.setSelectionRange(next.start, next.end);
    return next;
  }];
};

export type InputMaskFunc = ((value: string, sel: InputSelection) =>
  [maskedValue: string, sel: InputSelection]);
export type InputMask = (string | RegExp)[] | InputMaskFunc;

const alignSelectionToRemovedPart = (selection: InputSelection, start: number, length: number): InputSelection => {
  if (selection.start > start) {
    if (selection.start > start + length) {
      selection.start -= length
    } else {
      selection.start = start;
    }
  }
  if (selection.end > start) {
    if (selection.end > start + length) {
      selection.end -= length
    } else {
      selection.end = start;
    }
  }
  return selection;
}

const inputMaskArrayToFunc = (def: InputMask): InputMaskFunc => {  
  if (Array.isArray(def)) {
    return (value, selection) => {
      if (value) {
        let index = 0;
        def.forEach((part, id) => {
          // fixed part; add if not already in string and jump to next part
          if (typeof part === 'string') {
            if (value.substr(index, part.length) !== part) {
              value = `${value.slice(0, index)}${part}${value.slice(index)}`;
            }
            index += part.length;
          // regex part; delete before match and jump after match
          } else {
            const match = value.slice(index).match(part);
            const matchIndex = match?.index ?? -1;
            if (match && (matchIndex >= 0)) {
              // remove characters padding the match
              if (matchIndex > 0) {
                value = `${value.slice(0, index)}${value.slice(matchIndex)}}`;
                alignSelectionToRemovedPart(selection, index, matchIndex);
              }
              index += match[0].length;
              // cut additional characters after the last part
              const isLastPart = id === def.length - 1;
              if (isLastPart && value.length > index) {
                value = value.slice(0, index)
              }
            }
          }
        });
      }      
      return [value, selection];
    }
  }
  return def
}

export const createInputMask = (ref?: HTMLInputElement, mask?: InputMask) => {
  if (!mask) {
    return;
  }
  const [selection, setSelection] = createInputSelection(ref);
  const inputMask = inputMaskArrayToFunc(mask);
 
  onMount(() => {
    const handler = () => {
      if (ref) {
        const [newValue, newSelection] = inputMask(ref.value, selection());
        ref.value = newValue;
        setSelection(newSelection);
      }
    };
    ref?.addEventListener('input', handler);
    onCleanup(() => ref?.removeEventListener('input', handler));
  });
}

