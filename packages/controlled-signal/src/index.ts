/*
 * Adapted from @kobaltedev/kobalte
 * https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-controllable-signal
 * Copyright (c) 2022 Kobalte Contributors — MIT License
 */

import { type Accessor, createMemo, createSignal, untrack } from "solid-js";
import { accessWith } from "@solid-primitives/utils";

export interface CreateControllableSignalProps<T> {
  /** The value to be used in controlled mode. */
  value?: Accessor<T | undefined>;

  /** The initial value to be used in uncontrolled mode. */
  defaultValue?: Accessor<T | undefined>;

  /** Called when the value changes. */
  onChange?: (value: T) => void;
}

/**
 * Creates a reactive signal that can operate in either controlled or uncontrolled mode.
 *
 * In **uncontrolled** mode (no `value` prop), the signal manages its own internal state
 * starting from `defaultValue`. In **controlled** mode (`value` prop provided and not
 * `undefined`), the signal defers to the external value and calls `onChange` instead of
 * updating internal state.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/controlled-signal
 */
export function createControllableSignal<T>(props: CreateControllableSignalProps<T>) {
  // Read defaultValue once, untracked, so it doesn't create a dependency during init.
  // Cast: createSignal's overload requires Exclude<T, Function>; the caller is responsible
  // for not passing function-typed T values as defaultValue (same assumption Kobalte makes).
  // ownedWrite: true because setValue intentionally writes this from inside reactive scopes.
  const [_value, _setValue] = createSignal<T | undefined>(
    untrack(() => props.defaultValue?.()) as Exclude<T, Function> | undefined,
    { ownedWrite: true },
  );

  const isControlled = createMemo(() => props.value?.() !== undefined);
  const value = createMemo(() => (isControlled() ? props.value?.() : _value()));

  const setValue = (next: Exclude<T, Function> | ((prev: T) => T)) => {
    untrack(() => {
      // Read raw signals — not the memo — to avoid deferred-memo staleness in Solid 2.0.
      const controlled = props.value?.() !== undefined;
      const current = (controlled ? props.value?.() : _value()) as T;
      const nextValue = accessWith(next, current) as T;

      if (!Object.is(nextValue, current)) {
        if (!controlled) {
          _setValue(nextValue as Exclude<T, Function>);
        }
        props.onChange?.(nextValue);
      }
    });
  };

  return [value, setValue] as const;
}

/**
 * Variant of {@link createControllableSignal} for boolean values.
 * Falls back to `false` when the value is `undefined`.
 */
export function createControllableBooleanSignal(props: CreateControllableSignalProps<boolean>) {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<boolean> = () => _value() ?? false;
  return [value, setValue] as const;
}

/**
 * Variant of {@link createControllableSignal} for array values.
 * Falls back to `[]` when the value is `undefined`.
 */
export function createControllableArraySignal<T>(props: CreateControllableSignalProps<Array<T>>) {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<Array<T>> = () => _value() ?? [];
  return [value, setValue] as const;
}

/**
 * Variant of {@link createControllableSignal} for Set values.
 * Falls back to `new Set()` when the value is `undefined`.
 */
export function createControllableSetSignal<T>(props: CreateControllableSignalProps<Set<T>>) {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<Set<T>> = () => _value() ?? new Set();
  return [value, setValue] as const;
}
