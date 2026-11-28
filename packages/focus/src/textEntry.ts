const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
  "hidden",
]);

/**
 * Whether the element (or one of its ancestors) is a control that needs the focus to be
 * usable for text entry or native picking: `<textarea>`, `<select>`, text-like `<input>`s and
 * `contenteditable` hosts.
 * @internal
 */
export function isTextEntry(target: EventTarget | null | undefined): boolean {
  let el: Element | null = target instanceof Element ? target : null;
  while (el) {
    const tag = el.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT") return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
    const editable = el.getAttribute("contenteditable");
    if (editable !== null && editable !== "false") return true;
    el = el.parentElement;
  }
  return false;
}
