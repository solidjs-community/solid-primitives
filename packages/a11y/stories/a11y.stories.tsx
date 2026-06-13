import { type JSX, For, Show, createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import readme from "../README.md?raw";
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "../src/index.js";
import {
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

// ─── Local helpers ────────────────────────────────────────────────────────────

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
  title: "Inputs/a11y",
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

// ─── Accessible field (raw API) ───────────────────────────────────────────────

export const StandaloneField = meta.story({
  name: "Accessible field",
  parameters: {
    docs: {
      description: {
        story:
          "`createFormControl` can be used without JSX context. Call `registerLabel`, `registerDescription`, and `registerErrorMessage` on mount and pass the returned cleanup to `onCleanup`. The debug panel shows the live ARIA attribute values as the error message mounts and unmounts.",
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

// ─── Sub-component pattern ────────────────────────────────────────────────────

export const SubComponentPattern = meta.story({
  name: "Sub-component pattern",
  parameters: {
    docs: {
      description: {
        story:
          "`FormControlContext` + `createFormControlInput` enables Kobalte-style headless sub-components. `TextFieldRoot` provides the context; each child (`TextFieldLabel`, `TextFieldInput`, `TextFieldDescription`, `TextFieldErrorMessage`) registers itself on mount and deregisters on unmount — the ARIA graph builds automatically.",
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

// ─── Validation states ────────────────────────────────────────────────────────

export const ValidationStates = meta.story({
  name: "Validation states",
  parameters: {
    docs: {
      description: {
        story:
          "`validationState`, `required`, `disabled`, and `readOnly` propagate through the context as reactive accessors. The input border changes colour, the label shows a required asterisk, and the error message mounts/unmounts — all from the same context signals.",
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

// ─── aria-labelledby chain ────────────────────────────────────────────────────

export const AriaLabelledByChain = meta.story({
  name: "aria-labelledby chain",
  parameters: {
    docs: {
      description: {
        story:
          "When both a visible label and an explicit `aria-label` are present, `getAriaLabelledBy` appends the field's own ID so screen readers announce both. The debug panel shows the computed value with and without the `aria-label` prop.",
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
