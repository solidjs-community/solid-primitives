import { createSignal, createMemo, createRoot, onCleanup, untrack, createEffect, type Accessor } from "solid-js";
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

function runValidators<V>(v: V, fns: ValidatorFn<V>[]): string | null {
  for (const fn of fns) {
    const r = fn(v);
    if (!(r instanceof Promise) && r !== null) return r;
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
      setValues: () => void 0,
      formData: () => new FormData(),
      reset: () => void 0,
      submit: async () => void 0,
    };
  }

  // submitted is read inside per-field error memos, so it must exist before the loop.
  const [submitted, setSubmitted] = createSignal(false, { ownedWrite: true });
  const formValidateOn = config.validateOn ?? "change";

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
      ? Array.isArray(fc.validate) ? fc.validate : [fc.validate]
      : [];
    const validateOn = fc.validateOn ?? formValidateOn;

    const [value, setValue] = createSignal<any>(fc.initial, { ownedWrite: true });
    const [touched, setTouched] = createSignal(false, { ownedWrite: true });

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
          void (async () => {
            // Invoke all validators; collect only the Promises (parallel start).
            const ps: Promise<string | null>[] = [];
            for (const fn of validators) {
              const r = fn(val);
              if (r instanceof Promise) ps.push(r);
            }
            if (!ps.length) { setAe(null); setAp(false); return; }
            setAp(true);
            for (const p of ps) {
              const err = await p;
              if (s !== seq) return;
              if (err !== null) { setAe(err); setAp(false); return; }
            }
            setAe(null);
            setAp(false);
          })();
        },
      );
    }

    // Fields with no validators are always null — skip the memo entirely.
    const _rawError: Accessor<string | null> = validators.length === 0
      ? () => null
      : createMemo(() => runValidators(value(), validators) ?? asyncError());

    // Display error is gated by validateOn; raw error is always computed above.
    const error = validateOn === "change"
      ? _rawError
      : createMemo(() => (validateOn === "blur" ? touched() : submitted()) ? _rawError() : null);

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
        reset: () => { f._setValue(f.initial); f._setTouched(false); },
      } satisfies FormField<any>,
    ]),
  ) as unknown as FormReturn<C>["fields"];

  const values = createMemo(
    () => Object.fromEntries(fieldEntries.map(([k, f]) => [k, f.value()])) as Values,
  );

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

  // Counter signal: bumped by validate() so valid() re-computes immediately
  // when a cross-field rule is registered after valid has already been read.
  const [validVer, bumpValidVer] = createSignal(0, { ownedWrite: true });
  const formValidators: Accessor<string | null>[] = [];

  const valid = createMemo(
    () => {
      validVer();
      return (
        fieldEntries.every(([, f]) => f._rawError() === null) &&
        !pending() &&
        formValidators.every(v => v() === null)
      );
    },
    { lazy: true },
  );

  const validate = (fn: (v: Values) => string | null): Accessor<string | null> => {
    const error = createMemo(() => fn(values()));
    formValidators.push(error);
    bumpValidVer(n => n + 1);
    return error;
  };

  const setValues = (newValues: Partial<Values>) => {
    for (const [k, v] of Object.entries(newValues)) {
      if (k in internalFields) internalFields[k]!._setValue(v);
    }
  };

  const [submitting, setSubmitting] = createSignal(false, { ownedWrite: true });
  let _isSubmitting = false;

  const reset = () => {
    for (const [, f] of fieldEntries) { f._setValue(f.initial); f._setTouched(false); }
    _isSubmitting = false;
    setSubmitting(false);
    setSubmitted(false);
  };

  const submit = async () => {
    if (_isSubmitting) return;
    for (const [, f] of fieldEntries) f._setTouched(true);
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

  // bind() uses a single Phase 2 ref callback. The sync-to-DOM effect is scoped
  // to the element's lifetime via createRoot, disposed when the element unmounts.
  const bind = (name: string) => {
    const f = internalFields[name];
    if (!f) throw new Error(`createForm: unknown field "${name}"`);

    return (nextEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      const el = nextEl as HTMLInputElement;
      const checkable = el.type === "checkbox" || el.type === "radio";

      if (checkable) el.checked = Boolean(untrack(f.value));
      else el.value = untrack(() => String(f.value() ?? ""));

      const disposeEffect = createRoot(d => {
        createEffect(f.value, v => {
          if (checkable) el.checked = Boolean(v);
          else if (el.value !== String(v ?? "")) el.value = String(v ?? "");
        });
        return d;
      });

      const off1 = makeEventListener(el, checkable ? "change" : "input", () =>
        f._setValue(checkable ? el.checked : el.value),
      );
      const off2 = makeEventListener(el, "blur", () => f._setTouched(true));

      return () => { off1(); off2(); disposeEffect(); };
    };
  };

  const ref = (el: HTMLFormElement) =>
    makeEventListener(el, "submit", (e: SubmitEvent) => {
      e.preventDefault();
      void submit();
    });

  onCleanup(() => { _isSubmitting = false; });

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
    setValues: setValues as FormReturn<C>["setValues"],
    formData: () => toFormData(values()),
    reset,
    submit,
  };
}
