/*
 * Portions of this file are based on code from Kobalte.
 * MIT Licensed, Copyright (c) 2022 Kobalte contributors.
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/form-control/
 *
 * Which itself is based on code from react-spectrum by Adobe.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/70e7caf1946c423bc9aa9cb0e50dbdbe953d239b/packages/@react-aria/label/src/useField.ts
 */

import type { Context } from "solid-js";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  useContext,
} from "solid-js";
import { access } from "@solid-primitives/utils";
import type {
  CreateFormControlInputProps,
  CreateFormControlProps,
  FormControlContextValue,
  FormControlDataSet,
} from "./types.ts";

/**
 * Solid context that carries the `FormControlContextValue` produced by `createFormControl`.
 * Provide it with `<FormControlContext value={ctx}>` and consume it with `useFormControl()`.
 */
export const FormControlContext: Context<FormControlContextValue | undefined> = createContext<FormControlContextValue | undefined>(undefined);

/**
 * Reads `FormControlContext` from the nearest ancestor `<FormControlContext>` provider.
 * Throws a descriptive error if called outside a provider — use this in sub-components
 * (`TextFieldLabel`, `TextFieldInput`, etc.) that must always be rendered inside a root.
 */
export function useFormControl(): FormControlContextValue {
  const ctx = useContext(FormControlContext);
  if (ctx === undefined) {
    throw new Error(
      "[solid-primitives]: `useFormControl` must be used within a `<FormControlContext>` component",
    );
  }
  return ctx;
}

/** Returns a registration function: calling it sets the ID signal; the returned cleanup clears it. */
function createRegisterId(setter: (id: string | undefined) => void) {
  return (id: string): (() => void) => {
    setter(id);
    return () => setter(undefined);
  };
}

/**
 * Creates the ARIA accessibility context for a labeled form field group.
 *
 * Tracks which sub-elements (label, field, description, error message) are currently mounted,
 * and computes the correct `aria-labelledby` / `aria-describedby` chains. Pass the returned
 * value to `<FormControlContext>` so descendant components can register themselves.
 *
 * @param props - Field metadata: `id`, `name`, `validationState`, `required`, `disabled`, `readOnly`.
 *   All props accept static values or reactive accessors.
 * @returns `FormControlContextValue` — spread onto `<FormControlContext value={ctx}>`.
 *
 * @example
 * ```tsx
 * // Minimal usage — plain DOM, no sub-components
 * const ctx = createFormControl({ id: "email", validationState: () => error ? "invalid" : undefined });
 * onCleanup(ctx.registerLabel("email-label"));
 *
 * return (
 *   <FormControlContext value={ctx}>
 *     <label id="email-label">Email</label>
 *     <input
 *       aria-labelledby={ctx.getAriaLabelledBy("email-input", undefined, undefined)}
 *       aria-describedby={ctx.getAriaDescribedBy(undefined)}
 *     />
 *   </FormControlContext>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Kobalte-style sub-component pattern
 * const TextFieldRoot = (props) => {
 *   const ctx = createFormControl(props);
 *   return <FormControlContext value={ctx}>{props.children}</FormControlContext>;
 * };
 * ```
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/a11y
 */
export function createFormControl(props: CreateFormControlProps): FormControlContextValue {
  // Lazy: only call createUniqueId() if no explicit id is provided.
  // In SSR mode, createUniqueId() requires a renderToString context; callers
  // that always supply an explicit id (including SSR renders) never pay this cost.
  let _defaultId: string | undefined;
  const id = () => access(props.id) ?? (_defaultId ??= `form-control-${createUniqueId()}`);

  const [labelId, setLabelId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [fieldId, setFieldId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [errorMessageId, setErrorMessageId] = createSignal<string | undefined>(undefined, { ownedWrite: true });

  const generateId = (part: string) => `${id()}-${part}`;

  const getAriaLabelledBy = (
    fieldId: string | undefined,
    fieldAriaLabel: string | undefined,
    fieldAriaLabelledBy: string | undefined,
  ): string | undefined => {
    const hasAriaLabelledBy = fieldAriaLabelledBy != null || labelId() != null;
    return (
      [
        fieldAriaLabelledBy,
        labelId(),
        // When both an explicit aria-label and a labelledby source are present,
        // add the field's own ID so screen readers announce both.
        hasAriaLabelledBy && fieldAriaLabel != null ? fieldId : undefined,
      ]
        .filter(Boolean)
        .join(" ") || undefined
    );
  };

  // Use aria-describedby for error message because aria-errormessage is
  // unsupported in VoiceOver and NVDA. See:
  // https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
  const getAriaDescribedBy = (fieldAriaDescribedBy: string | undefined): string | undefined => {
    return (
      [descriptionId(), errorMessageId(), fieldAriaDescribedBy].filter(Boolean).join(" ") ||
      undefined
    );
  };

  const dataset = createMemo<FormControlDataSet>(() => ({
    "data-valid": access(props.validationState) === "valid" ? "" : undefined,
    "data-invalid": access(props.validationState) === "invalid" ? "" : undefined,
    "data-required": access(props.required) ? "" : undefined,
    "data-disabled": access(props.disabled) ? "" : undefined,
    "data-readonly": access(props.readOnly) ? "" : undefined,
  }));

  return {
    name: () => access(props.name) ?? id(),
    dataset,
    validationState: () => access(props.validationState),
    isRequired: () => access(props.required),
    isDisabled: () => access(props.disabled),
    isReadOnly: () => access(props.readOnly),
    labelId,
    fieldId,
    descriptionId,
    errorMessageId,
    getAriaLabelledBy,
    getAriaDescribedBy,
    generateId,
    registerLabel: createRegisterId(setLabelId),
    registerField: createRegisterId(setFieldId),
    registerDescription: createRegisterId(setDescriptionId),
    registerErrorMessage: createRegisterId(setErrorMessageId),
  };
}

/**
 * Reads the nearest `FormControlContext` and returns pre-computed ARIA props for the actual
 * input element. Must be called inside a component that is rendered within a
 * `<FormControlContext>` provider (i.e. inside a `TextFieldRoot` or equivalent).
 *
 * Registers the input's ID with `context.registerField` so the context always knows which
 * element is the interactive control — used to build the correct `aria-labelledby` chain when
 * both a visible label and an `aria-label` prop are present.
 *
 * @param props - Optional overrides: explicit `id`, `aria-label`, `aria-labelledby`,
 *   `aria-describedby`. Merged with context-registered IDs; all accept reactive accessors.
 * @returns `{ fieldProps }` — an object whose properties are reactive accessors ready to
 *   spread onto an `<input>` (or any focusable element).
 *
 * @example
 * ```tsx
 * const TextFieldInput = (props) => {
 *   const { fieldProps } = createFormControlInput();
 *   const ctx = useFormControl();
 *   return (
 *     <input
 *       id={fieldProps.id()}
 *       aria-labelledby={fieldProps.ariaLabelledBy()}
 *       aria-describedby={fieldProps.ariaDescribedBy()}
 *       aria-invalid={ctx.validationState() === "invalid" ? "true" : undefined}
 *     />
 *   );
 * };
 * ```
 */
export function createFormControlInput(props: CreateFormControlInputProps = {}): {
  fieldProps: {
    id: () => string;
    ariaLabel: () => string | undefined;
    ariaLabelledBy: () => string | undefined;
    ariaDescribedBy: () => string | undefined;
  };
} {
  const context = useFormControl();

  const id = () => access(props.id) ?? context.generateId("field");

  // Re-registers whenever the id changes (e.g. when `props.id` is a reactive accessor).
  // The split-effect apply phase returns the previous cleanup so Solid disposes it before
  // running the next registration.
  createEffect(
    () => id(),
    (id) => context.registerField(id),
  );

  return {
    fieldProps: {
      id,
      ariaLabel: (): string | undefined => access(props["aria-label"]),
      ariaLabelledBy: (): string | undefined =>
        context.getAriaLabelledBy(
          id(),
          access(props["aria-label"]),
          access(props["aria-labelledby"]),
        ),
      ariaDescribedBy: (): string | undefined =>
        context.getAriaDescribedBy(access(props["aria-describedby"])),
    },
  };
}
