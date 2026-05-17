<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Form" alt="Solid Primitives Form">
</p>

# @solid-primitives/form

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/form?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/form)
[![size](https://img.shields.io/npm/v/@solid-primitives/form?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/form)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive form primitive for Solid.js. Tracks field values, validation errors, touched state, and submission status — all as fine-grained signals that compose naturally with the rest of the Solid reactive graph.

Bring your own validation: validators are plain functions `(value) => string | null | Promise<string | null>`, so any schema library (Zod, Valibot, Arktype, …) wires in with a one-line adapter. Async validators (uniqueness checks, server-side rules) are first-class.

## Installation

```
npm install @solid-primitives/form
# or
yarn add @solid-primitives/form
# or
pnpm add @solid-primitives/form
```

## `createForm`

Creates a reactive form with per-field signals, derived validity state, and helpers for binding fields to DOM inputs.

```tsx
import { createForm } from "@solid-primitives/form";

function LoginForm() {
  const form = createForm({
    fields: {
      email:    { initial: "", validate: isEmail },
      password: { initial: "", validate: [minLength(8), hasUppercase] },
    },
    onSubmit: async values => {
      await api.login(values);
    },
  });

  return (
    <form ref={form.ref}>
      <input ref={form.bind("email")} type="email" />
      <Show when={form.fields.email.touched()}>
        <span>{form.fields.email.error()}</span>
      </Show>

      <input ref={form.bind("password")} type="password" />
      <Show when={form.fields.password.touched()}>
        <span>{form.fields.password.error()}</span>
      </Show>

      <button type="submit" disabled={!form.valid() || form.submitting()}>
        {form.submitting() ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
```

### Configuration

`createForm` accepts a config object:

| Property | Type | Description |
|----------|------|-------------|
| `fields` | `Record<string, FieldConfig>` | Field definitions (see below) |
| `onSubmit` | `(values) => void \| Promise<void>` | Called with all field values when the form submits and all fields are valid |
| `validateOn` | `"change" \| "blur" \| "submit"` | Default display timing for field errors. Defaults to `"change"`. |

**`FieldConfig`**

| Property | Type | Description |
|----------|------|-------------|
| `initial` | `V` | Initial value for the field |
| `validate` | `ValidatorFn \| ValidatorFn[]` | One or more validator functions. Validators run in order; the first failure is the error. |
| `validateOn` | `"change" \| "blur" \| "submit"` | When to display this field's error in the UI. Overrides the form-level `validateOn`. |

A **`ValidatorFn`** is any function with the signature `(value: V) => string | null | Promise<string | null>` — returning an error message string on failure, `null` when valid, or a Promise that resolves to either.

### Per-field API

Each entry in `form.fields` exposes:

| Member | Type | Description |
|--------|------|-------------|
| `value()` | `Accessor<V>` | Current field value |
| `error()` | `Accessor<string \| null>` | First validation error, or `null` if valid. Respects `validateOn`. |
| `touched()` | `Accessor<boolean>` | Whether the field has been blurred |
| `pending()` | `Accessor<boolean>` | `true` while an async validator is in flight for this field |
| `setValue(v)` | `(v: V) => void` | Imperatively set the value |
| `setTouched(v)` | `(v: boolean) => void` | Imperatively set the touched flag |
| `reset()` | `() => void` | Reset this field to its initial value and clear touched |

### Form-level API

| Member | Type | Description |
|--------|------|-------------|
| `dirty()` | `Accessor<boolean>` | `true` when any field differs from its initial value |
| `valid()` | `Accessor<boolean>` | `true` when all fields pass validation and no async validators are pending |
| `pending()` | `Accessor<boolean>` | `true` while any field has an async validator in flight |
| `submitting()` | `Accessor<boolean>` | `true` while `onSubmit` is in flight |
| `submitted()` | `Accessor<boolean>` | `true` after the first submit attempt; reset by `reset()` |
| `values()` | `Accessor<Values>` | Plain object of all current field values |
| `errors()` | `Accessor<Partial<Record<...>>>` | Object containing only fields that currently have errors (always reflects true validity, regardless of `validateOn`) |
| `bind(name)` | Ref directive factory | Wires an `<input>` or `<select>` to the named field (see below) |
| `ref` | Ref callback | Attaches submit handling to a `<form>` element |
| `validate(fn)` | Cross-field rule | Registers a form-level validation rule (see below) |
| `formData()` | `() => FormData` | Snapshot of current field values as a `FormData` instance |
| `reset()` | `() => void` | Reset all fields to their initial values and clear submitted |
| `submit()` | `() => Promise<void>` | Programmatically trigger submission |

### `validateOn`

Controls when field errors become visible to the user. Can be set at the form level (applies to all fields) or overridden per field.

| Mode | Error appears when… |
|------|---------------------|
| `"change"` (default) | Immediately as the user types |
| `"blur"` | After the field loses focus |
| `"submit"` | After the first submit attempt |

```tsx
// All fields only show errors after blur
const form = createForm({
  fields: {
    email:    { initial: "", validate: isEmail },
    password: { initial: "", validate: minLength(8) },
  },
  validateOn: "blur",
});

// Mix modes per field
const form = createForm({
  fields: {
    username: { initial: "", validate: isAvailable, validateOn: "blur" },
    email:    { initial: "", validate: isEmail,     validateOn: "submit" },
  },
});
```

> **Note:** `errors()` and `valid()` always reflect the true validation state, regardless of `validateOn`. The mode only controls when `field.error()` becomes non-null in the UI. This means `form.valid()` is a reliable gate for enabling the submit button even when errors aren't shown yet.

### `form.bind(name)`

`bind` follows the Solid 2.0 two-phase ref directive pattern. Call it during JSX rendering to wire a field to an input element:

```tsx
<input ref={form.bind("email")} type="email" />
<input ref={form.bind("agreed")} type="checkbox" />
<select ref={form.bind("country")}>...</select>
```

This sets up bidirectional sync:
- **Signal → DOM:** the input's value (or `checked` state for checkboxes/radios) stays in sync with the field signal
- **DOM → signal:** `input` events update the field value; `blur` events mark the field as touched

For checkboxes and radios, `bind` reads and writes `el.checked` (a boolean) and listens on `change` rather than `input`.

You can also apply the ref imperatively (e.g. in tests):

```ts
const cleanup = form.bind("email")(inputElement);
// ...
cleanup(); // removes event listeners
```

> **Note:** `bind` must be called during component rendering (inside a reactive owner). Calling it at module level or outside a reactive context will warn.

### Async validators

A validator can return a `Promise<string | null>`. While the promise is pending, `field.pending()` and `form.pending()` are `true`, and `form.valid()` returns `false`.

```tsx
const isAvailable = async (username: string): Promise<string | null> => {
  const taken = await api.checkUsername(username);
  return taken ? "Username is taken" : null;
};

const form = createForm({
  fields: {
    username: {
      initial: "",
      validate: [required, isAvailable],
      validateOn: "blur", // avoid checking on every keystroke
    },
  },
});

return (
  <form ref={form.ref}>
    <input ref={form.bind("username")} />
    <Show when={form.fields.username.pending()}>
      <span>Checking availability…</span>
    </Show>
    <Show when={form.fields.username.error()}>
      <span>{form.fields.username.error()}</span>
    </Show>
    <button type="submit" disabled={!form.valid() || form.pending()}>
      Sign up
    </button>
  </form>
);
```

Sync and async validators can coexist in a single `validate` array. Sync validators run first and short-circuit immediately — the async validator is only awaited if all preceding sync validators pass.

Stale async results are automatically discarded: if the field value changes while a validator is in flight, the in-flight result is ignored.

> **Tip:** Debounce noisy async validators yourself before passing them to `validate`, so network requests don't fire on every keystroke.

### `form.validate(fn)`

Registers a cross-field validation rule and returns a reactive accessor for its error. Call it during component rendering — the same phase as `bind`.

```tsx
function SignupForm() {
  const form = createForm({
    fields: {
      password: { initial: "" },
      confirm:  { initial: "" },
    },
    onSubmit: async values => { /* ... */ },
  });

  const confirmError = form.validate(values =>
    values.password !== values.confirm ? "Passwords must match" : null,
  );

  return (
    <form ref={form.ref}>
      <input ref={form.bind("password")} type="password" />
      <input ref={form.bind("confirm")}  type="password" />
      <Show when={confirmError()}>
        <p>{confirmError()}</p>
      </Show>
      <button type="submit" disabled={!form.valid()}>Sign up</button>
    </form>
  );
}
```

- `form.validate(fn)` returns an `Accessor<string | null>` — reactive over `form.values()`, so it re-runs whenever any field changes.
- The result is included in `form.valid()` — submission is blocked when the rule fails.
- Call it multiple times to register independent rules; all are checked by `form.valid()`.

Works directly with any schema library:

```ts
import * as v from "valibot";

const SignupSchema = v.pipe(
  v.object({ password: v.string(), confirm: v.string() }),
  v.check(({ password, confirm }) => password === confirm, "Passwords must match"),
);

const confirmError = form.validate(values => {
  const result = v.safeParse(SignupSchema, values);
  return result.success ? null : result.issues[0].message;
});
```

> **Note:** `validate` must be called during component rendering (inside a reactive owner), before `form.valid()` is first read.

### `form.ref`

Attach to a `<form>` element to intercept the native submit event:

```tsx
<form ref={form.ref}>...</form>
```

This calls `e.preventDefault()` and runs the submit flow: touches all fields, sets `submitted` to `true`, validates, then calls `onSubmit` if the form is valid.

### `submitted`

`form.submitted()` becomes `true` on the first submit attempt and stays `true` until `form.reset()` is called. Combined with `validateOn: "submit"`, this lets you reveal all errors only after the user first tries to submit:

```tsx
const form = createForm({
  fields: {
    email:    { initial: "", validate: isEmail,    validateOn: "submit" },
    password: { initial: "", validate: minLength(8), validateOn: "submit" },
  },
});

// errors are hidden until form.submitted() becomes true
```

### `toFormData(values)`

A standalone helper that converts a plain values object into a `FormData` instance. Useful when passing form data to Solid Router actions or server functions that expect `FormData`:

```ts
import { createForm, toFormData } from "@solid-primitives/form";
import { action, useAction } from "@solidjs/router";

const saveProfile = action(async (fd: FormData) => {
  await api.save(Object.fromEntries(fd));
});

function ProfileForm() {
  const save = useAction(saveProfile);
  const form = createForm({
    fields: { name: { initial: "" }, bio: { initial: "" } },
    onSubmit: values => save(toFormData(values)),
  });

  return <form ref={form.ref}>...</form>;
}
```

`null` and `undefined` values are omitted. All other values are coerced to strings via `String(value)`.

```ts
function toFormData(values: Record<string, unknown>): FormData;
```

### Optimistic updates

`createForm` works naturally with Solid 2.0's `action` primitive for optimistic mutations:

```ts
import { action } from "@solidjs/router";

const form = createForm({
  fields: { name: { initial: "" } },
  onSubmit: action(function* (values) {
    setOptimisticName(values.name);
    yield api.updateName(values);
    refresh(profile);
  }),
});
```

### TypeScript

Field value types are inferred from `initial`:

```ts
const form = createForm({
  fields: {
    age:  { initial: 0 },              // FormField<number>
    name: { initial: "" },             // FormField<string>
    tags: { initial: [] as string[] }, // FormField<string[]>
  },
});

form.fields.age.value();   // number
form.fields.name.value();  // string
```

#### Definition

```ts
function createForm<C extends FieldsConfig>(config: FormConfig<C>): FormReturn<C>;

type ValidatorFn<V = string> = (value: V) => string | null | Promise<string | null>;

type FormConfig<C extends FieldsConfig> = {
  fields: C;
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
  validateOn?: "change" | "blur" | "submit";
};

type FieldConfig<V = string> = {
  initial: V;
  validate?: ValidatorFn<V> | ValidatorFn<V>[];
  validateOn?: "change" | "blur" | "submit";
};

type FormField<V = string> = {
  value:      Accessor<V>;
  error:      Accessor<string | null>;
  touched:    Accessor<boolean>;
  pending:    Accessor<boolean>;
  setValue:   (v: V) => void;
  setTouched: (v: boolean) => void;
  reset:      () => void;
};

type FormReturn<C extends FieldsConfig> = {
  fields:     { [K in keyof C]: FormField<InferValue<C[K]>> };
  values:     Accessor<{ [K in keyof C]: InferValue<C[K]> }>;
  errors:     Accessor<Partial<Record<keyof C & string, string>>>;
  dirty:      Accessor<boolean>;
  valid:      Accessor<boolean>;
  pending:    Accessor<boolean>;
  submitting: Accessor<boolean>;
  submitted:  Accessor<boolean>;
  bind:       (name: keyof C & string) => (el: HTMLInputElement | HTMLSelectElement) => () => void;
  ref:        (el: HTMLFormElement) => () => void;
  validate:   (fn: (values: Values) => string | null) => Accessor<string | null>;
  formData:   () => FormData;
  reset:      () => void;
  submit:     () => Promise<void>;
};
```

---

## Validation

`createForm` has no built-in validators. A validator is any function `(value: V) => string | null | Promise<string | null>`. This makes it trivial to use your preferred schema library.

### Using Valibot

```ts
import { createForm } from "@solid-primitives/form";
import * as v from "valibot";

// Wrap any Valibot schema into a ValidatorFn
function valibot<T>(schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>) {
  return (value: T): string | null => {
    const result = v.safeParse(schema, value);
    return result.success ? null : result.issues[0].message;
  };
}

const form = createForm({
  fields: {
    email:    { initial: "", validate: valibot(v.pipe(v.string(), v.email())) },
    password: { initial: "", validate: valibot(v.pipe(v.string(), v.minLength(8))) },
    age:      { initial: 0,  validate: valibot(v.pipe(v.number(), v.minValue(18))) },
  },
  onSubmit: async values => { /* ... */ },
});
```

### Using Zod

```ts
import { createForm } from "@solid-primitives/form";
import { z } from "zod";

// Wrap any Zod schema into a ValidatorFn
function zod<T>(schema: z.ZodType<T>) {
  return (value: T): string | null => {
    const result = schema.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  };
}

const form = createForm({
  fields: {
    email:    { initial: "", validate: zod(z.string().email()) },
    password: { initial: "", validate: zod(z.string().min(8)) },
    age:      { initial: 0,  validate: zod(z.number().min(18)) },
  },
  onSubmit: async values => { /* ... */ },
});
```

### Whole-form validation with Valibot

For schemas that validate the entire values object at once (cross-field rules, refinements), validate in `onSubmit` and surface errors manually:

```ts
import * as v from "valibot";

const SignupSchema = v.pipe(
  v.object({
    password: v.string(),
    confirm:  v.string(),
  }),
  v.check(({ password, confirm }) => password === confirm, "Passwords do not match"),
);

const form = createForm({
  fields: {
    password: { initial: "" },
    confirm:  { initial: "" },
  },
  onSubmit: values => {
    const result = v.safeParse(SignupSchema, values);
    if (!result.success) {
      throw new Error(result.issues[0].message);
    }
    return api.signup(result.output);
  },
});
```

### Custom validators

Plain functions work too — no library required:

```ts
const required = (value: string) =>
  value.trim().length === 0 ? "Required" : null;

const noSpaces = (value: string) =>
  value.includes(" ") ? "No spaces allowed" : null;

const form = createForm({
  fields: {
    username: { initial: "", validate: [required, noSpaces] },
  },
});
```

---

## Future work

### Field sanitizers

A `sanitize` option on `FieldConfig`, mirroring `validate`, that transforms a field's value rather than inspecting it:

```ts
type SanitizerFn<V = string> = (value: V) => V;

// proposed config shape
email: {
  initial: "",
  sanitize: v => v.trim().toLowerCase(), // or an array, run as a chain
  validate: isEmail,
}
```

Sanitizers would run on `blur` (better UX than on every keystroke — trimming mid-input prevents typing a space), producing the cleaned value before validation sees it. `form.fields.email.value()` would always return the sanitized value.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
