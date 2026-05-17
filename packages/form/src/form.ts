import { createSignal, createMemo, onCleanup, untrack, createEffect, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { makeEventListener } from "@solid-primitives/event-listener";

export type ValidatorFn<V = string> = (value: V) => string | null | Promise<string | null>;

export type FieldConfig<V = string> = {
  initial: V;
  validate?: ValidatorFn<V> | ValidatorFn<V>[];
  validateOn?: "change" | "blur" | "submit";
};

export type FieldsConfig = Record<string, FieldConfig<any>>;

type InferValue<C> = C extends FieldConfig<infer V> ? V : never;

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
  bind: (name: keyof C & string) => (el: HTMLInputElement | HTMLSelectElement) => () => void;
  ref: (el: HTMLFormElement) => () => void;
  validate: (fn: (values: { [K in keyof C]: InferValue<C[K]> }) => string | null) => Accessor<string | null>;
  formData: () => FormData;
  reset: () => void;
  submit: () => Promise<void>;
};

export type FormConfig<C extends FieldsConfig> = {
  fields: C;
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
  validateOn?: "change" | "blur" | "submit";
};

function runValidators<V>(value: V, validators: ValidatorFn<V>[]): string | null {
  for (const fn of validators) {
    const result = fn(value);
    if (result instanceof Promise) continue; // async validators handled separately
    if (result !== null) return result;
  }
  return null;
}

export function toFormData(values: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (v != null) fd.append(k, String(v));
  }
  return fd;
}

export function createForm<C extends FieldsConfig>(config: FormConfig<C>): FormReturn<C> {
  type Values = { [K in keyof C]: InferValue<C[K]> };

  // On the server, return static stubs with initial values and no-op setters.
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
          pending: () => false,
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
      pending: () => false,
      submitting: () => false,
      submitted: () => false,
      bind: () => () => () => {},
      ref: () => () => {},
      validate: () => () => null,
      formData: () => new FormData(),
      reset: () => void 0,
      submit: async () => void 0,
    };
  }

  // submitted must exist before the field loop so validateOn:"submit" fields
  // can close over it when building their gated error memo.
  const [submitted, setSubmitted] = createSignal(false, { ownedWrite: true });

  const formValidateOn = config.validateOn ?? "change";

  // Internal shape: _rawError is always computed (used by valid/errors),
  // error is gated by validateOn (used by field.error() in the UI).
  type InternalField = {
    initial: any;
    value: Accessor<any>;
    _setValue: (v: any) => void;
    _rawError: Accessor<string | null>;
    _asyncPending: Accessor<boolean>;
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
    const validateOn = fc.validateOn ?? formValidateOn;

    const [value, setValue] = createSignal<any>(fc.initial, { ownedWrite: true });
    const [touched, setTouched] = createSignal(false, { ownedWrite: true });

    // Sync validators run in a memo for immediate reactivity; Promises are skipped.
    const syncError = createMemo(() => runValidators(value(), validators));

    let asyncError: Accessor<string | null> = () => null;
    let _asyncPending: Accessor<boolean> = () => false;

    if (validators.length > 0) {
      const [ae, setAe] = createSignal<string | null>(null, { ownedWrite: true });
      const [ap, setAp] = createSignal(false, { ownedWrite: true });
      asyncError = ae;
      _asyncPending = ap;

      let seq = 0;

      createEffect(
        () => value(),
        val => {
          const s = ++seq;
          const run = async () => {
            const results = validators.map(fn => fn(val));
            if (results.some(r => r instanceof Promise)) setAp(true);
            for (const r of results) {
              const err = await r;
              if (s !== seq) return; // value changed mid-flight, discard
              if (err !== null) { setAe(err); setAp(false); return; }
            }
            setAe(null);
            setAp(false);
          };
          void run();
        },
      );
    }

    // The true validation result — always computed regardless of validateOn.
    const _rawError = createMemo(() => syncError() ?? asyncError());

    // What the UI sees — gated by validateOn mode.
    const error =
      validateOn === "change"
        ? _rawError
        : createMemo(() => {
            if (validateOn === "blur" && !touched()) return null;
            if (validateOn === "submit" && !submitted()) return null;
            return _rawError();
          });

    internalFields[name] = {
      initial: fc.initial,
      value,
      _setValue: setValue,
      _rawError,
      _asyncPending,
      error,
      touched,
      _setTouched: setTouched,
    };
  }

  const fieldEntries = Object.entries(internalFields);

  const fields = Object.fromEntries(
    fieldEntries.map(([name, f]) => [
      name,
      {
        value: f.value,
        error: f.error,
        touched: f.touched,
        pending: f._asyncPending,
        setValue: f._setValue,
        setTouched: f._setTouched,
        reset: () => {
          f._setValue(f.initial);
          f._setTouched(false);
        },
      } satisfies FormField<any>,
    ]),
  ) as unknown as FormReturn<C>["fields"];

  const values = createMemo(
    () => Object.fromEntries(fieldEntries.map(([k, f]) => [k, f.value()])) as Values,
  );

  // errors() and valid() use _rawError so they always reflect true validity,
  // regardless of the validateOn display mode.
  const errors = createMemo(() => {
    const result: Partial<Record<string, string>> = {};
    for (const [k, f] of fieldEntries) {
      const err = f._rawError();
      if (err !== null) result[k] = err;
    }
    return result;
  }) as Accessor<Partial<Record<keyof C & string, string>>>;

  const dirty = createMemo(() => fieldEntries.some(([, f]) => f.value() !== f.initial));

  const pending = createMemo(() => fieldEntries.some(([, f]) => f._asyncPending()));

  const formValidators: Accessor<string | null>[] = [];

  const valid = createMemo(
    () =>
      fieldEntries.every(([, f]) => f._rawError() === null) &&
      !pending() &&
      formValidators.every(v => v() === null),
    { lazy: true },
  );

  const validate = (fn: (v: Values) => string | null): Accessor<string | null> => {
    const error = createMemo(() => fn(values()));
    formValidators.push(error);
    return error;
  };

  const [submitting, setSubmitting] = createSignal(false, { ownedWrite: true });

  // Plain boolean guard for synchronous concurrent-submit prevention.
  // setSubmitting(true) is microtask-batched, so a second synchronous submit()
  // call would read the stale false value before the batch flushes.
  let _isSubmitting = false;

  const reset = () => {
    for (const [, f] of fieldEntries) {
      f._setValue(f.initial);
      f._setTouched(false);
    }
    _isSubmitting = false;
    setSubmitting(false);
    setSubmitted(false);
  };

  const submit = async () => {
    if (_isSubmitting) return;

    // Touch all fields so validation errors become visible in the UI.
    for (const [, f] of fieldEntries) f._setTouched(true);

    // Set submitted before the valid check so validateOn:"submit" fields
    // reveal their errors when the user tries to submit an invalid form.
    setSubmitted(true);

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

  // bind() follows the Solid 2.0 two-phase ref directive pattern.
  // Phase 1 runs in the component's reactive scope when bind() is called during
  // JSX evaluation. Phase 2 is the ref callback that receives the element.
  const bind = (name: string) => {
    const f = internalFields[name];
    if (!f) throw new Error(`createForm: unknown field "${name}"`);

    let el: HTMLInputElement | undefined;

    // Phase 1: keep the DOM element in sync with the signal.
    createEffect(
      () => f.value(),
      value => {
        if (!el) return;
        if (el.type === "checkbox" || el.type === "radio") el.checked = Boolean(value);
        else if (el.value !== String(value ?? "")) el.value = String(value ?? "");
      },
    );

    // Phase 2: wire up the element and return a teardown.
    return (nextEl: HTMLInputElement | HTMLSelectElement) => {
      el = nextEl as HTMLInputElement;
      const checkable = el.type === "checkbox" || el.type === "radio";

      if (checkable) el.checked = Boolean(untrack(() => f.value()));
      else el.value = untrack(() => String(f.value() ?? ""));

      const eventName = checkable ? "change" : "input";
      const cleanupChange = makeEventListener(el, eventName as "input", () =>
        f._setValue(checkable ? (el as HTMLInputElement).checked : el!.value),
      );
      const cleanupBlur = makeEventListener(el, "blur", () => f._setTouched(true));

      return () => {
        cleanupChange();
        cleanupBlur();
        el = undefined;
      };
    };
  };

  const formData = () => toFormData(values());

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
    pending,
    submitting,
    submitted,
    bind: bind as FormReturn<C>["bind"],
    ref,
    validate: validate as FormReturn<C>["validate"],
    formData,
    reset,
    submit,
  };
}
