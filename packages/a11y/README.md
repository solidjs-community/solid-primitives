<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=a11y" alt="Solid Primitives a11y">
</p>

# @solid-primitives/a11y

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/a11y?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/a11y)
[![size](https://img.shields.io/npm/v/@solid-primitives/a11y?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/a11y)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive accessibility primitives. Programmatically announce changes to screen readers via ARIA live regions, track the user's `prefers-reduced-motion` preference as a reactive signal, and wire the ARIA ID graph that connects labels, descriptions, and error messages to form inputs — the foundation for accessible headless components.

## Installation

```bash
npm install @solid-primitives/a11y
# or
yarn add @solid-primitives/a11y
# or
pnpm add @solid-primitives/a11y
```

---

## `createAnnounce` / `makeAnnounce`

Programmatically sends messages to screen readers via ARIA live regions. Two visually-hidden
`<div>` elements are appended to `document.body` — one `aria-live="polite"`, one
`aria-live="assertive"` — and removed on cleanup.

```ts
import { createAnnounce } from "@solid-primitives/a11y";
```

### Usage

```ts
const announce = createAnnounce();

// Status update — screen reader waits for idle before reading
announce("3 results found");

// Urgent error — interrupts the screen reader immediately
announce("Session expired. Please sign in again.", "assertive");
```

### Politeness levels

| Level | Behaviour | When to use |
|-------|-----------|-------------|
| `"polite"` (default) | Waits for the screen reader to finish its current sentence | Status updates, confirmations, search result counts |
| `"assertive"` | Interrupts immediately | Urgent errors that require immediate attention |

> Prefer `"polite"` in almost all cases. `"assertive"` is disruptive and should be reserved for true errors.

### `makeAnnounce`

Non-reactive base. Returns `[announce, cleanup]` so you can use it outside a Solid component — useful for notification services or stores.

```ts
import { makeAnnounce } from "@solid-primitives/a11y";

const [announce, cleanup] = makeAnnounce();
announce("File downloaded");
// later, when your app unmounts:
cleanup();
```

### Definition

```ts
function createAnnounce(): Announce;
function makeAnnounce(): [announce: Announce, cleanup: () => void];

type Announce = (message: string, politeness?: AnnouncePoliteness) => void;
type AnnouncePoliteness = "polite" | "assertive";
```

---

## `createReducedMotion`

Returns a reactive accessor that reflects the user's `prefers-reduced-motion` system preference.
Updates automatically when the OS setting changes. Returns `false` on the server (SSR-safe).

```ts
import { createReducedMotion } from "@solid-primitives/a11y";
```

### Usage

```tsx
const prefersReduced = createReducedMotion();

return (
  <div class={prefersReduced() ? "" : "animate-fade-in"}>
    Content
  </div>
);
```

```ts
// Gate inline styles
const style = () => ({
  transition: prefersReduced() ? "none" : "transform 0.3s ease",
});
```

### When to apply

- Disable CSS animations and transitions
- Stop auto-playing carousels or slideshows
- Remove parallax and scroll-triggered effects
- Reduce motion in canvas/WebGL rendering

### Testing locally

macOS: **System Settings → Accessibility → Display → Reduce Motion**

Windows: **Settings → Ease of Access → Display → Show animations**

### Definition

```ts
function createReducedMotion(): Accessor<boolean>;
```

---

## `createFormControl`

Creates the ARIA context for a labeled field group. Returns a `FormControlContextValue` directly — usable standalone or passed to `<FormControlContext>` so sub-components can consume it via `useFormControl()`.

```tsx
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "@solid-primitives/a11y";
```

### The sub-component pattern

The intended usage is a `Root` component that owns the context and a set of named sub-components that each register themselves on mount. This is the same pattern Kobalte uses internally for `TextField`, `Checkbox`, etc.

```tsx
import { type Element, Show, onCleanup } from "solid-js";
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "@solid-primitives/a11y";

// 1. Root — creates the ARIA graph and provides it via context
const TextFieldRoot = (props: {
  id?: string;
  validationState?: "valid" | "invalid";
  required?: boolean;
  disabled?: boolean;
  children: Element;
}) => {
  const ctx = createFormControl(props);
  return <FormControlContext value={ctx}>{props.children}</FormControlContext>;
};

// 2. Label — registers its ID so the input can reference it
const TextFieldLabel = (props: { children: Element }) => {
  const ctx = useFormControl();
  const id = ctx.generateId("label");
  onCleanup(ctx.registerLabel(id));
  return <label id={id}>{props.children}</label>;
};

// 3. Input — reads context and spreads computed ARIA props
const TextFieldInput = (props: { placeholder?: string }) => {
  const { fieldProps } = createFormControlInput();
  const ctx = useFormControl();
  return (
    <input
      id={fieldProps.id()}
      placeholder={props.placeholder}
      aria-labelledby={fieldProps.ariaLabelledBy()}
      aria-describedby={fieldProps.ariaDescribedBy()}
      aria-invalid={ctx.validationState() === "invalid" ? "true" : undefined}
      aria-required={ctx.isRequired() ? "true" : undefined}
      disabled={ctx.isDisabled() ?? false}
    />
  );
};

// 4. Description — registers so it's included in aria-describedby
const TextFieldDescription = (props: { children: Element }) => {
  const ctx = useFormControl();
  const id = ctx.generateId("description");
  onCleanup(ctx.registerDescription(id));
  return <span id={id}>{props.children}</span>;
};

// 5. ErrorMessage — registers only while rendered (Show handles mount/unmount)
const ErrorMessageInner = (props: { ctx: ReturnType<typeof createFormControl>; children: Element }) => {
  const id = props.ctx.generateId("error-message");
  onCleanup(props.ctx.registerErrorMessage(id));
  return <span id={id} role="alert">{props.children}</span>;
};
const TextFieldErrorMessage = (props: { children: Element }) => {
  const ctx = useFormControl();
  return (
    <Show when={ctx.validationState() === "invalid"}>
      <ErrorMessageInner ctx={ctx}>{props.children}</ErrorMessageInner>
    </Show>
  );
};

// Usage
<TextFieldRoot id="email" validationState={fieldError() ? "invalid" : undefined} required>
  <TextFieldLabel>Email address</TextFieldLabel>
  <TextFieldInput placeholder="you@example.com" />
  <TextFieldDescription>We'll never share your email.</TextFieldDescription>
  <TextFieldErrorMessage>Enter a valid email address.</TextFieldErrorMessage>
</TextFieldRoot>
```

When `validationState` is `"invalid"`, the error message component mounts, registers its ID, and `aria-describedby` on the input automatically expands to include it. When the state clears, the component unmounts and `onCleanup` removes its ID from the graph.

> **Note on `ErrorMessageInner`:** The inner component pattern is needed because when `Show`'s `when` prop is typed as `boolean`, Solid 2.0 types function children as `never`. Using a named inner component avoids the type error while keeping `onCleanup` scoped to the conditional branch.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `MaybeAccessor<string>` | Base ID for the field group. Auto-generated if omitted. |
| `name` | `MaybeAccessor<string>` | Form submission name. Falls back to `id`. |
| `validationState` | `MaybeAccessor<"valid" \| "invalid" \| undefined>` | Sets `data-valid` / `data-invalid` and controls whether the error message ID is included in `aria-describedby`. |
| `required` | `MaybeAccessor<boolean \| undefined>` | Sets `data-required`. |
| `disabled` | `MaybeAccessor<boolean \| undefined>` | Sets `data-disabled`. |
| `readOnly` | `MaybeAccessor<boolean \| undefined>` | Sets `data-readonly`. |

All props accept either a plain value or a reactive accessor `() => value`, so they compose naturally with signals.

### Context value (`FormControlContextValue`)

| Member | Type | Description |
|--------|------|-------------|
| `name()` | `Accessor<string>` | Resolved name (falls back to id) |
| `validationState()` | `Accessor<"valid" \| "invalid" \| undefined>` | Current validation state |
| `isRequired()` | `Accessor<boolean \| undefined>` | Whether the field is required |
| `isDisabled()` | `Accessor<boolean \| undefined>` | Whether the field is disabled |
| `isReadOnly()` | `Accessor<boolean \| undefined>` | Whether the field is read-only |
| `dataset()` | `Accessor<FormControlDataSet>` | All `data-*` attribute values — spread onto any element that should reflect state |
| `generateId(part)` | `(part: string) => string` | Returns `"${baseId}-${part}"` — use this to derive stable IDs for sub-elements |
| `labelId()` | `Accessor<string \| undefined>` | Currently registered label element ID |
| `fieldId()` | `Accessor<string \| undefined>` | Currently registered field element ID |
| `descriptionId()` | `Accessor<string \| undefined>` | Currently registered description element ID |
| `errorMessageId()` | `Accessor<string \| undefined>` | Currently registered error message element ID |
| `registerLabel(id)` | `(id: string) => () => void` | Registers a label ID; returns a cleanup function |
| `registerField(id)` | `(id: string) => () => void` | Registers the field ID; returns a cleanup function |
| `registerDescription(id)` | `(id: string) => () => void` | Registers a description ID; returns a cleanup function |
| `registerErrorMessage(id)` | `(id: string) => () => void` | Registers an error message ID; returns a cleanup function |
| `getAriaLabelledBy(fieldId, ariaLabel, ariaLabelledBy)` | `(fieldId, ariaLabel, ariaLabelledBy) => string \| undefined` | Computes the full `aria-labelledby` value |
| `getAriaDescribedBy(ariaDescribedBy)` | `(ariaDescribedBy) => string \| undefined` | Computes the full `aria-describedby` value |

### `data-*` attributes

`dataset()` returns an object where each active state is `""` (empty string) and inactive states are `undefined`. This follows the HTML convention for boolean data attributes — you can target them in CSS with attribute presence selectors:

```css
[data-invalid] { border-color: red; }
[data-disabled] { opacity: 0.5; }
[data-required] { /* required styling */ }
[data-readonly] { background: #f5f5f5; }
```

```tsx
// Spread onto any element that should reflect the field's state
<div {...ctx.dataset()}>...</div>
```

---

## `createFormControlInput`

Reads from `FormControlContext` (must be called inside a `<FormControlContext>`) and returns computed ARIA props for the actual input element. Uses a split `createEffect` to register and deregister the field's ID reactively.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `MaybeAccessor<string>` | Override the generated field ID. Defaults to `context.generateId("field")`. |
| `aria-label` | `MaybeAccessor<string>` | Passed through to `fieldProps.ariaLabel()`. |
| `aria-labelledby` | `MaybeAccessor<string>` | Merged into the computed `aria-labelledby` chain. |
| `aria-describedby` | `MaybeAccessor<string>` | Appended to the computed `aria-describedby` value. |

### Return value

```ts
{
  fieldProps: {
    id:              () => string;
    ariaLabel:       () => string | undefined;
    ariaLabelledBy:  () => string | undefined;
    ariaDescribedBy: () => string | undefined;
  }
}
```

### Usage

```tsx
const TextFieldInput = (props: { placeholder?: string }) => {
  const { fieldProps } = createFormControlInput({
    "aria-label": props["aria-label"],
  });
  const ctx = useFormControl();

  return (
    <input
      id={fieldProps.id()}
      aria-labelledby={fieldProps.ariaLabelledBy()}
      aria-describedby={fieldProps.ariaDescribedBy()}
      aria-label={fieldProps.ariaLabel()}
      aria-invalid={ctx.validationState() === "invalid" ? "true" : undefined}
      aria-required={ctx.isRequired() ? "true" : undefined}
      disabled={ctx.isDisabled() ?? false}
      readonly={ctx.isReadOnly() ?? false}
    />
  );
};
```

---

## `FormControlContext` + `useFormControl()`

`FormControlContext` is a standard Solid context. Provide a value from `createFormControl` and consume it in any descendant with `useFormControl()`.

```tsx
// Provider
const ctx = createFormControl({ id: "my-field", required: true });

<FormControlContext value={ctx}>
  <MyLabel />
  <MyInput />
  <MyDescription />
</FormControlContext>

// Consumer (inside any descendant component)
const ctx = useFormControl();
```

`useFormControl()` throws a `ContextNotFoundError` if called outside a `<FormControlContext>`.

---

## `aria-labelledby` chain

`getAriaLabelledBy` follows Kobalte's three-argument resolution logic. When both a visible label (`labelId`) and an explicit `aria-label` are present on the input, the **field's own ID** is appended to the chain. This ensures screen readers can announce all three — the visible label element, the field element itself, and the inline `aria-label` — in the correct order.

```txt
// No label registered, no aria-label                    → undefined
// Label registered, no aria-label                       → "field-label"
// Label registered + explicit aria-labelledby           → "external-label field-label"
// Label registered + aria-label on input                → "field-label field-field"
```

---

## `validationState` and error messages

`aria-describedby` is used for error messages rather than `aria-errormessage` — the latter has poor support in VoiceOver and NVDA. The error message ID enters `aria-describedby` as soon as the error message element mounts (registers via `registerErrorMessage`). The conditional behaviour comes entirely from whether the error component is rendered — typically gated by `<Show when={ctx.validationState() === "invalid"}>`.

---

## Standalone usage (without JSX context)

`createFormControl` can be used without the context provider — useful when building a single accessible field rather than a full headless component system:

```tsx
function AccessibleField() {
  const ctx = createFormControl({ id: "email" });

  const [value, setValue] = createSignal("");
  const error = () => (!value().includes("@") ? "Enter a valid email address" : null);

  // Register sub-elements synchronously (onCleanup handles deregistration)
  onCleanup(ctx.registerLabel("email-label"));
  onCleanup(ctx.registerDescription("email-desc"));

  const fieldId = "email-field";

  const ErrorMessage = () => {
    onCleanup(ctx.registerErrorMessage("email-error"));
    return <span id="email-error" role="alert">{error()}</span>;
  };

  return (
    <div>
      <label id="email-label" for={fieldId}>Email</label>
      <input
        id={fieldId}
        type="email"
        value={value()}
        onInput={e => setValue(e.currentTarget.value)}
        aria-labelledby={ctx.getAriaLabelledBy(fieldId, undefined, undefined)}
        aria-describedby={ctx.getAriaDescribedBy(undefined)}
        aria-invalid={error() ? "true" : undefined}
      />
      <span id="email-desc">We'll never share your email.</span>
      <Show when={error()}>
        <ErrorMessage />
      </Show>
    </div>
  );
}
```

---

## TypeScript

### Definition

```ts
function createFormControl(props: CreateFormControlProps): FormControlContextValue;
function createFormControlInput(props?: CreateFormControlInputProps): { fieldProps: FieldProps };

const FormControlContext: Context<FormControlContextValue | undefined>;
function useFormControl(): FormControlContextValue;

type CreateFormControlProps = {
  id?:              MaybeAccessor<string>;
  name?:            MaybeAccessor<string>;
  validationState?: MaybeAccessor<"valid" | "invalid" | undefined>;
  required?:        MaybeAccessor<boolean | undefined>;
  disabled?:        MaybeAccessor<boolean | undefined>;
  readOnly?:        MaybeAccessor<boolean | undefined>;
};

type CreateFormControlInputProps = {
  id?:                 MaybeAccessor<string>;
  "aria-label"?:       MaybeAccessor<string>;
  "aria-labelledby"?:  MaybeAccessor<string>;
  "aria-describedby"?: MaybeAccessor<string>;
};

type FormControlDataSet = {
  "data-valid"?:    "" | undefined;
  "data-invalid"?:  "" | undefined;
  "data-required"?: "" | undefined;
  "data-disabled"?: "" | undefined;
  "data-readonly"?: "" | undefined;
};

type FormControlContextValue = {
  name:                Accessor<string>;
  validationState:     Accessor<"valid" | "invalid" | undefined>;
  isRequired:          Accessor<boolean | undefined>;
  isDisabled:          Accessor<boolean | undefined>;
  isReadOnly:          Accessor<boolean | undefined>;
  dataset:             Accessor<FormControlDataSet>;
  labelId:             Accessor<string | undefined>;
  fieldId:             Accessor<string | undefined>;
  descriptionId:       Accessor<string | undefined>;
  errorMessageId:      Accessor<string | undefined>;
  generateId:          (part: string) => string;
  registerLabel:       (id: string) => () => void;
  registerField:       (id: string) => () => void;
  registerDescription: (id: string) => () => void;
  registerErrorMessage:(id: string) => () => void;
  getAriaLabelledBy:   (fieldId: string | undefined, ariaLabel: string | undefined, ariaLabelledBy: string | undefined) => string | undefined;
  getAriaDescribedBy:  (ariaDescribedBy: string | undefined) => string | undefined;
};
```

---

## Attribution

Adapted from [Kobalte](https://kobalte.dev) by Jeremy Lindblom et al. (MIT), which itself is based on [React Aria](https://react-spectrum.adobe.com/react-aria/) by Adobe (Apache 2.0). See [LICENSE](./LICENSE) for full attribution.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
