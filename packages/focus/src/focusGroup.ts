/*
 * Ported from kobalte's focus-manager.
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/utils/src/focus-manager.ts
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/7638f4d671e32b7aa2db110a875fe48f24b68fd0/packages/react-aria/src/focus/FocusScope.tsx
 */

import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { createEffect, type Accessor } from "solid-js";
import {
  FOCUSABLE_ELEMENT_SELECTOR,
  isElementVisible,
  TABBABLE_ELEMENT_SELECTOR,
} from "./tabbable.ts";

export type Orientation = "vertical" | "horizontal";
export type TextDirection = "ltr" | "rtl";

export interface FocusGroup {
  /** Moves focus to the next focusable or tabbable element in the focus scope. */
  focusNext(opts?: FocusGroupOptions): HTMLElement | undefined;

  /** Moves focus to the previous focusable or tabbable element in the focus scope. */
  focusPrevious(opts?: FocusGroupOptions): HTMLElement | undefined;

  /** Moves focus to the first focusable or tabbable element in the focus scope. */
  focusFirst(opts?: FocusGroupOptions): HTMLElement | undefined;

  /** Moves focus to the last focusable or tabbable element in the focus scope. */
  focusLast(opts?: FocusGroupOptions): HTMLElement | undefined;
}

export interface FocusGroupOptions {
  /** The element to start searching from. The currently focused element by default. */
  from?: Element;

  /** Whether to only include tabbable elements, or all focusable elements. */
  tabbable?: boolean;

  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;

  /** A callback that determines whether the given element is focused. */
  accept?: (node: Element) => boolean;

  /** The orientation of the focus group. @default "vertical" */
  orientation?: MaybeAccessor<Orientation>;

  /** The text direction of the focus group. @default "ltr" */
  textDirection?: MaybeAccessor<TextDirection>;

  /** Whether tab key presses should be handled. @default true */
  handleTab?: MaybeAccessor<boolean>;

  /**
   * Whether keyboard navigation (arrow keys, Home/End, Tab) should be enabled.
   * The `keydown` listener is attached to the focus group ref automatically. @default true
   */
  keyboardNavigation?: MaybeAccessor<boolean>;
}

/**
 * Creates a FocusGroup object that can be used to move focus within an element.
 *
 * By default keyboard navigation is enabled: a `keydown` listener is attached to the
 * focus group ref automatically (and removed when the ref changes or the group is disposed).
 *
 * @example
 * ```tsx
 * const [ref, setRef] = createSignal<HTMLElement>();
 * const group = createFocusGroup(ref);
 *
 * group.focusFirst();
 * group.focusNext();
 * group.focusPrevious();
 * group.focusLast();
 *
 * <div ref={setRef}>
 *   <button>One</button>
 *   <button>Two</button>
 *   <button>Three</button>
 * </div>
 * ```
 */
export const createFocusGroup = (
  ref: Accessor<HTMLElement | undefined>,
  defaultOptions: Accessor<FocusGroupOptions> = () => ({}),
): FocusGroup => {
  const focusNext = (opts: FocusGroupOptions = {}): HTMLElement | undefined => {
    const root = ref();

    if (!root) {
      return;
    }

    const {
      from = defaultOptions().from || document.activeElement,
      tabbable = defaultOptions().tabbable,
      wrap = defaultOptions().wrap,
      accept = defaultOptions().accept,
    } = opts;

    const walker = getFocusableTreeWalker(root, { tabbable, accept });

    if (from && root.contains(from)) {
      walker.currentNode = from;
    }

    let nextNode = (walker.nextNode() as HTMLElement | null) ?? undefined;

    if (!nextNode && wrap) {
      walker.currentNode = root;
      nextNode = (walker.nextNode() as HTMLElement | null) ?? undefined;
    }

    if (nextNode) {
      focusElement(nextNode, true);
    }

    return nextNode;
  };

  const focusPrevious = (opts: FocusGroupOptions = {}): HTMLElement | undefined => {
    const root = ref();

    if (!root) {
      return;
    }

    const {
      from = defaultOptions().from || document.activeElement,
      tabbable = defaultOptions().tabbable,
      wrap = defaultOptions().wrap,
      accept = defaultOptions().accept,
    } = opts;

    const walker = getFocusableTreeWalker(root, { tabbable, accept });

    if (from && root.contains(from)) {
      walker.currentNode = from;
    } else {
      const next = last(walker);
      if (next) {
        focusElement(next, true);
      }
      return next;
    }

    let previousNode = (walker.previousNode() as HTMLElement | null) ?? undefined;

    if (!previousNode && wrap) {
      walker.currentNode = root;
      previousNode = last(walker);
    }

    if (previousNode) {
      focusElement(previousNode, true);
    }

    return previousNode;
  };

  const focusFirst = (opts: FocusGroupOptions = {}): HTMLElement | undefined => {
    const root = ref();

    if (!root) {
      return;
    }

    const { tabbable = defaultOptions().tabbable, accept = defaultOptions().accept } = opts;

    const walker = getFocusableTreeWalker(root, { tabbable, accept });
    const nextNode = walker.nextNode() as HTMLElement | undefined;

    if (nextNode) {
      focusElement(nextNode, true);
    }

    return nextNode;
  };

  const focusLast = (opts: FocusGroupOptions = {}): HTMLElement | undefined => {
    const root = ref();

    if (!root) {
      return;
    }

    const { tabbable = defaultOptions().tabbable, accept = defaultOptions().accept } = opts;

    const walker = getFocusableTreeWalker(root, { tabbable, accept });
    const next = last(walker);

    if (next) {
      focusElement(next, true);
    }

    return next;
  };

  const keyboardOptions = () => {
    const opts = defaultOptions();
    return {
      orientation: access(opts.orientation) ?? ("vertical" as const),
      textDirection: access(opts.textDirection) ?? ("ltr" as const),
      handleTab: access(opts.handleTab) ?? true,
    };
  };

  const getNextKey = (): string => {
    const { orientation, textDirection } = keyboardOptions();
    return orientation === "vertical"
      ? "arrowdown"
      : textDirection === "ltr"
        ? "arrowright"
        : "arrowleft";
  };

  const getPreviousKey = (): string => {
    const { orientation, textDirection } = keyboardOptions();
    return orientation === "vertical"
      ? "arrowup"
      : textDirection === "ltr"
        ? "arrowleft"
        : "arrowright";
  };

  const isFocusInsideGroup = (): boolean => {
    const root = ref();
    return root != null && root.contains(document.activeElement);
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const eventKey = event.key.toLowerCase();
    const from = event.target instanceof Element ? event.target : undefined;

    if (eventKey === getNextKey()) {
      event.preventDefault();
      focusNext({ from });
    } else if (eventKey === getPreviousKey()) {
      event.preventDefault();
      focusPrevious({ from });
    } else if (eventKey === "home") {
      event.preventDefault();
      focusFirst();
    } else if (eventKey === "end") {
      event.preventDefault();
      focusLast();
    } else if (eventKey === "tab" && keyboardOptions().handleTab && isFocusInsideGroup()) {
      if (event.shiftKey) {
        if (focusPrevious({ from, wrap: false })) event.preventDefault();
      } else if (focusNext({ from, wrap: false })) {
        event.preventDefault();
      }
    }
  };

  createEffect(
    () => ({
      root: ref(),
      keyboardNavigation: access(defaultOptions().keyboardNavigation) ?? true,
    }),
    ({ root, keyboardNavigation }) => {
      if (!root || !keyboardNavigation) {
        return;
      }
      root.addEventListener("keydown", handleKeyDown);
      return () => root.removeEventListener("keydown", handleKeyDown);
    },
  );

  return { focusNext, focusPrevious, focusFirst, focusLast };
};

function focusElement(element: HTMLElement | null, scroll = false): void {
  if (element != null) {
    try {
      element.focus({ preventScroll: !scroll });
    } catch (_err) {
      // ignore
    }
  }
}

function last(walker: TreeWalker): HTMLElement | undefined {
  let next: HTMLElement | undefined;
  let last: HTMLElement | undefined;

  do {
    last = walker.lastChild() as HTMLElement;
    if (last) {
      next = last;
    }
  } while (last);

  return next;
}

function isElementInScope(element: Element | null, scope: HTMLElement[]): boolean {
  return scope.some(node => node.contains(element));
}

/**
 * Create a [TreeWalker]{@link https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker}
 * that matches all focusable/tabbable elements.
 */
export function getFocusableTreeWalker(
  root: HTMLElement,
  opts?: FocusGroupOptions,
  scope?: HTMLElement[],
): TreeWalker {
  const selector = opts?.tabbable ? TABBABLE_ELEMENT_SELECTOR : FOCUSABLE_ELEMENT_SELECTOR;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      // Skip nodes inside the starting node.
      if (opts?.from?.contains(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (
        opts?.tabbable &&
        (node as Element).tagName === "INPUT" &&
        (node as HTMLInputElement).type === "radio"
      ) {
        // If the radio is in a form, we can get all the other radios by name.
        if (!isTabbableRadio(node as HTMLInputElement)) {
          return NodeFilter.FILTER_REJECT;
        }

        // If the radio is in the same group as the current node and none are selected, we can skip it.
        if (
          (walker.currentNode as Element).tagName === "INPUT" &&
          (walker.currentNode as HTMLInputElement).type === "radio" &&
          (walker.currentNode as HTMLInputElement).name === (node as HTMLInputElement).name
        ) {
          return NodeFilter.FILTER_REJECT;
        }
      }

      if (
        (node as HTMLElement).matches(selector) &&
        isElementVisible(node as HTMLElement) &&
        (!scope || isElementInScope(node as HTMLElement, scope)) &&
        (!opts?.accept || opts.accept(node as Element))
      ) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  });

  if (opts?.from) {
    walker.currentNode = opts.from;
  }

  return walker;
}

function getRadiosInGroup(element: HTMLInputElement): HTMLInputElement[] {
  if (!element.name) {
    // A radio without a name isn't part of any group — treat it as its own group of one.
    return [element];
  }

  if (!element.form) {
    // Radio buttons outside a form - query the document.
    return Array.from(
      element.ownerDocument.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(element.name)}"]`,
      ),
    ).filter(radio => !radio.form);
  }

  // namedItem returns RadioNodeList (iterable) for 2+ elements, but a single Element for exactly 1.
  const radioList = element.form.elements.namedItem(element.name);
  const ownerWindow = element.ownerDocument.defaultView || window;
  if (radioList instanceof ownerWindow.RadioNodeList) {
    return Array.from(radioList).filter(
      (el): el is HTMLInputElement => el instanceof ownerWindow.HTMLInputElement,
    );
  }
  if (radioList instanceof ownerWindow.HTMLInputElement) {
    return [radioList];
  }
  return [];
}

function isTabbableRadio(element: HTMLInputElement): boolean {
  if (element.checked) {
    return true;
  }
  const radios = getRadiosInGroup(element);
  return radios.length > 0 && !radios.some(radio => radio.checked);
}
