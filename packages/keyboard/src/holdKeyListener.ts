import { makeEventListener } from "@solid-primitives/event-listener";

export type KeyModifier = "altKey" | "ctrlKey" | "metaKey" | "shiftKey";

export type KeyToHold = KeyModifier | (string & {});

const keyModifiers: readonly KeyModifier[] = ["altKey", "ctrlKey", "metaKey", "shiftKey"];

/**
 * Attaches keyboard event-listeners to `window`, and calls {@link onHoldChange} callback whenever user holds or stops holding specified {@link key}.
 *
 * Event listeners are automatically cleaned on root dispose.
 *
 * @param key keyboard key or modifier to listen for
 * @param onHoldChange callback fired when the hold state changes
 * @param options additional configuration
 * - `options.preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified {@link key} is pressed. *(Defaults to `false`)*
 * - `options.allowOtherKeys` — Should the user be allowed to press other keys while holding the specified one *(Defaults to `false`)*
 */
export function makeKeyHoldListener(
  key: KeyToHold,
  onHoldChange: (isHolding: boolean) => void,
  options: {
    preventDefault?: boolean;
    allowOtherKeys?: boolean;
  } = {}
): void {
  const { preventDefault, allowOtherKeys } = options;

  const modifier = keyModifiers.includes(key) ? (key as KeyModifier) : undefined;

  let state = false;
  let actualPressed = false;

  const updateState = (newState: boolean) => {
    newState !== state && onHoldChange((state = newState));
  };

  makeEventListener(
    window,
    "keydown",
    modifier
      ? e => {
          if (e.repeat) return;
          if (e[modifier]) {
            if (!state && !actualPressed) {
              preventDefault && e.preventDefault();
              onHoldChange((state = actualPressed = true));
            } else if (!allowOtherKeys) updateState(false);
          } else updateState((actualPressed = false));
        }
      : e => {
          if (e.key !== key) {
            allowOtherKeys || updateState(false);
            return;
          }
          if (e.repeat) return;
          updateState(true);
        }
  );
  makeEventListener(
    window,
    "keyup",
    modifier
      ? e => {
          if (e[modifier]) allowOtherKeys || updateState(false);
          else updateState((actualPressed = false));
        }
      : e => {
          if (e.key !== key) allowOtherKeys || updateState(false);
          else updateState(false);
        }
  );
  makeEventListener(
    document,
    "visibilitychange",
    () => document.visibilityState !== "visible" && updateState(false)
  );
}
