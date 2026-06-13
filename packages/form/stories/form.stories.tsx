import { type JSX, For, Show, createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createForm,
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  Container,
  Section,
  Separator,
  StatRow,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldRoot,
  colors,
  font,
  inputStyle,
  radii,
} from "../../../.storybook/ui/index.js";

// ─── Validators ───────────────────────────────────────────────────────────────

const required = (v: string) => (v.trim() === "" ? "Required" : null);
const isEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email");
const minLength = (n: number) => (v: string) => v.length < n ? `Min ${n} chars` : null;
const hasUppercase = (v: string) => (/[A-Z]/.test(v) ? null : "Needs an uppercase letter");

// ─── Local story helpers ──────────────────────────────────────────────────────

const FieldRow = (props: { label: string; error?: string | null; hint?: string; children: JSX.Element }) => (
  <div style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
    <label style={{ "font-size": font.sizeSm, color: colors.muted }}>{props.label}</label>
    {props.children}
    <Show when={props.hint && !props.error}>
      <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>{props.hint}</span>
    </Show>
    <Show when={props.error}>
      <span style={{ "font-size": font.sizeSm, color: "#dc2626" }}>{props.error}</span>
    </Show>
  </div>
);

const MonoValue = (props: { children: JSX.Element }) => (
  <span
    style={{
      "font-family": font.mono,
      "font-size": font.sizeSm,
      color: colors.primary,
      background: "#f0f4ff",
      padding: "0.1rem 0.35rem",
      "border-radius": radii.sm,
    }}
  >
    {props.children}
  </span>
);

const AriaDebug = (props: { entries: { attr: string; value: string | undefined }[] }) => (
  <div
    style={{
      display: "flex",
      "flex-direction": "column",
      gap: "0.3rem",
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      "border-radius": radii.md,
      padding: "0.6rem 0.75rem",
    }}
  >
    <span style={{ "font-size": font.sizeSm, color: colors.muted, "margin-bottom": "0.15rem", "font-weight": "600" }}>
      Computed ARIA
    </span>
    <For each={props.entries}>
      {entry => (
        <div style={{ display: "flex", gap: "0.5rem", "align-items": "baseline", "font-size": font.sizeSm }}>
          <span style={{ color: colors.muted, "min-width": "11rem", "flex-shrink": "0" }}>{entry.attr}</span>
          <Show when={entry.value !== undefined} fallback={<span style={{ color: colors.mutedFg }}>—</span>}>
            <MonoValue>{entry.value}</MonoValue>
          </Show>
        </div>
      )}
    </For>
  </div>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = preview.meta({
  title: "Reactivity/Form",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// createForm
// ═══════════════════════════════════════════════════════════════════════════════

export const ValidateOnChange = meta.story({
  name: "Validate on change",
  parameters: {
    docs: {
      description: {
        story:
          'Errors appear immediately as the user types (`validateOn: "change"`, the default). `form.valid()` gates the submit button; `form.submitting()` reflects the async `onSubmit` in flight.',
      },
    },
  },
  render: () => {
    const [success, setSuccess] = createSignal(false);

    const form = createForm({
      fields: {
        email:    { initial: "", validate: [required, isEmail] },
        password: { initial: "", validate: [required, minLength(8), hasUppercase] },
      },
      onSubmit: async () => {
        await new Promise<void>(r => setTimeout(r, 800));
        setSuccess(true);
      },
    });

    return (
      <Container width={320}>
        <Show when={success()}>
          <Badge variant="success">Signed in!</Badge>
        </Show>
        <form ref={form.ref} style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <FieldRow label="Email" error={form.fields.email.error()}>
            <input ref={form.bind("email")} type="email" placeholder="you@example.com" style={inputStyle} />
          </FieldRow>
          <FieldRow label="Password" error={form.fields.password.error()}>
            <input ref={form.bind("password")} type="password" placeholder="Min 8 chars, 1 uppercase" style={inputStyle} />
          </FieldRow>
          <Button type="submit" disabled={!form.valid() || form.submitting()}>
            {form.submitting() ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <Separator />
        <BoolRow label="valid"      value={form.valid()} />
        <BoolRow label="dirty"      value={form.dirty()} />
        <BoolRow label="submitting" value={form.submitting()} />
      </Container>
    );
  },
});

export const ValidateOnBlur = meta.story({
  name: "Validate on blur",
  parameters: {
    docs: {
      description: {
        story:
          'With `validateOn: "blur"`, errors are hidden while the user is typing and only appear after the field loses focus. `field.touched()` tracks whether focus has left each field at least once.',
      },
    },
  },
  render: () => {
    const form = createForm({
      fields: {
        username: { initial: "", validate: [required, minLength(3)] },
        email:    { initial: "", validate: [required, isEmail] },
      },
      validateOn: "blur",
    });

    return (
      <Container width={320}>
        <form ref={form.ref} style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <FieldRow label="Username" error={form.fields.username.error()} hint="Tab away to validate">
            <input ref={form.bind("username")} placeholder="At least 3 chars" style={inputStyle} />
          </FieldRow>
          <FieldRow label="Email" error={form.fields.email.error()} hint="Tab away to validate">
            <input ref={form.bind("email")} type="email" placeholder="you@example.com" style={inputStyle} />
          </FieldRow>
          <Button type="submit" disabled={!form.valid()}>Continue</Button>
        </form>
        <Separator />
        <BoolRow label="username.touched" value={form.fields.username.touched()} />
        <BoolRow label="email.touched"    value={form.fields.email.touched()} />
        <BoolRow label="valid"            value={form.valid()} />
      </Container>
    );
  },
});

export const ValidateOnSubmit = meta.story({
  name: "Errors on first submit",
  parameters: {
    docs: {
      description: {
        story:
          'With `validateOn: "submit"`, the form appears clean while the user fills it in. All errors reveal at once on the first submit attempt. `form.submitted()` stays `true` until `form.reset()` is called.',
      },
    },
  },
  render: () => {
    const form = createForm({
      fields: {
        first: { initial: "", validate: required },
        last:  { initial: "", validate: required },
        email: { initial: "", validate: [required, isEmail] },
      },
      validateOn: "submit",
    });

    return (
      <Container width={320}>
        <form ref={form.ref} style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <FieldRow label="First name" error={form.fields.first.error()}>
            <input ref={form.bind("first")} placeholder="Jane" style={inputStyle} />
          </FieldRow>
          <FieldRow label="Last name" error={form.fields.last.error()}>
            <input ref={form.bind("last")} placeholder="Doe" style={inputStyle} />
          </FieldRow>
          <FieldRow label="Email" error={form.fields.email.error()}>
            <input ref={form.bind("email")} type="email" placeholder="jane@example.com" style={inputStyle} />
          </FieldRow>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button type="submit">Submit</Button>
            <Show when={form.submitted()}>
              <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
            </Show>
          </div>
        </form>
        <Separator />
        <BoolRow label="submitted" value={form.submitted()} />
        <BoolRow label="valid"     value={form.valid()} />
        <StatRow label="error count" value={Object.keys(form.errors()).length} />
      </Container>
    );
  },
});

export const CrossFieldRule = meta.story({
  name: "Passwords must match",
  parameters: {
    docs: {
      description: {
        story:
          "`form.validate(fn)` registers a cross-field rule that runs over all values reactively. The returned `Accessor<string | null>` can be rendered directly and its error blocks `form.valid()` — preventing submission until the rule passes.",
      },
    },
  },
  render: () => {
    const form = createForm({
      fields: {
        password: { initial: "", validate: [required, minLength(8)] },
        confirm:  { initial: "", validate: required },
      },
    });

    const matchError = form.validate(v =>
      v.password && v.confirm && v.password !== v.confirm ? "Passwords do not match" : null,
    );

    return (
      <Container width={320}>
        <form ref={form.ref} style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <FieldRow label="Password" error={form.fields.password.error()}>
            <input ref={form.bind("password")} type="password" placeholder="Min 8 chars" style={inputStyle} />
          </FieldRow>
          <FieldRow label="Confirm" error={form.fields.confirm.error() ?? matchError()}>
            <input ref={form.bind("confirm")} type="password" placeholder="Repeat password" style={inputStyle} />
          </FieldRow>
          <Button type="submit" disabled={!form.valid()}>Create account</Button>
        </form>
        <Separator />
        <BoolRow label="valid" value={form.valid()} />
        <Show when={matchError()}>
          <Badge variant="error">{matchError()!}</Badge>
        </Show>
      </Container>
    );
  },
});

const TAKEN = new Set(["admin", "root", "solid"]);
const checkAvailable = (username: string): Promise<string | null> =>
  new Promise(resolve =>
    setTimeout(
      () => resolve(TAKEN.has(username.toLowerCase()) ? "Username is taken" : null),
      700,
    ),
  );

export const AsyncAvailabilityCheck = meta.story({
  name: "Async availability check",
  parameters: {
    docs: {
      description: {
        story:
          "A validator may return `Promise<string | null>`. While the check runs, `field.pending()` and `form.pending()` are `true` and `form.valid()` is `false`. Stale results from superseded checks are automatically discarded. Try typing `admin`, `root`, or `solid`.",
      },
    },
  },
  render: () => {
    const form = createForm({
      fields: {
        username: {
          initial: "",
          validate: [required, minLength(3), checkAvailable],
          validateOn: "blur",
        },
      },
    });

    return (
      <Container width={320}>
        <FieldRow label="Username" error={form.fields.username.error()} hint="Tab away to check availability">
          <div style={{ position: "relative" }}>
            <input
              ref={form.bind("username")}
              placeholder="Try: admin, root, solid"
              style={inputStyle}
            />
            <Show when={form.fields.username.pending()}>
              <span
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  "font-size": font.sizeSm,
                  color: colors.muted,
                  "pointer-events": "none",
                }}
              >
                checking…
              </span>
            </Show>
          </div>
        </FieldRow>
        <Button onClick={() => void form.submit()} disabled={!form.valid() || form.pending()}>
          Reserve username
        </Button>
        <Separator />
        <BoolRow label="pending" value={form.fields.username.pending()} />
        <BoolRow label="valid"   value={form.valid()} />
      </Container>
    );
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// createFormControl
// ═══════════════════════════════════════════════════════════════════════════════

export const StandaloneField = meta.story({
  name: "Accessible field",
  parameters: {
    docs: {
      description: {
        story:
          "`createFormControl` wires up the ARIA graph for a labeled field without any JSX context. Register each element with `registerLabel` / `registerDescription` / `registerErrorMessage` and pass the returned cleanup to `onCleanup`. The debug panel shows the live attribute values as the error message mounts and unmounts.",
      },
    },
  },
  render: () => {
    const ctx = createFormControl({ id: "email" });

    const [value, setValue] = createSignal("");
    const [touched, setTouched] = createSignal(false);
    const error = () => (touched() && !value().includes("@") ? "Enter a valid email address" : null);

    onCleanup(ctx.registerLabel("email-label"));
    onCleanup(ctx.registerDescription("email-desc"));

    const fieldId = "email-field";
    const ariaLabelledBy = () => ctx.getAriaLabelledBy(fieldId, undefined, undefined);
    const ariaDescribedBy = () => ctx.getAriaDescribedBy(undefined);

    const ErrorMessage = () => {
      onCleanup(ctx.registerErrorMessage("email-error"));
      return (
        <span id="email-error" role="alert" style={{ "font-size": font.sizeSm, color: "#e11d48" }}>
          {error()}
        </span>
      );
    };

    return (
      <Container width={380}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
            <label
              id="email-label"
              for={fieldId}
              style={{ "font-size": font.sizeSm, color: colors.muted, "font-weight": "500" }}
            >
              Email address
            </label>
            <input
              id={fieldId}
              type="email"
              value={value()}
              onInput={e => setValue(e.currentTarget.value)}
              onBlur={() => setTouched(true)}
              aria-labelledby={ariaLabelledBy()}
              aria-describedby={ariaDescribedBy()}
              aria-invalid={error() ? "true" : undefined}
              placeholder="you@example.com"
              style={{
                ...inputStyle,
                "border-color": error() ? "#e11d48" : colors.border,
                "box-shadow": error() ? "0 0 0 3px rgba(225,29,72,0.12)" : "none",
                outline: "none",
              }}
            />
            <span id="email-desc" style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
              We'll never share your email.
            </span>
            <Show when={error()}>
              <ErrorMessage />
            </Show>
          </div>
          <Separator />
          <AriaDebug
            entries={[
              { attr: "labelId()", value: ctx.labelId() },
              { attr: "descriptionId()", value: ctx.descriptionId() },
              { attr: "errorMessageId()", value: ctx.errorMessageId() },
              { attr: "aria-labelledby", value: ariaLabelledBy() },
              { attr: "aria-describedby", value: ariaDescribedBy() },
            ]}
          />
          <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
            Blur the input with an invalid value to see the error message register.
          </span>
        </div>
      </Container>
    );
  },
});

export const SubComponentPattern = meta.story({
  name: "Sub-component pattern",
  parameters: {
    docs: {
      description: {
        story:
          "The primary use case: `FormControlContext` + `createFormControlInput` enables Kobalte-style headless sub-components. `TextFieldRoot` provides the context; each child registers itself on mount and deregisters on unmount — the ARIA graph builds automatically.",
      },
    },
  },
  render: () => {
    const [state, setState] = createSignal<"valid" | "invalid" | undefined>(undefined);

    return (
      <Container width={360}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <TextFieldRoot id="signup-email" validationState={state()} required>
            <TextFieldLabel>Work email</TextFieldLabel>
            <TextFieldInput type="email" placeholder="you@company.com" />
            <TextFieldDescription>Used for account notifications.</TextFieldDescription>
            <TextFieldErrorMessage>Please enter a valid email address.</TextFieldErrorMessage>
          </TextFieldRoot>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button onClick={() => setState("valid")}>Set valid</Button>
            <Button onClick={() => setState("invalid")}>Set invalid</Button>
            <Button variant="outline" onClick={() => setState(undefined)}>Reset</Button>
          </div>
        </div>
        <Separator />
        <StatRow label="validationState" value={state() ?? "—"} />
        <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
          Inspect the input in DevTools to see aria-labelledby, aria-describedby, and aria-invalid update.
        </span>
      </Container>
    );
  },
});

export const ValidationStates = meta.story({
  name: "Validation states",
  parameters: {
    docs: {
      description: {
        story:
          "`validationState`, `required`, `disabled`, and `readOnly` propagate through the context as reactive accessors. The input border, label asterisk, and error message all respond to state changes.",
      },
    },
  },
  render: () => {
    const [validationState, setValidationState] = createSignal<"valid" | "invalid" | undefined>(undefined);
    const [req, setReq] = createSignal(false);
    const [dis, setDis] = createSignal(false);
    const [ro, setRo] = createSignal(false);

    return (
      <Container width={400}>
        <TextFieldRoot
          id="demo"
          validationState={validationState()}
          required={req()}
          disabled={dis()}
          readOnly={ro()}
        >
          <TextFieldLabel>Field label</TextFieldLabel>
          <TextFieldInput placeholder="Type something…" />
          <TextFieldDescription>This is the description text.</TextFieldDescription>
          <TextFieldErrorMessage>Something went wrong.</TextFieldErrorMessage>
        </TextFieldRoot>
        <Separator />
        <Section title="Toggle flags">
          <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
            <Button
              variant={validationState() === "valid" ? "primary" : "outline"}
              onClick={() => setValidationState(v => (v === "valid" ? undefined : "valid"))}
            >
              valid
            </Button>
            <Button
              variant={validationState() === "invalid" ? "primary" : "outline"}
              onClick={() => setValidationState(v => (v === "invalid" ? undefined : "invalid"))}
            >
              invalid
            </Button>
            <Button variant={req() ? "primary" : "outline"} onClick={() => setReq(v => !v)}>required</Button>
            <Button variant={dis() ? "primary" : "outline"} onClick={() => setDis(v => !v)}>disabled</Button>
            <Button variant={ro() ? "primary" : "outline"} onClick={() => setRo(v => !v)}>readOnly</Button>
          </div>
        </Section>
      </Container>
    );
  },
});

export const AriaLabelledByChain = meta.story({
  name: "aria-labelledby chain",
  parameters: {
    docs: {
      description: {
        story:
          "When both a visible label and an explicit `aria-label` are present, `getAriaLabelledBy` adds the field's own ID to the chain so screen readers announce both. The debug panel shows the difference.",
      },
    },
  },
  render: () => {
    const ctx = createFormControl({ id: "search" });
    onCleanup(ctx.registerLabel("search-label"));
    onCleanup(ctx.registerDescription("search-hint"));

    const fieldId = ctx.generateId("field");
    const withAriaLabel = () => ctx.getAriaLabelledBy(fieldId, "Site search", undefined);
    const withoutAriaLabel = () => ctx.getAriaLabelledBy(fieldId, undefined, undefined);

    return (
      <Container width={420}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
            <label
              id="search-label"
              for={fieldId}
              style={{ "font-size": font.sizeSm, color: colors.muted, "font-weight": "500" }}
            >
              Search
            </label>
            <input
              id={fieldId}
              type="search"
              placeholder="Type to search…"
              aria-labelledby={withAriaLabel()}
              aria-describedby={ctx.getAriaDescribedBy(undefined)}
              style={{ ...inputStyle, outline: "none" }}
            />
            <span id="search-hint" style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
              Press / to focus
            </span>
          </div>
          <Separator />
          <AriaDebug
            entries={[
              { attr: "with aria-label", value: withAriaLabel() },
              { attr: "without aria-label", value: withoutAriaLabel() },
              { attr: "aria-describedby", value: ctx.getAriaDescribedBy(undefined) },
            ]}
          />
          <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
            When <MonoValue>aria-label</MonoValue> is present alongside a visible label, the field's own ID is appended so screen readers announce all three.
          </span>
        </div>
      </Container>
    );
  },
});
