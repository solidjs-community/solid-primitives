import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal } from "solid-js";

import { isUndefined } from "./assertion";
import { runIfFn } from "./function";

export interface CreateControllableSignalProps<T> {
  /**
   * The value to be used, in controlled mode.
   */
  value?: MaybeAccessor<T | undefined>;

  /**
   * The initial value to be used, in uncontrolled mode.
   */
  defaultValue?: MaybeAccessor<T | undefined>;

  /**
   * The callback fired when the value changes.
   */
  onChange?: (value: T) => void;
}

/**
 * Creates a simple reactive state with a getter and setter,
 * that can be controlled with `value` and `onChange` props.
 */
export function createControllableSignal<T>(props: CreateControllableSignalProps<T>) {
  // Internal uncontrolled value
  // eslint-disable-next-line solid/reactivity
  const [_value, _setValue] = createSignal(access(props.defaultValue));

  const isControlled = createMemo(() => !isUndefined(access(props.value)));

  const value = createMemo(() => (isControlled() ? access(props.value) : _value()));

  const setValue = (next: Exclude<T, Function> | ((prev: T) => T)) => {
    const nextValue = runIfFn(next, value() as T);

    if (!Object.is(nextValue, value())) {
      if (!isControlled()) {
        _setValue(nextValue as Exclude<T, Function>);
      }

      props.onChange?.(nextValue);
    }

    return nextValue;
  };

  return [value, setValue] as const;
}

/**
 * Creates a simple reactive boolean state with a getter and setter,
 * that can be controlled with `value` and `onChange` props.
 */
export function createControllableBooleanSignal(props: CreateControllableSignalProps<boolean>) {
  const [_value, setValue] = createControllableSignal(props);

  const value: Accessor<boolean> = () => _value() ?? false;

  return [value, setValue] as const;
}
