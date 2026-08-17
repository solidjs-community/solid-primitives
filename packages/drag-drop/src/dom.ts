/**
 * Delta between two client points, compensated for any window scroll that happened
 * in between. Without this, a pointer-anchored drag transform silently drifts by the
 * scroll amount if the page scrolls mid-drag (the dragged element moves with the page
 * like any other in-flow content, but the reported delta wouldn't account for that).
 */
export function scrollCompensatedDelta(
  clientX: number,
  clientY: number,
  startX: number,
  startY: number,
  startScrollX: number,
  startScrollY: number,
): { x: number; y: number } {
  return {
    x: clientX - startX + (window.scrollX - startScrollX),
    y: clientY - startY + (window.scrollY - startScrollY),
  };
}

export function applyStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration> | undefined): void {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    (el.style as any)[k] = v as string;
  }
}

export function removeStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration> | undefined): void {
  if (!style) return;
  for (const k of Object.keys(style)) {
    (el.style as any)[k] = "";
  }
}

export function applyClass(el: HTMLElement, classes: string | undefined): void {
  if (!classes) return;
  for (const cls of classes.split(" ")) {
    if (cls) el.classList.add(cls);
  }
}

export function removeClass(el: HTMLElement, classes: string | undefined): void {
  if (!classes) return;
  for (const cls of classes.split(" ")) {
    if (cls) el.classList.remove(cls);
  }
}

/**
 * Marks an element as a keyboard-reachable drag handle — makes it focusable and
 * announces its role, without clobbering any of these the consumer already set explicitly.
 */
export function markAsDraggable(el: HTMLElement): void {
  if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
  if (!el.hasAttribute("role")) el.setAttribute("role", "button");
  if (!el.hasAttribute("aria-roledescription")) el.setAttribute("aria-roledescription", "draggable");
}
