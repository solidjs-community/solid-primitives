import { CheckboxGroupState } from "./createCheckboxGroupState";

/**
 * key/value pair of `CheckboxGroupState` and checkbox group name.
 * Used to pass `name` prop to descendant `createCheckboxGroupItem`,
 * since we can't use context with only primitives.
 */
export const checkboxGroupNames = new WeakMap<CheckboxGroupState, string | undefined>();
