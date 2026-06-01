import { type JSX, createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createForm } from "../src/index.js";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  Container,
  Separator,
  StatRow,
  colors,
  font,
  inputStyle,
} from "../../../.storybook/ui/index.js";

// ─── Validators ───────────────────────────────────────────────────────────────

const required = (v: string) => (v.trim() === "" ? "Required" : null);
const isEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email");
const minLength = (n: number) => (v: string) => v.length < n ? `Min ${n} chars` : null;
const hasUppercase = (v: string) => (/[A-Z]/.test(v) ? null : "Needs an uppercase letter");

// ─── Local helpers ────────────────────────────────────────────────────────────

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

// ─── Validate on change ───────────────────────────────────────────────────────

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

// ─── Validate on blur ─────────────────────────────────────────────────────────

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

// ─── Validate on submit ───────────────────────────────────────────────────────

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

// ─── Cross-field rule ─────────────────────────────────────────────────────────

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

// ─── Async validator ──────────────────────────────────────────────────────────

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
