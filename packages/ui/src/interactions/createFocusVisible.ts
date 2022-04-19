import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

import { isMac } from "../utils";
import { isVirtualClick } from "./utils";

type Modality = "keyboard" | "pointer" | "virtual";
type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent;
type Handler = (modality?: Modality, e?: HandlerEvent) => void;
type FocusVisibleHandler = (isFocusVisible: boolean) => void;

interface CreateFocusVisibleProps {
  /**
   * Whether the element is a text input.
   */
  isTextInput?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the element will be auto focused.
   */
  autoFocus?: MaybeAccessor<boolean | undefined>;
}

interface FocusVisibleResult {
  /**
   * Whether keyboard focus is visible globally.
   */
  isFocusVisible: Accessor<boolean>;
}

const changeHandlers = new Set<Handler>();

let currentModality: Modality;
let hasSetupGlobalListeners = false;
let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;

// Only Tab or Esc keys will make focus visible on text input elements
const FOCUS_VISIBLE_INPUT_KEYS = {
  Tab: true,
  Escape: true,
};

function triggerChangeHandlers(modality: Modality, e?: HandlerEvent) {
  for (const handler of changeHandlers) {
    handler(modality, e);
  }
}

/**
 * Helper function to determine if a KeyboardEvent is unmodified and could make keyboard focus styles visible.
 */
function isValidKey(e: KeyboardEvent) {
  // Control and Shift keys trigger when navigating back to the tab with keyboard.
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  );
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true;
  if (isValidKey(e)) {
    currentModality = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  currentModality = "pointer";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent) {
  if (isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
  }
}

function handleFocusEvent(e: FocusEvent) {
  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  if (e.target === window || e.target === document) {
    return;
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    triggerChangeHandlers("virtual", e);
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}

function handleWindowBlur() {
  // When the window is blurred, reset state. This is necessary when tabbing out of the window,
  // for example, since a subsequent focus event won't be fired.
  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}

/**
 * Setup global event listeners to control when keyboard focus style should be visible.
 */
export function setupGlobalFocusEvents() {
  if (typeof window === "undefined" || hasSetupGlobalListeners) {
    return;
  }

  // Programmatic focus() calls shouldn't affect the current input modality.
  // However, we need to detect other cases when a focus event occurs without
  // a preceding user event (e.g. screen reader focus). Overriding the focus
  // method on HTMLElement.prototype is a bit hacky, but works.
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...args) {
    hasEventBeforeFocus = true;
    focus.apply(this, args);
  };

  document.addEventListener("keydown", handleKeyboardEvent, true);
  document.addEventListener("keyup", handleKeyboardEvent, true);
  document.addEventListener("click", handleClickEvent, true);

  // Register focus events on the window so they are sure to happen
  // before React's event listeners (registered on the document).
  window.addEventListener("focus", handleFocusEvent, true);
  window.addEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    document.addEventListener("pointerdown", handlePointerEvent, true);
    document.addEventListener("pointermove", handlePointerEvent, true);
    document.addEventListener("pointerup", handlePointerEvent, true);
  } else {
    document.addEventListener("mousedown", handlePointerEvent, true);
    document.addEventListener("mousemove", handlePointerEvent, true);
    document.addEventListener("mouseup", handlePointerEvent, true);
  }

  hasSetupGlobalListeners = true;
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") {
    setupGlobalFocusEvents();
  } else {
    document.addEventListener("DOMContentLoaded", setupGlobalFocusEvents);
  }
}

/**
 * If true, keyboard focus is visible.
 */
// export function isFocusVisible(): boolean {
export function isKeyboardFocusVisible(): boolean {
  return currentModality !== "pointer";
}

export function getInteractionModality(): Modality {
  return currentModality;
}

export function setInteractionModality(modality: Modality) {
  currentModality = modality;
  triggerChangeHandlers(modality);
}

/**
 * Keeps state of the current modality.
 */
export function useInteractionModality(): Accessor<Modality> {
  setupGlobalFocusEvents();

  const [modality, setModality] = createSignal(currentModality);

  onMount(() => {
    const handler = () => {
      setModality(currentModality);
    };

    changeHandlers.add(handler);

    onCleanup(() => {
      changeHandlers.delete(handler);
    });
  });

  return modality;
}

/**
 * If this is attached to text input component, return if the event is a focus event (Tab/Escape keys pressed) so that
 * focus visible style can be properly set.
 */
function isKeyboardFocusEvent(isTextInput: boolean, modality?: Modality, e?: HandlerEvent) {
  return !(
    isTextInput &&
    modality === "keyboard" &&
    e instanceof KeyboardEvent &&
    // eslint-disable-next-line
    //@ts-ignore
    !FOCUS_VISIBLE_INPUT_KEYS[e.key]
  );
}

/**
 * Listens for trigger change and reports if focus is visible (i.e., modality is not pointer).
 */
export function createFocusVisibleListener(
  fn: FocusVisibleHandler,
  dep: Accessor<any>,
  opts?: { isTextInput?: boolean }
): void {
  setupGlobalFocusEvents();

  createEffect(
    on(
      () => dep(),
      () => {
        const handler: Handler = (modality, e) => {
          if (!isKeyboardFocusEvent(!!opts?.isTextInput, modality, e)) {
            return;
          }

          fn(isKeyboardFocusVisible());
        };

        changeHandlers.add(handler);

        onCleanup(() => {
          changeHandlers.delete(handler);
        });
      }
    )
  );
}

/**
 * Manages focus visible state for the page, and subscribes individual components for updates.
 */
export function createFocusVisible(props: CreateFocusVisibleProps = {}): FocusVisibleResult {
  const [isFocusVisible, setFocusVisible] = createSignal(
    access(props.autoFocus) || isKeyboardFocusVisible()
  );

  createFocusVisibleListener(setFocusVisible, () => access(props.isTextInput), {
    isTextInput: access(props.isTextInput),
  });

  return { isFocusVisible };
}
