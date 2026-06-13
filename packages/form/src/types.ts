import type { Accessor } from "solid-js";
import type { MaybeAccessor } from "@solid-primitives/utils";

/** A field validator. Return an error string on failure, `null` when valid, or a Promise resolving to either. */
export type ValidatorFn<V = string> = (value: V) => string | null | Promise<string | null>;

/** Configuration for a single form field. */
export type FieldConfig<V = string> = {
  /** Initial (and reset-target) value. The field's value type `V` is inferred from this. */
  initial: V;
  /** One or more validators. Sync validators run first and short-circuit; async validators run after all sync ones pass. */
  validate?: ValidatorFn<V> | ValidatorFn<V>[];
  /** When to expose this field's error in `field.error()`. Overrides the form-level `validateOn`. */
  validateOn?: "change" | "blur" | "submit";
};

/** A map of field names to their configs. The shape of this object determines the form's value type. */
export type FieldsConfig = Record<string, FieldConfig<any>>;

/** Extracts the value type `V` from a `FieldConfig<V>`. */
export type InferValue<C> = C extends FieldConfig<infer V> ? V : never;

/** Reactive accessors and imperative setters for a single form field. */
export type FormField<V = string> = {
  /** Current field value. */
  value: Accessor<V>;
  /** First validation error, or `null` when valid. Respects `validateOn`. */
  error: Accessor<string | null>;
  /** `true` after the field has been blurred at least once. */
  touched: Accessor<boolean>;
  /** `true` while an async validator is in flight for this field. */
  pending: Accessor<boolean>;
  /** Imperatively update the field value. Clears any external error set via `setError`. */
  setValue: (v: V) => void;
  /** Imperatively set the touched flag. */
  setTouched: (v: boolean) => void;
  /** Inject an external error (e.g. from a server response). Cleared automatically when `setValue` is called. */
  setError: (error: string | null) => void;
  /** Reset this field to its initial value, clear touched, and clear any external error. */
  reset: () => void;
};

/** The object returned by `createForm`. */
export type FormReturn<C extends FieldsConfig> = {
  /** Per-field reactive accessors and setters, keyed by field name. */
  fields: { [K in keyof C]: FormField<InferValue<C[K]>> };
  /** Reactive snapshot of all current field values. */
  values: Accessor<{ [K in keyof C]: InferValue<C[K]> }>;
  /** Fields that currently have errors, keyed by name. Always reflects true validity regardless of `validateOn`. Cross-field errors from `validate()` are not included. */
  errors: Accessor<Partial<Record<keyof C & string, string>>>;
  /** `true` when any field's value differs from its initial value. */
  dirty: Accessor<boolean>;
  /** `true` when all fields pass validation and no async validators are pending. Always reflects true validity regardless of `validateOn`. */
  valid: Accessor<boolean>;
  /** `true` while any field has an async validator in flight. */
  pending: Accessor<boolean>;
  /** `true` while `onSubmit` is executing. */
  submitting: Accessor<boolean>;
  /** `true` after the first submit attempt; reset to `false` by `reset()`. */
  submitted: Accessor<boolean>;
  /** Two-phase ref directive factory. Wire a field to an `<input>`, `<select>`, or `<textarea>` element. */
  bind: (
    name: keyof C & string,
  ) => (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => () => void;
  /** Ref callback for `<form>` elements. Intercepts submit, calls `e.preventDefault()`, and runs the submit flow. */
  ref: (el: HTMLFormElement) => () => void;
  /** Register a cross-field validation rule. Returns a reactive accessor for the error. Blocks `valid()` when non-null. Must be called inside a reactive owner. */
  validate: (
    fn: (values: { [K in keyof C]: InferValue<C[K]> }) => string | null,
  ) => Accessor<string | null>;
  /** Update multiple field values at once without affecting touched state. */
  setValues: (values: Partial<{ [K in keyof C]: InferValue<C[K]> }>) => void;
  /** Inject an external error on a named field (e.g. a server-side validation message). Cleared automatically when that field's value changes. */
  setError: (name: keyof C & string, error: string | null) => void;
  /** Snapshot of current field values as a `FormData` instance. Omits `null`, `undefined`, and `false`. */
  formData: () => FormData;
  /** Reset all fields to their initial values and clear submitted, touched, and external errors. If `newValues` is provided, the named fields adopt those values as their new baseline. */
  reset: (newValues?: Partial<{ [K in keyof C]: InferValue<C[K]> }>) => void;
  /** Programmatically trigger the submit flow. Touches all fields, sets `submitted`, validates, then calls `onSubmit` if valid. */
  submit: () => Promise<void>;
};

/** Configuration passed to `createForm`. */
export type FormConfig<C extends FieldsConfig> = {
  /** Field definitions. The shape of this object determines the form's value type and available field names. */
  fields: C;
  /** Called with all field values when the form submits and all fields are valid. May be async. */
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
  /** Default display timing for field errors. Can be overridden per field. @default "change" */
  validateOn?: "change" | "blur" | "submit";
};

/** Props accepted by `createFormControl`. All values may be static or reactive accessors. */
export type CreateFormControlProps = {
  /**
   * Stable identifier for this field group. Used as the prefix for all generated sub-element
   * IDs (label, field, description, error). Auto-generated via `createUniqueId()` if omitted —
   * but prefer supplying an explicit ID in SSR contexts to avoid hydration mismatches.
   */
  id?: MaybeAccessor<string>;
  /**
   * HTML `name` attribute forwarded to the underlying input. Falls back to `id` when omitted,
   * which is sufficient for most single-input groups.
   */
  name?: MaybeAccessor<string>;
  /** Whether the current value passes (`"valid"`) or fails (`"invalid"`) validation. `undefined` means neutral — no validation feedback shown. */
  validationState?: MaybeAccessor<"valid" | "invalid" | undefined>;
  /** When `true`, sub-components should render a required indicator and set `aria-required`. */
  required?: MaybeAccessor<boolean | undefined>;
  /** When `true`, sub-components should disable user interaction and set `disabled`/`aria-disabled`. */
  disabled?: MaybeAccessor<boolean | undefined>;
  /** When `true`, the field value is visible but not editable. Sub-components should set `readonly`/`aria-readonly`. */
  readOnly?: MaybeAccessor<boolean | undefined>;
};

/** Props accepted by `createFormControlInput`. All values may be static or reactive accessors. */
export type CreateFormControlInputProps = {
  /**
   * Explicit ID for the input element. Defaults to `context.generateId("field")` so that the
   * label's `for` attribute and `aria-labelledby` chains stay in sync without manual IDs.
   */
  id?: MaybeAccessor<string>;
  /** Inline label text. When present alongside a visible label, the input's own ID is appended to `aria-labelledby` so screen readers announce both. */
  "aria-label"?: MaybeAccessor<string>;
  /** Space-separated list of IDs that label this input. Merged with the registered label ID. */
  "aria-labelledby"?: MaybeAccessor<string>;
  /** Space-separated list of IDs that describe this input. Merged with the registered description and error-message IDs. */
  "aria-describedby"?: MaybeAccessor<string>;
};

/**
 * Data attributes set on the root element to reflect the current field state.
 * Each attribute is an empty string when active, `undefined` when inactive —
 * matching the convention used by Kobalte and Radix for CSS-selector targeting
 * (`[data-invalid]`, `[data-disabled]`, etc.).
 */
export type FormControlDataSet = {
  "data-valid": string | undefined;
  "data-invalid": string | undefined;
  "data-required": string | undefined;
  "data-disabled": string | undefined;
  "data-readonly": string | undefined;
};

/**
 * Shared accessibility state provided by `createFormControl` and consumed by
 * sub-components through `FormControlContext`.
 *
 * Sub-components register themselves by calling one of the `register*` methods on mount
 * and passing the returned cleanup to `onCleanup`. Registration writes the element's ID
 * into the corresponding signal so that `getAriaLabelledBy` / `getAriaDescribedBy` can
 * build correct, live `aria-*` attribute strings.
 */
export type FormControlContextValue = {
  /** Field name for the owning form. Falls back to the control's auto-generated ID. */
  name: Accessor<string>;
  /** Reactive snapshot of all `data-*` state attributes. Spread onto the root element. */
  dataset: Accessor<FormControlDataSet>;
  /** Current validation state. `undefined` means neutral (no feedback). */
  validationState: Accessor<"valid" | "invalid" | undefined>;
  /** Whether the field is required. `undefined` means unset (not the same as `false`). */
  isRequired: Accessor<boolean | undefined>;
  /** Whether the field is disabled. `undefined` means unset. */
  isDisabled: Accessor<boolean | undefined>;
  /** Whether the field is read-only. `undefined` means unset. */
  isReadOnly: Accessor<boolean | undefined>;
  /** ID of the currently registered label element, or `undefined` if none is mounted. */
  labelId: Accessor<string | undefined>;
  /** ID of the currently registered field (input) element, or `undefined` if none is mounted. */
  fieldId: Accessor<string | undefined>;
  /** ID of the currently registered description element, or `undefined` if none is mounted. */
  descriptionId: Accessor<string | undefined>;
  /** ID of the currently registered error-message element, or `undefined` if none is mounted. */
  errorMessageId: Accessor<string | undefined>;
  /**
   * Computes the `aria-labelledby` value for an input element.
   *
   * When both a visible label (`labelId`) and an explicit `aria-label` are present, the
   * input's own ID is appended to the chain so screen readers announce the visible label
   * text *and* the programmatic label — matching the Kobalte / React Aria behaviour.
   *
   * @param fieldId - The input element's own ID.
   * @param ariaLabel - The input's `aria-label` prop value, if any.
   * @param ariaLabelledBy - Extra IDs already on the input's `aria-labelledby` prop, if any.
   */
  getAriaLabelledBy: (
    fieldId: string | undefined,
    ariaLabel: string | undefined,
    ariaLabelledBy: string | undefined,
  ) => string | undefined;
  /**
   * Computes the `aria-describedby` value for an input element by joining the registered
   * description ID, the registered error-message ID, and any caller-supplied IDs.
   *
   * Note: we deliberately use `aria-describedby` for error messages rather than
   * `aria-errormessage` because VoiceOver and NVDA have incomplete support for the latter.
   * See: https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
   *
   * @param ariaDescribedBy - Extra IDs already on the input's `aria-describedby` prop, if any.
   */
  getAriaDescribedBy: (ariaDescribedBy: string | undefined) => string | undefined;
  /**
   * Generates a stable ID for a named sub-element part.
   * @example `generateId("label")` → `"my-form-control-label"`
   */
  generateId: (part: string) => string;
  /**
   * Registers a label element by ID. Returns a cleanup function that deregisters it —
   * pass the return value directly to `onCleanup`.
   * @example `onCleanup(ctx.registerLabel(labelId))`
   */
  registerLabel: (id: string) => () => void;
  /**
   * Registers the field (input) element by ID. Returns a cleanup function.
   * Called internally by `createFormControlInput`; you rarely need this directly.
   */
  registerField: (id: string) => () => void;
  /**
   * Registers a description element by ID. Returns a cleanup function — pass to `onCleanup`.
   * @example `onCleanup(ctx.registerDescription(descriptionId))`
   */
  registerDescription: (id: string) => () => void;
  /**
   * Registers an error-message element by ID. Returns a cleanup function — pass to `onCleanup`.
   * Mount this element conditionally (e.g. inside `<Show when={validationState === "invalid"}>`);
   * the ID will only be in `aria-describedby` while the element is actually in the DOM.
   * @example `onCleanup(ctx.registerErrorMessage(errorId))`
   */
  registerErrorMessage: (id: string) => () => void;
};
