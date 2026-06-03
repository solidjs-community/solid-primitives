import type { Accessor } from "solid-js";

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
  bind: (name: keyof C & string) => (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => () => void;
  /** Ref callback for `<form>` elements. Intercepts submit, calls `e.preventDefault()`, and runs the submit flow. */
  ref: (el: HTMLFormElement) => () => void;
  /** Register a cross-field validation rule. Returns a reactive accessor for the error. Blocks `valid()` when non-null. Must be called inside a reactive owner. */
  validate: (fn: (values: { [K in keyof C]: InferValue<C[K]> }) => string | null) => Accessor<string | null>;
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
