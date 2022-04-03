export type Selection = [start: number, end: number];

export type InputMaskFn = (
  value: string,
  selection: Selection
) => [value: string, selection: Selection];

export type InputMaskArray = (string | RegExp)[];

export type InputMask = InputMaskFn | InputMaskArray | string;

export const stringMaskToArray = (mask: string) =>
  [...mask].map(
    c =>
      ({
        9: /\d/,
        a: /[a-z]/i,
        "*": /\w/
      }[c] || c)
  );

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

export const anyMaskToFn = (mask: InputMask) =>
  typeof mask === "function"
    ? mask
    : maskArrayToFn(Array.isArray(mask) ? mask : stringMaskToArray(mask));

export const createInputMask = (mask: InputMask) => {
  const maskFn = anyMaskToFn(mask);
  const handler = (ev: KeyboardEvent | InputEvent | ClipboardEvent) => {
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
