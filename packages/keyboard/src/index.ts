import { makeEventListener } from "@solid-primitives/event-listener";
import { createSingletonRoot } from "@solid-primitives/rootless";
import { arrayEquals } from "@solid-primitives/utils";
import { Accessor, batch, createEffect, createMemo, createSignal, on, untrack } from "solid-js";

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
 * Provides a signal with the list of currently held keys, ordered from least recent to most recent.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot). *(signals and event-listeners are reused across dependents)*
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#useKeyDownList
 *
 * @returns
 * Returns a signal of a list of keys, and a signal of last keydown event.
 * ```ts
 * [keys: Accessor<string[]>, other: { event: Accessor<KeyboardEvent | null> }]
 * ```
 *
 * @example
 * ```ts
 * const [keys] = useKeyDownList();
 * createEffect(() => {
 *    console.log(keys()) // => ["ALT", "CONTROL", "Q", "A"]
 * })
 * ```
 */
export const useKeyDownList = /*#__PURE__*/ createSingletonRoot<
  [keys: Accessor<string[]>, other: { event: Accessor<KeyboardEvent | null> }]
>(() => {
  if (process.env.SSR) {
    return [() => [], { event: () => null }];
  }

  const [pressedKeys, setPressedKeys] = createSignal<string[]>([]);
  const [event, setEvent] = createSignal<KeyboardEvent | null>(null);

  const reset = () => setPressedKeys([]);

  makeEventListener(window, "keydown", e => {
    // e.key may be undefined when used with <datalist> el
    // gh issue: https://github.com/solidjs-community/solid-primitives/issues/246
    if (e.repeat || typeof e.key !== "string") return;
    const key = e.key.toUpperCase();
    if (pressedKeys().includes(key)) return;
    batch(() => {
      setEvent(e);
      setPressedKeys(prev => [...prev, key]);
    });
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

  return [pressedKeys, { event }];
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
    if (process.env.SSR) {
      return () => null;
    }

    const [keys] = useKeyDownList();
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
  if (process.env.SSR) {
    return () => [];
  }
  const [keys] = useKeyDownList();
  return createMemo(prev => {
    if (keys().length === 0) return [];
    return [...prev, keys()];
  }, []);
});

/**
 * Provides a `boolean` signal indicating if provided {@link key} is currently being held down.
 * Holding multiple keys at the same time will return `false` — holding only the specified one will return `true`.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#createKeyHold
 *
 * @param key The key to check for.
 * @options The options for the key hold.
 * - `preventDefault` — Controlls in the keydown event should have it's default action prevented. Enabled by default.
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
  if (process.env.SSR) {
    return () => false;
  }

  key = key.toUpperCase();
  const { preventDefault = true } = options;

  const [, { event }] = useKeyDownList();
  const heldKey = useCurrentlyHeldKey();

  return createMemo(() => {
    if (heldKey() === key) {
      preventDefault && event()!.preventDefault();
      return true;
    }
    return false;
  });
}

/**
 * Creates a keyboard shotcut observer. The provided {@link callback} will be called when the specified {@link keys} are pressed.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard#createShortcut
 *
 * @param keys The sequence of keys to watch for.
 * @param callback The callback to call when the keys are pressed.
 * @options The options for the shortcut.
 * - `preventDefault` — Controlls in the keydown event should have it's default action prevented. Enabled by default.
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
  callback: VoidFunction,
  options: {
    preventDefault?: boolean;
    requireReset?: boolean;
  } = {},
): void {
  if (process.env.SSR || !keys.length) {
    return;
  }

  keys = keys.map(key => key.toUpperCase());
  const { preventDefault = true, requireReset = false } = options;

  const [, { event }] = useKeyDownList();
  const sequence = useKeyDownSequence();

  let reset = false;
  // allow to check the sequence only once the user has released all keys
  const handleSequenceWithReset = (sequence: string[][]) => {
    if (!sequence.length) return (reset = false);
    if (reset) return;

    if (sequence.length < keys.length) {
      // optimistically preventDefault behavior if we yet don't have enough keys
      if (equalsKeyHoldSequence(sequence, keys.slice(0, sequence.length))) {
        preventDefault && event()!.preventDefault();
      } else {
        reset = true;
      }
    } else {
      reset = true;
      if (equalsKeyHoldSequence(sequence, keys)) {
        preventDefault && event()!.preventDefault();
        callback();
      }
    }
  };

  // allow checking the sequence even if the user is still holding down keys
  const handleSequenceWithoutReset = (sequence: string[][]) => {
    const last = sequence.at(-1);
    if (!last) return;
    // optimistically preventDefault behavior if we yet don't have enough keys
    if (preventDefault && last.length < keys.length) {
      if (arrayEquals(last, keys.slice(0, keys.length - 1))) {
        event()!.preventDefault();
      }
      return;
    }
    if (arrayEquals(last, keys)) {
      const prev = sequence.at(-2);
      if (!prev || arrayEquals(prev, keys.slice(0, keys.length - 1))) {
        preventDefault && event()!.preventDefault();
        callback();
      }
    }
  };

  createEffect(on(sequence, requireReset ? handleSequenceWithReset : handleSequenceWithoutReset));
}
