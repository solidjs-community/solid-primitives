<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Form" alt="Solid Primitives Form">
</p>

# @solid-primitives/form

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/form?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/form)
[![size](https://img.shields.io/npm/v/@solid-primitives/form?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/form)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive form primitive for Solid.js. Tracks field values, validation errors, touched state, and submission status — all as fine-grained signals that compose naturally with the rest of the Solid reactive graph.

Bring your own validation: validators are plain functions `(value) => string | null`, so any schema library (Zod, Valibot, Arktype, …) wires in with a one-line adapter.

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

**`FieldConfig`**

| Property | Type | Description |
|----------|------|-------------|
| `initial` | `V` | Initial value for the field |
| `validate` | `ValidatorFn \| ValidatorFn[]` | One or more validator functions. Validators run in order; the first failure is the error. |

A **`ValidatorFn`** is any function with the signature `(value: V) => string | null` — returning an error message string on failure, or `null` when valid.

### Per-field API

Each entry in `form.fields` exposes:

| Member | Type | Description |
|--------|------|-------------|
| `value()` | `Accessor<V>` | Current field value |
| `error()` | `Accessor<string \| null>` | First validation error, or `null` if valid |
| `touched()` | `Accessor<boolean>` | Whether the field has been blurred |
| `setValue(v)` | `(v: V) => void` | Imperatively set the value |
| `setTouched(v)` | `(v: boolean) => void` | Imperatively set the touched flag |
| `reset()` | `() => void` | Reset this field to its initial value and clear touched |

### Form-level API

| Member | Type | Description |
|--------|------|-------------|
| `dirty()` | `Accessor<boolean>` | `true` when any field differs from its initial value |
| `valid()` | `Accessor<boolean>` | `true` when all fields pass validation |
| `submitting()` | `Accessor<boolean>` | `true` while `onSubmit` is in flight |
| `values()` | `Accessor<Values>` | Plain object of all current field values |
| `errors()` | `Accessor<Partial<Record<...>>>` | Object containing only fields that currently have errors |
| `bind(name)` | Ref directive factory | Wires an `<input>` to the named field (see below) |
| `ref` | Ref callback | Attaches submit handling to a `<form>` element |
| `reset()` | `() => void` | Reset all fields to their initial values |
| `submit()` | `() => Promise<void>` | Programmatically trigger submission |

### `form.bind(name)`

`bind` follows the Solid 2.0 two-phase ref directive pattern. Call it during JSX rendering to wire a field to an `<input>`:

```tsx
<input ref={form.bind("email")} />
```

This sets up bidirectional sync:
- **Signal → DOM:** the input's value stays in sync with the field signal
- **DOM → signal:** `input` events update the field value; `blur` events mark the field as touched

You can also apply the ref imperatively (e.g. in tests):

```ts
const cleanup = form.bind("email")(inputElement);
// ...
cleanup(); // removes event listeners
```

> **Note:** `bind` must be called during component rendering (inside a reactive owner). Calling it at module level or outside a reactive context will warn.

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

This calls `e.preventDefault()` and runs the submit flow: touches all fields, validates, then calls `onSubmit` if the form is valid.

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

type ValidatorFn<V = string> = (value: V) => string | null;

type FormConfig<C extends FieldsConfig> = {
  fields: C;
  onSubmit?: (values: { [K in keyof C]: InferValue<C[K]> }) => void | Promise<void>;
};

type FormReturn<C extends FieldsConfig> = {
  fields:     { [K in keyof C]: FormField<InferValue<C[K]>> };
  values:     Accessor<{ [K in keyof C]: InferValue<C[K]> }>;
  errors:     Accessor<Partial<Record<keyof C & string, string>>>;
  dirty:      Accessor<boolean>;
  valid:      Accessor<boolean>;
  submitting: Accessor<boolean>;
  bind:       (name: keyof C & string) => (el: HTMLInputElement) => () => void;
  ref:        (el: HTMLFormElement) => () => void;
  validate:   (fn: (values: Values) => string | null) => Accessor<string | null>;
  reset:      () => void;
  submit:     () => Promise<void>;
};
```

---

## Validation

`createForm` has no built-in validators. A validator is any function `(value: V) => string | null`. This makes it trivial to use your preferred schema library.

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
      // surface the first cross-field issue however you need
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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
