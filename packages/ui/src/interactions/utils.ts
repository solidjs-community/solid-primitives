import { createSignal, onCleanup } from "solid-js";

export function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
  // JAWS/NVDA with Firefox.
  if ((event as any).mozInputSource === 0 && event.isTrusted) {
    return true;
  }

  return event.detail === 0 && !(event as PointerEvent).pointerType;
}

export function createSyntheticBlurEvent(onBlur: (event: FocusEvent) => void) {
  const [isFocused, setIsFocused] = createSignal(false);
  const [observer, setObserver] = createSignal<MutationObserver | null>(null);

  // This function is called during a SolidJS onFocus event.
  const onFocus = (e: FocusEvent) => {
    // Most browsers fire a native focusout event when an element is disabled, except for Firefox.
    // In that case, we use a MutationObserver to watch for the disabled attribute, and dispatch these events ourselves.
    // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      setIsFocused(true);

      const target = e.target;

      const onBlurHandler = (e: FocusEvent) => {
        setIsFocused(false);

        if (target.disabled) {
          // For backward compatibility, dispatch a (fake) event.
          onBlur(new FocusEvent("blur", e));
        }

        // We no longer need the MutationObserver once the target is blurred.
        observer()?.disconnect();
        setObserver(null);
      };

      target.addEventListener("focusout", onBlurHandler as EventListener, { once: true });

      const mutationCallback = () => {
        if (isFocused() && target.disabled) {
          observer()?.disconnect();
          target.dispatchEvent(new FocusEvent("blur"));
          target.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        }
      };

      setObserver(new MutationObserver(mutationCallback));

      observer()?.observe(target, { attributes: true, attributeFilter: ["disabled"] });
    }
  };

  // Clean up MutationObserver on unmount.
  onCleanup(() => {
    observer()?.disconnect();
    setObserver(null);
  });

  return onFocus;
}
