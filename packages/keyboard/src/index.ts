import { makeEventListener } from "@solid-primitives/event-listener";
import { createSingletonRoot } from "@solid-primitives/rootless";
import {
  arrayEquals,
  INTERNAL_OPTIONS,
  type MaybeAccessor,
  access,
  tryOnCleanup,
} from "@solid-primitives/utils";
import { type Accessor, createEffect, createMemo, createSignal, untrack } from "solid-js";
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

/** Does `subset` contain only keys that are also present in `superset`? */
function isKeySubset(subset: string[], superset: string[]): boolean {
  return new Set(subset).isSubsetOf(new Set(superset));
}

/** Do `a` and `b` contain exactly the same keys, regardless of order? */
function isSameKeySet(a: string[], b: string[]): boolean {
  return new Set(a).symmetricDifference(new Set(b)).size === 0;
}

/**
 * Remembers which logical key value was recorded at keydown for each PHYSICAL key, so the right
 * one is removed on keyup. `KeyboardEvent.key` can change between press and release (hold Shift,
 * press `1` -> `!`, release Shift, release `1` -> `1`), which would otherwise leave `!` stuck.
 */
function createKeyRecorder() {
  const recorded = new Map<string, string>();
  const id = (e: KeyboardEvent) => e.code || e.key;
  return {
    /** Records the normalized `key` for the physical key of `e`. */
    down: (e: KeyboardEvent, key: string) => void recorded.set(id(e), key),
    /** Returns the value recorded at keydown (falling back to the upper-cased `e.key`) and forgets it. */
    up(e: KeyboardEvent): string {
      const physical = id(e);
      const key = recorded.get(physical) ?? e.key.toUpperCase();
      recorded.delete(physical);
      return key;
    },
    clear: () => recorded.clear(),
  };
}

/**
 * True when `key` (a normalized key name) is a modifier whose event flag is still set after its
 * keyup, meaning another physical key of the same modifier (e.g. ControlRight after ControlLeft)
 * is still held. The modifier must then stay in the pressed list.
 */
function isModifierStillHeld(key: string, e: KeyboardEvent): boolean {
  switch (key) {
    case "CONTROL":
      return e.ctrlKey;
    case "SHIFT":
      return e.shiftKey;
    case "ALT":
      return e.altKey;
    case "META":
      return e.metaKey;
    default:
      return false;
  }
}

/**
 * Lock keys. macOS sends only a keydown when CapsLock is switched on and only a keyup when it is
 * switched off, so they can never be tracked as "held". They are ignored entirely.
 */
function isLockKey(key: string): boolean {
  switch (key.toUpperCase()) {
    case "CAPSLOCK":
    case "NUMLOCK":
    case "SCROLLLOCK":
      return true;
    default:
      return false;
  }
}

/**
 * The element an event really originated from. `event.target` is retargeted to the shadow host
 * when the listener sits outside an open shadow root; `composedPath()[0]` is the inner element.
 */
function getRealTarget(e: Event): EventTarget | null {
  const path = typeof e.composedPath === "function" ? e.composedPath() : undefined;
  return path && path.length ? path[0]! : e.target;
}

/** Realm-safe `instanceof Node` (an iframe's nodes are not instances of this window's `Node`). */
function isNode(value: unknown): value is Node {
  return !!value && typeof (value as Node).nodeType === "number";
}

/**
 * `<input>` types that never accept typed characters. Everything else (including a missing or
 * unknown type, which is a text input) is treated as editable, so types that consume keys such as
 * arrows or typeahead (radio, range, file, color, ...) stay ignored.
 */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "checkbox",
  "button",
  "submit",
  "reset",
  "image",
]);

function getInputType(el: HTMLElement): string {
  let type: unknown = (el as HTMLInputElement).type;
  if (typeof type !== "string" && typeof el.getAttribute === "function") {
    type = el.getAttribute("type");
  }
  return typeof type === "string" ? type.toLowerCase() : "";
}

/**
 * Is the event target an editable control, or inside a `contenteditable` element?
 * `<input>` types that never accept typed characters (checkbox, button, submit, reset, image) are
 * not editable. Duck-typed, so it also works for elements that belong to another realm (iframes).
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!isNode(target) || target.nodeType !== 1) return false;
  const el = target as HTMLElement;
  switch (typeof el.tagName === "string" ? el.tagName.toUpperCase() : "") {
    case "INPUT":
      return !NON_TEXT_INPUT_TYPES.has(getInputType(el));
    case "TEXTAREA":
    case "SELECT":
      return true;
    default:
      return !!el.isContentEditable;
  }
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
 * createEffect(
 *   () => event(), // => KeyboardEvent | null
 *   e => {
 *     console.log(e);
 *     if (e) {
 *       console.log(e.key); // => "Q" | "ALT" | ...
 *       e.preventDefault();
 *     }
 *   },
 * );
 * ```
 */
export const useKeyDownEvent: ReturnType<
  typeof createSingletonRoot<Accessor<KeyboardEvent | null>>
> = /*#__PURE__*/ createSingletonRoot<Accessor<KeyboardEvent | null>>(() => {
  if (isServer) {
    return () => null;
  }

  const [event, setEvent] = createSignal<KeyboardEvent | null>(null, INTERNAL_OPTIONS);

  makeEventListener(window, "keydown", e => {
    setEvent(e);
    setTimeout(() => setEvent(null));
  });

  return event;
});

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
 * createEffect(
 *   () => keys(), // => ["ALT", "CONTROL", "Q", "A"]
 *   keys => console.log(keys),
 * );
 * ```
 */
export const useKeyDownList: ReturnType<typeof createSingletonRoot<Accessor<string[]>>> =
  /*#__PURE__*/ createSingletonRoot<Accessor<string[]>>(() => {
    if (isServer) {
      return () => [];
    }

    const [pressedKeys, setPressedKeys] = createSignal<string[]>([], INTERNAL_OPTIONS);
    const recorder = createKeyRecorder();
    const reset = () => {
      recorder.clear();
      setPressedKeys([]);
    };

    makeEventListener(window, "keydown", e => {
      // e.key may be undefined when used with <datalist> el
      // gh issue: https://github.com/solidjs-community/solid-primitives/issues/246
      if (e.repeat || typeof e.key !== "string" || isLockKey(e.key)) return;

      const key = e.key.toUpperCase(),
        currentKeys = pressedKeys();

      if (currentKeys.includes(key)) return;

      recorder.down(e, key);
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

    // Capture phase: an app handler calling stopPropagation() on keyup must not leave keys stuck.
    makeEventListener(
      window,
      "keyup",
      e => {
        if (typeof e.key !== "string" || isLockKey(e.key)) return;
        const key = recorder.up(e);
        // macOS never fires keyup for other keys held down together with Meta —
        // only Meta's own keyup arrives — so its release must clear everything,
        // or the other keys' stale state corrupts the next press.
        // See https://github.com/solidjs-community/solid-primitives/issues/269
        if (isModifierStillHeld(key, e)) return;
        if (key === "META") {
          reset();
        } else {
          setPressedKeys(prev => prev.filter(_key => _key !== key));
        }
      },
      { capture: true },
    );

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
 * createEffect(
 *   () => key(), // => "Q" | "ALT" | ... or null
 *   key => console.log(key),
 * );
 * ```
 */
export const useCurrentlyHeldKey: ReturnType<typeof createSingletonRoot<Accessor<string | null>>> =
  /*#__PURE__*/ createSingletonRoot<Accessor<string | null>>(() => {
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
  });

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
 * createEffect(
 *   () => sequence(), // => string[][]
 *   sequence => console.log(sequence),
 * );
 * ```
 */
export const useKeyDownSequence: ReturnType<typeof createSingletonRoot<Accessor<string[][]>>> =
  /*#__PURE__*/ createSingletonRoot<Accessor<string[][]>>(() => {
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
 * createEffect(
 *   () => isHeld(), // => boolean
 *   held => console.log(held),
 * );
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
 * - `ignoreWithinInputs` — If `true`, the shortcut is ignored while focus is on an `input`, `textarea`, `select`,
 *   or `contenteditable` element, so typing isn't interrupted. Inputs that never accept typed characters
 *   (`type` = `checkbox`, `button`, `submit`, `reset`, `image`) do not count, so the shortcut still fires there;
 *   `radio`, `range`, `file` and `color` stay ignored because they use arrow and other keys. Disabled by default — enable it for shortcuts
 *   made of plain, unmodified keys (e.g. a single letter); combos like `Control+S` are usually fine either way,
 *   since the modifier prevents a character from being typed.
 * - `anyOrder` — If `true`, the keys can be pressed in any order (e.g. `Shift+Control` as well as `Control+Shift`),
 *   as long as they all end up held down together. Disabled by default, requiring `keys` to be pressed in order.
 *
 * @example
 * ```ts
 * createShortcut(["CONTROL", "SHIFT", "C"], () => {
 *    console.log("Ctrl+Shift+C was pressed");
 * });
 *
 * // won't fire while typing in a text field
 * createShortcut(["S"], () => console.log("S was pressed"), { ignoreWithinInputs: true });
 *
 * // triggers for both Control+Shift+M and Shift+Control+M
 * createShortcut(["Control", "Shift", "M"], () => console.log("M was pressed"), { anyOrder: true });
 * ```
 */
export function createShortcut(
  keys: KbdKey[],
  callback: (event: KeyboardEvent | null) => void,
  options: {
    preventDefault?: boolean;
    requireReset?: boolean;
    ignoreWithinInputs?: boolean;
    anyOrder?: boolean;
  } = {},
): void {
  if (isServer || !keys.length) {
    return;
  }

  keys = keys.map(key => key.toUpperCase());
  const {
    preventDefault = true,
    requireReset = false,
    ignoreWithinInputs = false,
    anyOrder = false,
  } = options;

  // Track pressed keys and sequence locally with plain JS state rather than
  // reactive signals. A signal reads from event listeners return
  // the pre-batch committed value, so synchronous shortcut checking requires
  // imperative state that's updated in the same event listener tick.
  let pressedKeys: string[] = [];
  let sequence: string[][] = [];
  let reset = false;
  const recorder = createKeyRecorder();

  const resetAll = () => {
    recorder.clear();
    pressedKeys = [];
    sequence = [];
    reset = false;
  };

  makeEventListener(window, "keydown", (e: KeyboardEvent) => {
    if (e.repeat || typeof e.key !== "string" || isLockKey(e.key)) return;
    if (ignoreWithinInputs && isEditableTarget(getRealTarget(e))) return;
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
      recorder.down(e, key);
      pressedKeys = newKeys;
      sequence = [...sequence, [...pressedKeys]];
    }

    if (requireReset) {
      if (reset) return;
      if (sequence.length < keys.length) {
        const holding = sequence.at(-1) ?? [];
        const matches = anyOrder
          ? isKeySubset(holding, keys)
          : equalsKeyHoldSequence(sequence, keys.slice(0, sequence.length));
        if (matches) {
          preventDefault && e.preventDefault();
        } else {
          reset = true;
        }
      } else {
        reset = true;
        const holding = sequence.at(-1) ?? [];
        const matches = anyOrder
          ? isSameKeySet(holding, keys)
          : equalsKeyHoldSequence(sequence, keys);
        if (matches) {
          preventDefault && e.preventDefault();
          callback(e);
        }
      }
    } else {
      const last = sequence.at(-1);
      if (!last) return;

      if (preventDefault && last.length < keys.length) {
        const isOneKeyAway = anyOrder
          ? last.length === keys.length - 1 && isKeySubset(last, keys)
          : arrayEquals(last, keys.slice(0, keys.length - 1));
        if (isOneKeyAway) {
          e.preventDefault();
        }
        return;
      }
      const isComplete = anyOrder ? isSameKeySet(last, keys) : arrayEquals(last, keys);
      if (isComplete) {
        const prev = sequence.at(-2);
        const prevWasOneKeyAway = anyOrder
          ? !!prev && prev.length === keys.length - 1 && isKeySubset(prev, keys)
          : !!prev && arrayEquals(prev, keys.slice(0, keys.length - 1));
        if (!prev || prevWasOneKeyAway) {
          preventDefault && e.preventDefault();
          callback(e);
        }
      }
    }
  });

  // Capture phase: an app handler calling stopPropagation() on keyup must not leave keys stuck.
  const onKeyUp = (e: KeyboardEvent) => {
    if (typeof e.key !== "string" || isLockKey(e.key)) return;
    const key = recorder.up(e);

    // macOS never fires keyup for other keys held down together with Meta —
    // only Meta's own keyup arrives. Treat it as a signal that every other
    // tracked key must have been released too, or their stale state corrupts
    // the next press (see https://github.com/solidjs-community/solid-primitives/issues/269).
    if (isModifierStillHeld(key, e)) return;
    if (key === "META") {
      resetAll();
      return;
    }

    pressedKeys = pressedKeys.filter(k => k !== key);
    if (pressedKeys.length === 0) {
      sequence = [];
      reset = false;
    } else {
      // Reset sequence to remaining held keys so repeated presses of the last
      // key can re-trigger the shortcut while modifier keys stay held.
      sequence = [[...pressedKeys]];
    }
  };
  makeEventListener(window, "keyup", onKeyUp, { capture: true });

  makeEventListener(window, "blur", resetAll);
  makeEventListener(window, "contextmenu", (e: MouseEvent) => {
    e.defaultPrevented || resetAll();
  });
}

export interface CreateKeyDownOptions {
  /** Whether the listener should be inactive. */
  disabled?: MaybeAccessor<boolean | undefined>;
  /** The document to attach the listener to. Defaults to `window.document`. Useful for iframes. */
  ownerDocument?: Accessor<Document | undefined>;
}

/**
 * Listens for a keydown event for a specific key on a document.
 * Supports a custom `ownerDocument` for use in iframes and portals.
 *
 * @param key The key to listen for (matched against `event.key`).
 * @param callback Handler called when the key is pressed.
 * @param options `disabled` and `ownerDocument` accessors.
 *
 * @example
 * ```ts
 * createKeyDown("Escape", e => close(), {
 *   ownerDocument: () => iframeEl.contentDocument ?? document,
 * });
 * ```
 */
export function createKeyDown(
  key: KbdKey,
  callback: (event: KeyboardEvent) => void,
  options?: CreateKeyDownOptions,
): void {
  if (isServer) return;

  createEffect(
    () => ({
      disabled: !!access(options?.disabled),
      document: options?.ownerDocument?.() ?? window.document,
    }),
    ({ disabled, document }: { disabled: boolean; document: Document }) => {
      if (disabled) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === key) callback(e);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    },
    { transparent: true },
  );
}

// ---------------------------------------------------------------------------
// Shortcut registry
// ---------------------------------------------------------------------------

/** A shortcut definition accepted by {@link makeShortcutRegistry} and {@link createShortcuts}. */
export interface ShortcutDefinition {
  /**
   * The keys that make up the shortcut, as an array (`["Control", "K"]`) or a `+`-joined string
   * (`"Control+K"`, `"Ctrl+Shift++"`). Matching is case-insensitive, order-independent and exact:
   * the held keys must be the same set. `Ctrl`, `Cmd`/`Command`, `Option` and `Space` are aliases.
   */
  keys: KbdKey[] | string;
  /** Called when the shortcut is triggered. */
  handler: (event: KeyboardEvent) => void;
  /** Call `preventDefault()` on the triggering event. Defaults to `true`. */
  preventDefault?: boolean;
  /** Fire only once until all keys have been released. Defaults to `false`. */
  requireReset?: boolean;
  /**
   * Ignore the shortcut while focus is in an input, textarea, select or contenteditable. Inputs that
   * never accept typed characters (`checkbox`, `button`, `submit`, `reset`, `image`) do not count;
   * `radio`, `range`, `file` and `color` stay ignored (they use arrow and other keys). Defaults to `false`.
   */
  ignoreInputs?: boolean;
  /** Read when a key is pressed; a disabled shortcut does not match and does not block others. Defaults to `true`. */
  enabled?: MaybeAccessor<boolean | undefined>;
}

export interface ShortcutRegistryOptions {
  /** Element (or any event target) to listen on. Defaults to `window`. An element only sees keys while focus is inside it. */
  scope?: EventTarget;
}

export interface ShortcutRegistry {
  /** Registers a shortcut. Returns a function that unregisters it. */
  register(definition: ShortcutDefinition): VoidFunction;
  /** Unregisters every shortcut and removes the underlying listeners. */
  clear(): void;
}

const KEY_ALIASES: Record<string, string> = {
  CTRL: "CONTROL",
  CMD: "META",
  COMMAND: "META",
  OPTION: "ALT",
  SPACE: " ",
};

/** Normalises a key list or `+`-joined string to a de-duplicated list of upper-cased keys. */
function normalizeShortcutKeys(keys: KbdKey[] | string): string[] {
  const list = typeof keys === "string" ? keys.split(/(?<=.)\+(?=.)/) : keys;
  const out = new Set<string>();
  for (const k of list) {
    const key = k === " " ? k : k.trim();
    if (!key) continue;
    const upper = key.toUpperCase();
    out.add(KEY_ALIASES[upper] ?? upper);
  }
  return [...out];
}

const MODIFIER_FLAGS = [
  ["SHIFT", "shiftKey"],
  ["ALT", "altKey"],
  ["CONTROL", "ctrlKey"],
  ["META", "metaKey"],
] as const;

interface RegistryEntry {
  keys: Set<string>;
  def: ShortcutDefinition;
  fired: boolean;
}

/**
 * Creates a registry of keyboard shortcuts that shares ONE `keydown`/`keyup` listener pair
 * (plus `blur`/`contextmenu` resets) between all of them. Listeners are attached when the first
 * shortcut is registered and removed when the last one is unregistered, or on `clear()`.
 *
 * **Conflict policy:** at most one shortcut fires per keydown. Shortcuts are matched on the exact
 * key set, so all candidates are equally specific; among the *eligible* ones (enabled, not
 * suppressed by `ignoreInputs`, not blocked by `requireReset`) the **most recently registered wins**.
 * An ineligible shortcut never shadows an earlier one. Only the winner's `preventDefault` applies.
 *
 * If called inside an owner, the registry is cleared automatically on cleanup. Returns an inert
 * registry on the server.
 *
 * @example
 * ```ts
 * const registry = makeShortcutRegistry();
 * const off = registry.register({ keys: "Control+K", handler: () => openPalette() });
 * off(); // unregister one
 * registry.clear(); // remove everything
 * ```
 */
export function makeShortcutRegistry(options: ShortcutRegistryOptions = {}): ShortcutRegistry {
  if (isServer) {
    return { register: () => () => {}, clear: () => {} };
  }

  const entries: RegistryEntry[] = [];
  let removeListeners: VoidFunction | undefined;
  let pressed: string[] = [];
  const recorder = createKeyRecorder();

  const resetState = () => {
    recorder.clear();
    pressed = [];
    for (const entry of entries) entry.fired = false;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || typeof e.key !== "string" || isLockKey(e.key)) return;
    const key = e.key.toUpperCase();

    // modifier flags on the event are authoritative: adds modifiers held before we started
    // listening and drops stale ones (e.g. a missed keyup on macOS)
    const next = pressed.filter(k => !MODIFIER_FLAGS.some(([name]) => name === k));
    const isModifier = MODIFIER_FLAGS.some(([name]) => name === key);
    const mods = MODIFIER_FLAGS.filter(
      ([name, flag]) => e[flag] || (isModifier && name === key),
    ).map(([name]) => name);
    pressed = [...mods, ...next.filter(k => !mods.includes(k as never))];
    if (!pressed.includes(key)) pressed.push(key);
    recorder.down(e, key);

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i]!;
      const { def } = entry;
      if (entry.keys.size !== pressed.length || !entry.keys.has(key)) continue;
      if (!pressed.every(k => entry.keys.has(k))) continue;
      if (def.requireReset && entry.fired) continue;
      if (def.ignoreInputs && isEditableTarget(getRealTarget(e))) continue;
      if (access(def.enabled) === false) continue;

      entry.fired = true;
      if (def.preventDefault !== false) e.preventDefault();
      def.handler(e);
      return; // the winner takes it all
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (typeof e.key !== "string" || isLockKey(e.key)) return;
    const key = recorder.up(e);
    // macOS fires no keyup for keys held together with Meta; its release clears everything
    // (https://github.com/solidjs-community/solid-primitives/issues/269)
    if (isModifierStillHeld(key, e)) return;
    if (key === "META") return resetState();
    pressed = pressed.filter(k => k !== key);
    if (pressed.length === 0) for (const entry of entries) entry.fired = false;
  };

  const attach = () => {
    const scope = options.scope;
    const keydownTarget = scope ?? window;
    // Raw listeners: makeEventListener would bind cleanup to whichever owner happens to call
    // register() first, silently killing the registry when that owner is disposed.
    const onContextMenu = (e: MouseEvent) => {
      e.defaultPrevented || resetState();
    };
    // Focus moving out of the scope (e.g. Tab) means the matching keyups land elsewhere.
    // A null relatedTarget is the blur / window-switch case, which is reset by window "blur".
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget;
      // duck-typed: scopes and focus targets may belong to another realm (iframe document)
      if (isNode(scope) && isNode(next) && !scope.contains(next)) resetState();
    };
    keydownTarget.addEventListener("keydown", onKeyDown as (e: Event) => void);
    // Activation is scoped, but releases are always tracked on window in the capture phase, so a
    // key released after focus has moved outside the scope, or whose keyup an app handler stops
    // from propagating, doesn't stay "pressed".
    const keyupCapture = true;
    // A scope whose events never reach window (bare EventTarget) needs its own keyup listener.
    // Registered in the capture phase too, so an app handler stopping keyup inside an iframe scope
    // cannot leave a key stuck. One event reaching both listeners is handled only once.
    const ownKeyUp = !!scope && (scope as unknown) !== window;
    let lastKeyUp: Event | undefined;
    const handleKeyUp = (e: Event) => {
      if (ownKeyUp) {
        if (e === lastKeyUp) return;
        lastKeyUp = e;
      }
      onKeyUp(e as KeyboardEvent);
    };
    window.addEventListener("keyup", handleKeyUp, keyupCapture);
    if (ownKeyUp) scope!.addEventListener("keyup", handleKeyUp, keyupCapture);
    scope?.addEventListener("focusout", onFocusOut as (e: Event) => void);
    window.addEventListener("blur", resetState);
    window.addEventListener("contextmenu", onContextMenu as (e: Event) => void);
    removeListeners = () => {
      keydownTarget.removeEventListener("keydown", onKeyDown as (e: Event) => void);
      window.removeEventListener("keyup", handleKeyUp, keyupCapture);
      if (ownKeyUp) scope!.removeEventListener("keyup", handleKeyUp, keyupCapture);
      scope?.removeEventListener("focusout", onFocusOut as (e: Event) => void);
      window.removeEventListener("blur", resetState);
      window.removeEventListener("contextmenu", onContextMenu as (e: Event) => void);
    };
  };

  const detach = () => {
    removeListeners?.();
    removeListeners = undefined;
    resetState();
  };

  const clear = () => {
    entries.length = 0;
    detach();
  };

  const register = (def: ShortcutDefinition): VoidFunction => {
    const keys = normalizeShortcutKeys(def.keys);
    if (!keys.length) return () => {};
    const entry: RegistryEntry = { keys: new Set(keys), def, fired: false };
    entries.push(entry);
    if (!removeListeners) attach();
    return () => {
      const i = entries.indexOf(entry);
      if (i === -1) return;
      entries.splice(i, 1);
      if (!entries.length) detach();
    };
  };

  tryOnCleanup(clear);

  return { register, clear };
}

export type ShortcutOptions = Omit<ShortcutDefinition, "keys" | "handler">;
/** Shortcuts as a list, or as a map of key combination to handler / handler + options. */
export type ShortcutsInput =
  | ShortcutDefinition[]
  | Record<
      string,
      ShortcutDefinition["handler"] | (ShortcutOptions & Pick<ShortcutDefinition, "handler">)
    >;

function toDefinitions(input: ShortcutsInput | undefined): ShortcutDefinition[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return Object.entries(input).map(([keys, value]) =>
    typeof value === "function" ? { keys, handler: value } : { ...value, keys },
  );
}

/**
 * Registers many keyboard shortcuts at once through a single listener pair
 * (see {@link makeShortcutRegistry} for the conflict policy: most recently registered eligible
 * shortcut wins, which here means the **last matching entry** of the list / map).
 *
 * The shortcuts may be an accessor; when it changes, the shortcuts are re-registered.
 * Do not read signals from `handler`/`enabled` expecting tracking — they run on key events.
 * Prefer an `enabled` accessor over swapping the list for toggling a shortcut.
 *
 * @param shortcuts A list of {@link ShortcutDefinition}, or a map of `"Control+K"` to handler or `{ handler, ...options }`; or an accessor of either.
 * @param options `scope` — element to listen on instead of `window` (may be an accessor).
 *
 * @example
 * ```ts
 * createShortcuts({
 *   "Control+K": () => openPalette(),
 *   "Escape": { handler: close, enabled: isOpen },
 * });
 * ```
 */
export function createShortcuts(
  shortcuts: MaybeAccessor<ShortcutsInput>,
  options: { scope?: MaybeAccessor<EventTarget | undefined> } = {},
): void {
  if (isServer) return;

  createEffect(
    () => ({ defs: toDefinitions(access(shortcuts)), scope: access(options.scope) }),
    ({ defs, scope }) => {
      const registry = makeShortcutRegistry({ scope });
      for (const def of defs) registry.register(def);
      return () => registry.clear();
    },
    { transparent: true },
  );
}
