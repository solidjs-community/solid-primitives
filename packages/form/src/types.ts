import type { Accessor } from "solid-js";

export type ValidatorFn<V = string> = (value: V) => string | null | Promise<string | null>;

export type FieldConfig<V = string> = {
  initial: V;
  validate?: ValidatorFn<V> | ValidatorFn<V>[];
  validateOn?: "change" | "blur" | "submit";
};

export type FieldsConfig = Record<string, FieldConfig<any>>;

export type InferValue<C> = C extends FieldConfig<infer V> ? V : never;

export type FormField<V = string> = {
  value: Accessor<V>;
  error: Accessor<string | null>;
  touched: Accessor<boolean>;
  pending: Accessor<boolean>;
  setValue: (v: V) => void;
  setTouched: (v: boolean) => void;
  reset: () => void;
};

export type FormReturn<C extends FieldsConfig> = {
  fields: { [K in keyof C]: FormField<InferValue<C[K]>> };
  values: Accessor<{ [K in keyof C]: InferValue<C[K]> }>;
  errors: Accessor<Partial<Record<keyof C & string, string>>>;
  dirty: Accessor<boolean>;
  valid: Accessor<boolean>;
  pending: Accessor<boolean>;
  submitting: Accessor<boolean>;
  submitted: Accessor<boolean>;
  bind: (name: keyof C & string) => (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => () => void;
  ref: (el: HTMLFormElement) => () => void;
  validate: (fn: (values: { [K in keyof C]: InferValue<C[K]> }) => string | null) => Accessor<string | null>;
  setValues: (values: Partial<{ [K in keyof C]: InferValue<C[K]> }>) => void;
  formData: () => FormData;
  reset: () => void;
  submit: () => Promise<void>;
};

export type FormConfig<C extends FieldsConfig> = {
  fields: C;
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
  validateOn?: "change" | "blur" | "submit";
};
