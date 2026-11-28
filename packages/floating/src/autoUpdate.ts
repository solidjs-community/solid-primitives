import type { ReferenceElement } from "./types.ts";

export type AutoUpdateOptions = {
  /** Update when any scrollable ancestor, the window or the visual viewport scrolls. Default `true`. */
  ancestorScroll?: boolean;
  /** Update when the window or the visual viewport resizes. Default `true`. */
  ancestorResize?: boolean;
  /** Update when the reference or floating element changes size. Default `true`. */
  elementResize?: boolean;
  /** Poll every animation frame and update when the reference moves. Default `false`. */
  animationFrame?: boolean;
};

const SCROLLABLE = /auto|scroll|overlay|hidden|clip/;

function getParent(node: Element): Element | null {
  if (node.assignedSlot) return node.assignedSlot;
  if (node.parentElement) return node.parentElement;
  const root = node.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

function getScrollParents(node: Element): Element[] {
  const win = node.ownerDocument.defaultView;
  const { body, documentElement } = node.ownerDocument;
  const result: Element[] = [];
  let el = getParent(node);
  while (el && el !== body && el !== documentElement) {
    const style = win?.getComputedStyle(el);
    if (style && SCROLLABLE.test(style.overflow + style.overflowX + style.overflowY))
      result.push(el);
    el = getParent(el);
  }
  return result;
}

const getContext = (reference: ReferenceElement): Element | undefined =>
  "nodeType" in reference ? reference : reference.contextElement;

const rectKey = (reference: ReferenceElement, floating: HTMLElement): string => {
  const r = reference.getBoundingClientRect();
  const f = floating.getBoundingClientRect();
  return `${r.x ?? r.left},${r.y ?? r.top},${r.width},${r.height}|${f.width},${f.height}`;
};

/**
 * Keeps a floating element's position fresh: calls `update` when the reference or floating
 * element resizes, when an ancestor scrolls, when the window resizes, and optionally on every
 * animation frame in which the reference moved.
 *
 * Does not call `update` itself on setup. Returns a cleanup that removes every listener and
 * observer; calling it more than once is safe. A no-op on the server.
 *
 * Matches the `whileElementsMounted` signature, so it can be passed to `createFloating` directly.
 */
export function makeAutoUpdate(
  reference: ReferenceElement,
  floating: HTMLElement,
  update: () => void,
  options: AutoUpdateOptions = {},
): VoidFunction {
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = true,
    animationFrame = false,
  } = options;

  const win = floating.ownerDocument?.defaultView;
  if (!win) return () => {};

  const cleanups: VoidFunction[] = [];
  const listen = (target: EventTarget | null | undefined, type: string): void => {
    if (!target) return;
    target.addEventListener(type, update, { passive: true });
    cleanups.push(() => target.removeEventListener(type, update));
  };

  const context = getContext(reference);

  if (ancestorScroll) {
    const targets = new Set<EventTarget>([win]);
    if (win.visualViewport) targets.add(win.visualViewport);
    if (context) for (const el of getScrollParents(context)) targets.add(el);
    for (const el of getScrollParents(floating)) targets.add(el);
    for (const target of targets) listen(target, "scroll");
  }

  if (ancestorResize) {
    listen(win, "resize");
    listen(win.visualViewport, "resize");
  }

  if (elementResize && typeof win.ResizeObserver === "function") {
    const observer = new win.ResizeObserver(() => update());
    if (context) observer.observe(context);
    observer.observe(floating);
    cleanups.push(() => observer.disconnect());
  }

  if (animationFrame && typeof win.requestAnimationFrame === "function") {
    let previous = rectKey(reference, floating);
    let frame = win.requestAnimationFrame(function tick() {
      const next = rectKey(reference, floating);
      if (next !== previous) {
        previous = next;
        update();
      }
      frame = win.requestAnimationFrame(tick);
    });
    cleanups.push(() => win.cancelAnimationFrame(frame));
  }

  let done = false;
  return () => {
    if (done) return;
    done = true;
    for (const cleanup of cleanups) cleanup();
    cleanups.length = 0;
  };
}

/** Alias of `makeAutoUpdate`, named as in other positioning libraries. */
export const autoUpdate: typeof makeAutoUpdate = makeAutoUpdate;
