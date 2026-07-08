/*
 * Adapted from @kobaltedev/kobalte
 * https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-controllable-signal
 * Copyright (c) 2022 Kobalte Contributors — MIT License
 */

import { type Accessor, type Signal, createSignal, untrack } from "solid-js";
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
export function createControllableSignal<T>(props: CreateControllableSignalProps<T>): Signal<T | undefined> {
  // Solid 2.0 function-form createSignal: a writable derived signal that tracks props.value
  // reactively. When props.value?.() is undefined (uncontrolled), no reactive dependency is
  // created from that read, so the fn never re-runs and _setValue overrides persist.
  // When props.value?.() is defined (controlled), the dependency is tracked and the signal
  // follows the parent. Uses !== undefined rather than ?? so a controlled null is kept.
  // ownedWrite: true because _setValue is called from inside setValue which may run in a
  // reactive scope.
  const [value, _setValue] = createSignal<T | undefined>(
    () => {
      const v = props.value?.();
      return v !== undefined ? v : untrack(() => props.defaultValue?.());
    },
    { ownedWrite: true },
  );

  const setValue = (next: Exclude<T, Function> | ((prev: T) => T)) => {
    untrack(() => {
      const current = value() as T;
      const nextValue = accessWith(next, current) as T;

      if (!Object.is(nextValue, current)) {
        if (props.value?.() === undefined) {
          _setValue(nextValue as Exclude<T, Function>);
        }
        props.onChange?.(nextValue);
      }
    });
  };

  return [value, setValue] as Signal<T | undefined>;
}

/**
 * Variant of {@link createControllableSignal} for boolean values.
 * Falls back to `false` when the value is `undefined`.
 */
export function createControllableBooleanSignal(props: CreateControllableSignalProps<boolean>): Signal<boolean> {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<boolean> = () => _value() ?? false;
  return [value, setValue] as Signal<boolean>;
}

/**
 * Variant of {@link createControllableSignal} for array values.
 * Falls back to `[]` when the value is `undefined`.
 */
export function createControllableArraySignal<T>(props: CreateControllableSignalProps<Array<T>>): Signal<Array<T>> {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<Array<T>> = () => _value() ?? [];
  return [value, setValue] as Signal<Array<T>>;
}

/**
 * Variant of {@link createControllableSignal} for Set values.
 * Falls back to `new Set()` when the value is `undefined`.
 */
export function createControllableSetSignal<T>(props: CreateControllableSignalProps<Set<T>>): Signal<Set<T>> {
  const [_value, setValue] = createControllableSignal(props);
  const value: Accessor<Set<T>> = () => _value() ?? new Set();
  return [value, setValue] as Signal<Set<T>>;
}

export interface CreateToggleStateProps {
  /** The controlled selected state. */
  isSelected?: Accessor<boolean | undefined>;

  /**
   * The default selected state when initially rendered.
   * Useful when you do not need to control the selected state.
   */
  defaultIsSelected?: Accessor<boolean | undefined>;

  /** Whether the selected state cannot be changed by the user. */
  isDisabled?: Accessor<boolean | undefined>;

  /** Whether the selected state cannot be changed by the user. */
  isReadOnly?: Accessor<boolean | undefined>;

  /** Called when the selected state changes. */
  onSelectedChange?: (isSelected: boolean) => void;
}

export interface ToggleState {
  /** The selected state. */
  isSelected: Accessor<boolean>;

  /** Updates the selected state. Ignored while `isDisabled` or `isReadOnly`. */
  setIsSelected: (isSelected: boolean) => void;

  /** Flips the selected state. Ignored while `isDisabled` or `isReadOnly`. */
  toggle: () => void;
}

/**
 * Provides controllable state management for toggle components — checkboxes, switches,
 * toggle buttons — built on top of {@link createControllableBooleanSignal}.
 *
 * Adapted from Kobalte's `createToggleState`:
 * https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-toggle-state
 *
 * @see https://github.com/solidjs-community/solid-primitives/issues/280
 */
export function createToggleState(props: CreateToggleStateProps = {}): ToggleState {
  const [isSelected, _setIsSelected] = createControllableBooleanSignal({
    value: props.isSelected,
    defaultValue: props.defaultIsSelected,
    onChange: props.onSelectedChange,
  });

  const setIsSelected = (value: boolean) => {
    if (!props.isReadOnly?.() && !props.isDisabled?.()) {
      _setIsSelected(value);
    }
  };

  const toggle = () => {
    if (!props.isReadOnly?.() && !props.isDisabled?.()) {
      _setIsSelected(value => !value);
    }
  };

  return { isSelected, setIsSelected, toggle };
}
