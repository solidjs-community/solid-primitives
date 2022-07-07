import { makeEventListener } from "@solid-primitives/event-listener";
import { createSharedRoot } from "@solid-primitives/rootless";
import { arrayEquals } from "@solid-primitives/utils";
import { Accessor, batch, createEffect, createMemo, createSignal, on, untrack } from "solid-js";

export type ModifierKey = "Alt" | "Control" | "Meta" | "Shift";
export type KbdKey = ModifierKey | (string & {});

function equalsKeyHoldSequence(sequence: string[][], model: string[]): boolean {
  for (let i = sequence.length - 1; i >= 0; i--) {
    const _model = model.slice(0, i + 1);
    if (!arrayEquals(sequence[i], _model)) return false;
  }
  return true;
}

export const useKeyDownList = createSharedRoot<
  [keys: Accessor<string[]>, other: { event: Accessor<KeyboardEvent | null> }]
>(() => {
  const [pressedKeys, setPressedKeys] = createSignal<string[]>([]);
  const [event, setEvent] = createSignal<KeyboardEvent | null>(null);

  const reset = () => setPressedKeys([]);

  makeEventListener(window, "keydown", e => {
    if (e.repeat) return;
    const key = e.key.toUpperCase();
    if (pressedKeys().includes(key)) return;
    batch(() => {
      setEvent(e);
      setPressedKeys(prev => [...prev, key]);
    });
  });

  makeEventListener(window, "keyup", e => {
    const key = e.key.toUpperCase();
    setPressedKeys(prev => prev.filter(_key => _key !== key));
  });

  makeEventListener(window, "blur", reset);
  makeEventListener(window, "contextmenu", e => {
    e.defaultPrevented || reset();
  });

  return [pressedKeys, { event }];
});

export const useCurrentlyHeldKey = createSharedRoot<Accessor<string | null>>(() => {
  const [keys] = useKeyDownList();
  let prevKeys = untrack(keys);

  return createMemo(() => {
    const _keys = keys();
    const prev = prevKeys;
    prevKeys = _keys;
    if (prev.length === 0 && _keys.length === 1) return _keys[0];
    return null;
  });
});

export function useKeyDownSequence(): Accessor<string[][]> {
  const [keys] = useKeyDownList();
  return createMemo(prev => {
    if (keys().length === 0) return [];
    return [...prev, keys()];
  }, []);
}

export function createKeyHold(
  key: KbdKey,
  options: { preventDefault?: boolean } = {}
): Accessor<boolean> {
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

export function createShortcut(
  keys: KbdKey[],
  callback: VoidFunction,
  options: {
    preventDefault?: boolean;
    requireReset?: boolean;
  } = {}
): void {
  if (!keys.length) return;
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
