import { makeEventListener } from "@solid-primitives/event-listener";
import { createSingletonRoot } from "@solid-primitives/rootless";
import { arrayEquals, INTERNAL_OPTIONS } from "@solid-primitives/utils";
import { type Accessor, createMemo, createSignal, untrack } from "solid-js";
import { isServer } from "@solidjs/web";

export type ModifierKey = "Alt" | "Control" | "Meta" | "Shift";
export type KbdKey = ModifierKey | (string & {});

function equalsKeyHoldSequence(sequence: string[][], model: string[]): boolean {
  for (let i = sequence.length - 1; i >= 0; i--) {
    const _model = model.slice(0, i + 1);
    if (!arrayEquals(sequence[i]!, _model)) return false;
  }
  return true;
}

/**
 * Provides a signal with the last keydown event.
 *
 * The signal is `null` initially, and is reset to that after a timeout.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#useKeyDownEvent
 *
 * @returns
 * Returns a signal of the last keydown event
 * ```ts
 * Accessor<KeyboardEvent | null>
 * ```
 *
 * @example
 * ```ts
 * const event = useKeyDownEvent();
 *
 * createEffect(() => {
 *   const e = event();
 *   console.log(e) // => KeyboardEvent | null
 *
 *   if (e) {
 *     console.log(e.key) // => "Q" | "ALT" | ...
 *     e.preventDefault();
 *   }
 * })
 * ```
 */
export const useKeyDownEvent = /*#__PURE__*/ createSingletonRoot<Accessor<KeyboardEvent | null>>(
  () => {
    if (isServer) {
      return () => null;
    }

    const [event, setEvent] = createSignal<KeyboardEvent | null>(null, INTERNAL_OPTIONS);

    makeEventListener(window, "keydown", e => {
      setEvent(e);
      setTimeout(() => setEvent(null));
    });

    return event;
  },
);

/**
 * Provides a signal with the list of currently held keys, ordered from least recent to most recent.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot). *(signals and event-listeners are reused across dependents)*
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#useKeyDownList
 *
 * @returns
 * Returns a signal of a list of keys
 * ```ts
 * Accessor<string[]>
 * ```
 *
 * @example
 * ```ts
 * const keys = useKeyDownList();
 * createEffect(() => {
 *    console.log(keys()) // => ["ALT", "CONTROL", "Q", "A"]
 * })
 * ```
 */
export const useKeyDownList = /*#__PURE__*/ createSingletonRoot<Accessor<string[]>>(() => {
  if (isServer) {
    return () => [];
  }

  const [pressedKeys, setPressedKeys] = createSignal<string[]>([], INTERNAL_OPTIONS);
  const reset = () => setPressedKeys([]);

  makeEventListener(window, "keydown", e => {
    // e.key may be undefined when used with <datalist> el
    // gh issue: https://github.com/solidjs-community/solid-primitives/issues/246
    if (e.repeat || typeof e.key !== "string") return;

    const key = e.key.toUpperCase(),
      currentKeys = pressedKeys();

    if (currentKeys.includes(key)) return;

    const keys = [...currentKeys, key];

    // if the modifier is pressed before we start listening
    // we should add it to the list
    if (
      currentKeys.length === 0 &&
      key !== "ALT" &&
      key !== "CONTROL" &&
      key !== "META" &&
      key !== "SHIFT"
    ) {
      if (e.shiftKey) keys.unshift("SHIFT");
      if (e.altKey) keys.unshift("ALT");
      if (e.ctrlKey) keys.unshift("CONTROL");
      if (e.metaKey) keys.unshift("META");
    }

    setPressedKeys(keys);
  });

  makeEventListener(window, "keyup", e => {
    if (typeof e.key !== "string") return;
    const key = e.key.toUpperCase();
    setPressedKeys(prev => prev.filter(_key => _key !== key));
  });

  makeEventListener(window, "blur", reset);
  makeEventListener(window, "contextmenu", e => {
    e.defaultPrevented || reset();
  });

  return pressedKeys;
});

/**
 * Provides a signal with the currently held single key. Pressing any other key at the same time will reset the signal to `null`.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot). *(signals and event-listeners are reused across dependents)*
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#useCurrentlyHeldKey
 *
 * @returns
 * ```ts
 * Accessor<string | null>
 * ```
 *
 * @example
 * ```ts
 * const key = useCurrentlyHeldKey();
 * createEffect(() => {
 *    console.log(key()) // => "Q" | "ALT" | ... or null
 * })
 * ```
 */
export const useCurrentlyHeldKey = /*#__PURE__*/ createSingletonRoot<Accessor<string | null>>(
  () => {
    if (isServer) {
      return () => null;
    }

    const keys = useKeyDownList();
    let prevKeys = untrack(keys);

    return createMemo(() => {
      const _keys = keys();
      const prev = prevKeys;
      prevKeys = _keys;
      if (prev.length === 0 && _keys.length === 1) return _keys[0]!;
      return null;
    });
  },
);

/**
 * Provides a signal with a sequence of currently held keys, as they were pressed down and up.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot). *(signals and event-listeners are reused across dependents)*
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#useKeyDownSequence
 *
 * @returns
 * ```ts
 * Accessor<string[][]>
 * // [["CONTROL"], ["CONTROL", "Q"], ["CONTROL", "Q", "A"]]
 * ```
 *
 * @example
 * ```ts
 * const sequence = useKeyDownSequence();
 * createEffect(() => {
 *    console.log(sequence()) // => string[][]
 * })
 * ```
 */
export const useKeyDownSequence = /*#__PURE__*/ createSingletonRoot<Accessor<string[][]>>(() => {
  if (isServer) {
    return () => [];
  }

  const keys = useKeyDownList();

  // createMemo's second arg is options (not initialValue). The prev
  // parameter starts as undefined; handle it with a fallback.
  return createMemo((prev: string[][] | undefined) => {
    if (keys().length === 0) return [];
    return [...(prev ?? []), keys()];
  });
});

/**
 * Provides a `boolean` signal indicating if provided {@link key} is currently being held down.
 * Holding multiple keys at the same time will return `false` — holding only the specified one will return `true`.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#createKeyHold
 *
 * @param key The key to check for.
 * @param options The options for the key hold.
 * - `preventDefault` — Controls if the keydown event should have its default action prevented. Enabled by default.
 * @returns
 * ```ts
 * Accessor<boolean>
 * ```
 *
 * @example
 * ```ts
 * const isHeld = createKeyHold("ALT");
 * createEffect(() => {
 *    console.log(isHeld()) // => boolean
 * })
 * ```
 */
export function createKeyHold(
  key: KbdKey,
  options: { preventDefault?: boolean } = {},
): Accessor<boolean> {
  if (isServer) {
    return () => false;
  }

  key = key.toUpperCase();
  const { preventDefault = true } = options;
  const heldKey = useCurrentlyHeldKey();

  if (preventDefault) {
    // Use a direct event listener for synchronous preventDefault — signal reads in event
    // listeners return the pre-batch committed value, so we check e.key directly.
    makeEventListener(window, "keydown", (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === key) {
        e.preventDefault();
      }
    });
  }

  return createMemo(() => heldKey() === key);
}

/**
 * Creates a keyboard shortcut observer. The provided {@link callback} will be called when the specified {@link keys} are pressed.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#createShortcut
 *
 * @param keys The sequence of keys to watch for.
 * @param callback The callback to call when the keys are pressed.
 * @param options The options for the shortcut.
 * - `preventDefault` — Controls if the keydown event should have its default action prevented. Enabled by default.
 * - `requireReset` — If `true`, the shortcut will only be triggered once until all of the keys stop being pressed. Disabled by default.
 *
 * @example
 * ```ts
 * createShortcut(["CONTROL", "SHIFT", "C"], () => {
 *    console.log("Ctrl+Shift+C was pressed");
 * });
 * ```
 */
export function createShortcut(
  keys: KbdKey[],
  callback: (event: KeyboardEvent | null) => void,
  options: {
    preventDefault?: boolean;
    requireReset?: boolean;
  } = {},
): void {
  if (isServer || !keys.length) {
    return;
  }

  keys = keys.map(key => key.toUpperCase());
  const { preventDefault = true, requireReset = false } = options;

  // Track pressed keys and sequence locally with plain JS state rather than
  // reactive signals. A signal reads from event listeners return
  // the pre-batch committed value, so synchronous shortcut checking requires
  // imperative state that's updated in the same event listener tick.
  let pressedKeys: string[] = [];
  let sequence: string[][] = [];
  let reset = false;

  const resetAll = () => {
    pressedKeys = [];
    sequence = [];
    reset = false;
  };

  makeEventListener(window, "keydown", (e: KeyboardEvent) => {
    if (e.repeat || typeof e.key !== "string") return;
    const key = e.key.toUpperCase();

    if (!pressedKeys.includes(key)) {
      const newKeys = [...pressedKeys];
      // Detect modifiers pressed before listener attached
      if (
        pressedKeys.length === 0 &&
        key !== "ALT" &&
        key !== "CONTROL" &&
        key !== "META" &&
        key !== "SHIFT"
      ) {
        if (e.shiftKey && !newKeys.includes("SHIFT")) newKeys.unshift("SHIFT");
        if (e.altKey && !newKeys.includes("ALT")) newKeys.unshift("ALT");
        if (e.ctrlKey && !newKeys.includes("CONTROL")) newKeys.unshift("CONTROL");
        if (e.metaKey && !newKeys.includes("META")) newKeys.unshift("META");
      }
      newKeys.push(key);
      pressedKeys = newKeys;
      sequence = [...sequence, [...pressedKeys]];
    }

    if (requireReset) {
      if (reset) return;
      if (sequence.length < keys.length) {
        if (equalsKeyHoldSequence(sequence, keys.slice(0, sequence.length))) {
          preventDefault && e.preventDefault();
        } else {
          reset = true;
        }
      } else {
        reset = true;
        if (equalsKeyHoldSequence(sequence, keys)) {
          preventDefault && e.preventDefault();
          callback(e);
        }
      }
    } else {
      const last = sequence.at(-1);
      if (!last) return;

      if (preventDefault && last.length < keys.length) {
        if (arrayEquals(last, keys.slice(0, keys.length - 1))) {
          e.preventDefault();
        }
        return;
      }
      if (arrayEquals(last, keys)) {
        const prev = sequence.at(-2);
        if (!prev || arrayEquals(prev, keys.slice(0, keys.length - 1))) {
          preventDefault && e.preventDefault();
          callback(e);
        }
      }
    }
  });

  makeEventListener(window, "keyup", (e: KeyboardEvent) => {
    if (typeof e.key !== "string") return;
    const key = e.key.toUpperCase();
    pressedKeys = pressedKeys.filter(k => k !== key);
    if (pressedKeys.length === 0) {
      sequence = [];
      reset = false;
    } else {
      // Reset sequence to remaining held keys so repeated presses of the last
      // key can re-trigger the shortcut while modifier keys stay held.
      sequence = [[...pressedKeys]];
    }
  });

  makeEventListener(window, "blur", resetAll);
  makeEventListener(window, "contextmenu", (e: MouseEvent) => {
    e.defaultPrevented || resetAll();
  });
}
