export type Selection = [start: number, end: number];

export type InputMaskFn = (
  value: string,
  selection: Selection,
) => [value: string, selection: Selection];

export type InputMaskArray = (string | RegExp)[];

export type ReplaceArgs = [substring: string, ...args: any[]];

export type InputMaskRegex = [regex: RegExp, replacer: (...args: ReplaceArgs) => string];

export type InputMask = InputMaskFn | InputMaskArray | InputMaskRegex | string;

export const stringMaskRegExp: Record<string, RegExp> = {
  9: /\d/,
  0: /\d?/,
  a: /[a-z]/i,
  o: /[a-z]?/i,
  "*": /\w/,
  "?": /\w?/,
};

/** Convert a string mask to an array mask */
export const stringMaskToArray = (mask: string, regexps = stringMaskRegExp) =>
  [...mask].map(c => regexps[c] || c);

/** Convert a regex mask to a mask function */
export const regexMaskToFn =
  (regex: RegExp, replacer: (...args: ReplaceArgs) => string): InputMaskFn =>
  (value: string, selection: Selection) => [
    value.replace(regex, (...args) => {
      const replacement = replacer(...args);
      const index = args[args.length - 2];
      selection[0] +=
        index < selection[0]
          ? 0
          : ((replacement.length - args[0].length) / args[0].length) *
            Math.max(selection[0] - index, args[0].length);
      selection[1] +=
        index < selection[1]
          ? 0
          : ((replacement.length - args[0].length) / args[0].length) *
            Math.max(selection[1] - index, args[0].length);
      return replacement;
    }),
    selection,
  ];

/** Convert an array mask to a mask function */
export const maskArrayToFn =
  (maskArray: InputMaskArray): InputMaskFn =>
  (value: string, selection: Selection) => {
    let pos = 0;
    maskArray.forEach(maskItem => {
      if (value.length >= pos + 1) {
        if (typeof maskItem === "string") {
          const index = value.slice(pos).indexOf(maskItem);
          if (index !== 0) {
            value = value.slice(0, pos) + maskItem + value.slice(pos);
            selection[0] += ((selection[0] > pos) as unknown as number) * maskItem.length;
            selection[1] += ((selection[1] > pos) as unknown as number) * maskItem.length;
          }
          pos += maskItem.length;
          return;
        }
        const match = value.slice(pos).match(maskItem);
        if (!match || match.index === undefined) {
          value = value.slice(0, pos);
          return;
        } else if (match.index > 0) {
          value = value.slice(0, pos) + value.slice(pos + match.index);
          pos -= match.index - 1;
          selection[0] -= ((selection[0] > pos) as unknown as number) * match.index;
          selection[1] -= ((selection[1] > pos) as unknown as number) * match.index;
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
    : typeof mask[1] === "function" && mask[0] instanceof RegExp
    ? regexMaskToFn(mask[0], mask[1])
    : maskArrayToFn(
        Array.isArray(mask) ? (mask as InputMaskArray) : stringMaskToArray(mask, regexps),
      );

export interface EventLike {
  target: EventTarget | null;
  currentTarget: EventTarget | null;
}

/**
 * Create input mask handler
 * ```tsx
 * <input onInput={createInputMask("9999-99-99")} />
 * ```
 */
export const createInputMask = <
  MaskEvent extends EventLike = KeyboardEvent | InputEvent | ClipboardEvent,
>(
  mask: InputMask,
  regexps?: Record<string, RegExp>,
): ((ev: MaskEvent) => string) => {
  const maskFn = anyMaskToFn(mask, regexps);
  const handler = (ev: MaskEvent) => {
    const ref = (ev.currentTarget || ev.target) as HTMLInputElement | HTMLTextAreaElement;
    const [value, selection] = maskFn(ref.value, [
      ref.selectionStart || ref.value.length,
      ref.selectionEnd || ref.value.length,
    ]);
    ref.value = value;
    ref.setSelectionRange(...selection);
    return value;
  };
  return handler;
};

/**
 * Adds a data-attributes with value and remaining pattern to be used in ::before/::after
 * > Requires an extra empty element (e.g. label) directly before the input
 * ### CSS:
 * ```css
 * label[data-mask-value] {
 *
 * }
 * label[data-mask-value]::before {
 *   content: attr(data-mask-value);
 *   color: transparent;
 * }
 * label[data-mask-pattern]::after {
 *   content: attr(data-mask-pattern);
 *   opacity: 0.7;
 * }
 * ```
 *
 * ### JSX/TSX:
 * ```tsx
 * <div>
 *   <label></label>
 *   <input
 *     placeholder="YYYY-MM-DD"
 *     onInput={createMaskPattern(createInputMask("9999-99-99"), () => "YYYY-MM-DD")}
 *   />
 * </div>
 * ```
 */
export const createMaskPattern = <
  MaskEvent extends EventLike = KeyboardEvent | InputEvent | ClipboardEvent,
>(
  inputMask: (ev: MaskEvent) => string,
  pattern: (value?: string) => string,
): ((ev: MaskEvent) => string) => {
  const handler = (ev: MaskEvent) => {
    const value = inputMask(ev);
    const ref = (ev.currentTarget || ev.target) as HTMLInputElement | HTMLTextAreaElement;
    const prev = ref.previousElementSibling as HTMLElement;
    const fn = value === "" ? "removeAttribute" : "setAttribute";
    prev[fn]("data-mask-value", value);
    prev[fn]("data-mask-pattern", pattern(value).slice(value.length));
    return value;
  };
  return handler;
};
