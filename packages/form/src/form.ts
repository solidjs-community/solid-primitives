import { createSignal, createMemo, onCleanup, untrack, createEffect, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { makeEventListener } from "@solid-primitives/event-listener";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidatorFn<V = string> = (value: V) => string | null;

export type FieldConfig<V = string> = {
  initial: V;
  validate?: ValidatorFn<V> | ValidatorFn<V>[];
};

export type FieldsConfig = Record<string, FieldConfig<any>>;

type InferValue<C> = C extends FieldConfig<infer V> ? V : never;

export type FormField<V = string> = {
  value: Accessor<V>;
  error: Accessor<string | null>;
  touched: Accessor<boolean>;
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
  submitting: Accessor<boolean>;
  bind: (name: keyof C & string) => (el: HTMLInputElement) => () => void;
  ref: (el: HTMLFormElement) => () => void;
  validate: (fn: (values: { [K in keyof C]: InferValue<C[K]> }) => string | null) => Accessor<string | null>;
  reset: () => void;
  submit: () => Promise<void>;
};

export type FormConfig<C extends FieldsConfig> = {
  fields: C;
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function runValidators<V>(value: V, validators: ValidatorFn<V>[]): string | null {
  for (const v of validators) {
    const err = v(value);
    if (err !== null) return err;
  }
  return null;
}

// ─── createForm ───────────────────────────────────────────────────────────────

export function createForm<C extends FieldsConfig>(config: FormConfig<C>): FormReturn<C> {
  type Values = { [K in keyof C]: InferValue<C[K]> };

  // ── SSR stub ──────────────────────────────────────────────────────────────
  if (isServer) {
    const initialValues = Object.fromEntries(
      Object.entries(config.fields).map(([k, f]) => [k, f.initial]),
    ) as Values;

    const fields = Object.fromEntries(
      Object.entries(config.fields).map(([k, f]) => [
        k,
        {
          value: () => f.initial,
          error: () => null,
          touched: () => false,
          setValue: () => void 0,
          setTouched: () => void 0,
          reset: () => void 0,
        },
      ]),
    ) as unknown as FormReturn<C>["fields"];

    return {
      fields,
      values: () => initialValues,
      errors: () => ({}),
      dirty: () => false,
      valid: () => true,
      submitting: () => false,
      bind: () => () => () => {},
      ref: () => () => {},
      validate: () => () => null,
      reset: () => void 0,
      submit: async () => void 0,
    };
  }

  // ── Internal field state ──────────────────────────────────────────────────
  type InternalField = {
    initial: any;
    validators: ValidatorFn<any>[];
    value: Accessor<any>;
    _setValue: (v: any) => void;
    error: Accessor<string | null>;
    touched: Accessor<boolean>;
    _setTouched: (v: boolean) => void;
  };

  const internalFields: Record<string, InternalField> = {};

  for (const [name, fc] of Object.entries(config.fields)) {
    const validators = fc.validate
      ? Array.isArray(fc.validate)
        ? fc.validate
        : [fc.validate]
      : [];

    // ownedWrite: true — these signals are written from reset() and bind
    // callbacks, which may be called from within reactive contexts
    const [value, setValue] = createSignal<any>(fc.initial, { ownedWrite: true });
    const [touched, setTouched] = createSignal(false, { ownedWrite: true });
    const error = createMemo(() => runValidators(value(), validators));

    internalFields[name] = {
      initial: fc.initial,
      validators,
      value,
      _setValue: setValue,
      error,
      touched,
      _setTouched: setTouched,
    };
  }

  const fieldEntries = Object.entries(internalFields);

  // ── Public fields API ─────────────────────────────────────────────────────
  const fields = Object.fromEntries(
    fieldEntries.map(([name, f]) => [
      name,
      {
        value: f.value,
        error: f.error,
        touched: f.touched,
        setValue: f._setValue,
        setTouched: f._setTouched,
        reset: () => {
          f._setValue(f.initial);
          f._setTouched(false);
        },
      } satisfies FormField<any>,
    ]),
  ) as unknown as FormReturn<C>["fields"];

  // ── Derived state ─────────────────────────────────────────────────────────
  const values = createMemo(
    () => Object.fromEntries(fieldEntries.map(([k, f]) => [k, f.value()])) as Values,
  );

  const errors = createMemo(() => {
    const result: Partial<Record<string, string>> = {};
    for (const [k, f] of fieldEntries) {
      const err = f.error();
      if (err !== null) result[k] = err;
    }
    return result;
  }) as Accessor<Partial<Record<keyof C & string, string>>>;

  const dirty = createMemo(() => fieldEntries.some(([, f]) => f.value() !== f.initial));

  // Populated by validate() calls during rendering, before valid is first read.
  // lazy: true defers the first computation until the first read, so validate()
  // calls that happen in the same component body are already registered.
  const formValidators: Accessor<string | null>[] = [];

  const valid = createMemo(
    () =>
      fieldEntries.every(([, f]) => f.error() === null) &&
      formValidators.every(v => v() === null),
    { lazy: true },
  );

  // ── Form-level validate ───────────────────────────────────────────────────
  // Call during rendering (same phase as bind) to register a cross-field rule.
  // Returns a reactive accessor for that rule's error and factors into valid().
  const validate = (fn: (v: Values) => string | null): Accessor<string | null> => {
    const error = createMemo(() => fn(values()));
    formValidators.push(error);
    return error;
  };

  const [submitting, setSubmitting] = createSignal(false, { ownedWrite: true });

  // Plain boolean guard for synchronous concurrent-submit prevention.
  // setSubmitting(true) is microtask-batched, so untrack(submitting) would
  // still read false on a second synchronous call before the batch flushes.
  let _isSubmitting = false;

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    for (const [, f] of fieldEntries) {
      f._setValue(f.initial);
      f._setTouched(false);
    }
    _isSubmitting = false;
    setSubmitting(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (_isSubmitting) return;

    // Touch all fields so validation errors become visible
    for (const [, f] of fieldEntries) f._setTouched(true);

    // Read validity from untracked memos (not reactive reads)
    if (!untrack(valid)) return;

    _isSubmitting = true;
    setSubmitting(true);
    try {
      await config.onSubmit?.(untrack(values));
    } finally {
      _isSubmitting = false;
      setSubmitting(false);
    }
  };

  // ── Bind (two-phase ref directive) ────────────────────────────────────────
  // Phase 1 runs in the component's reactive scope (when bind() is called
  // during JSX evaluation). Phase 2 returns the ref callback that receives el.
  const bind = (name: string) => {
    const f = internalFields[name];
    if (!f) throw new Error(`createForm: unknown field "${name}"`);

    let el: HTMLInputElement | undefined;

    // Phase 1: reactive sync signal → DOM (runs in caller's owner scope)
    createEffect(
      () => f.value() as string,
      value => {
        if (el && el.value !== value) el.value = value;
      },
    );

    // Phase 2: attach to element, return teardown
    return (nextEl: HTMLInputElement) => {
      el = nextEl;
      el.value = untrack(() => f.value() as string);

      const cleanupInput = makeEventListener(el, "input", () =>
        f._setValue((el as HTMLInputElement).value),
      );
      const cleanupBlur = makeEventListener(el, "blur", () => f._setTouched(true));

      return () => {
        cleanupInput();
        cleanupBlur();
        el = undefined;
      };
    };
  };

  // ── Form ref ──────────────────────────────────────────────────────────────
  const ref = (el: HTMLFormElement) =>
    makeEventListener(el, "submit", (e: SubmitEvent) => {
      e.preventDefault();
      void submit();
    });

  onCleanup(reset);

  return {
    fields,
    values,
    errors,
    dirty,
    valid,
    submitting,
    bind: bind as FormReturn<C>["bind"],
    ref,
    validate: validate as FormReturn<C>["validate"],
    reset,
    submit,
  };
}
