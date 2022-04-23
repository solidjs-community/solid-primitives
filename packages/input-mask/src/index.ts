export type Selection = [start: number, end: number];

export type InputMaskFn = (
  value: string,
  selection: Selection
) => [value: string, selection: Selection];

export type InputMaskArray = (string | RegExp)[];

export type InputMask = InputMaskFn | InputMaskArray | string;

export const stringMaskRegExp: Record<string, RegExp> = {
  9: /\d/,
  a: /[a-z]/i,
  "*": /\w/
};

/** Convert a string mask to an array mask */
export const stringMaskToArray = (mask: string, regexps = stringMaskRegExp) => [...mask].map(c => regexps[c] || c);

/** Convert an array mask to a mask function */
export const maskArrayToFn =
  (maskArray: InputMaskArray): InputMaskFn =>
  (value: string, selection: Selection) => {
    let pos = 0;
    maskArray.forEach(maskItem => {
      if (value.length < pos + 1) {
        return;
      }
      if (typeof maskItem === "string") {
        const index = value.slice(pos).indexOf(maskItem);
        if (index !== 0) {
          value = value.slice(0, pos) + maskItem + value.slice(pos);
          selection[0] > pos && (selection[0] += maskItem.length);
          selection[1] > pos && (selection[1] += maskItem.length);
        }
        pos += maskItem.length;
      } else if (maskItem instanceof RegExp) {
        const match = value.slice(pos).match(maskItem);
        if (!match || match.index === undefined) {
          value = value.slice(0, pos);
          return;
        } else if (match.index > 0) {
          value = value.slice(0, pos) + value.slice(pos + match.index);
          pos -= match.index - 1;
          selection[0] > pos && (selection[0] -= match.index);
          selection[1] > pos && (selection[1] -= match.index);
        }
        pos += match[0].length;
      }
    });
    return [value.slice(0, pos), selection];
  };

/** Convert an array or string mask to a mask function */
export const anyMaskToFn = (mask: InputMask, regexps?: Record<string, RegExp>) =>
  typeof mask === "function"
    ? mask
    : maskArrayToFn(Array.isArray(mask) ? mask : stringMaskToArray(mask, regexps));

export interface EventLike {
  target: EventTarget | null;
  currentTarget: EventTarget | null;
}

/**
 * Create input mask handler
 * @param mask string or array or function mask
 * @param regexps optional object with regexps for string replacements used for string masks
 * @returns event handler to effectuate the input mask
 */
export const createInputMask = <
  MaskEvent extends EventLike = KeyboardEvent | InputEvent | ClipboardEvent
>(
  mask: InputMask,
  regexps?: Record<string, RegExp>
): ((ev: MaskEvent) => string) => {
  const maskFn = anyMaskToFn(mask, regexps);
  const handler = (ev: MaskEvent) => {
    const ref = (ev.currentTarget || ev.target) as HTMLInputElement | HTMLTextAreaElement;
    const [value, selection] = maskFn(ref.value, [
      ref.selectionStart || ref.value.length,
      ref.selectionEnd || ref.value.length
    ]);
    ref.value = value;
    ref.setSelectionRange(...selection);
    return value;
  };
  return handler;
};
