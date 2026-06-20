import { type Element, For, Show, createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import readme from "../README.md?raw";
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
  createAnnounce,
  createReducedMotion,
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

const MonoValue = (props: { children: Element }) => (
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

// ─── createAnnounce ───────────────────────────────────────────────────────────

export const Announce = meta.story({
  name: "Screen reader announcements",
  parameters: {
    docs: {
      description: {
        story:
          "`createAnnounce` appends two hidden ARIA live regions to `document.body` and returns an `announce(message, politeness?)` function. Use `\"polite\"` (default) for status updates and `\"assertive\"` for urgent errors. Open your screen reader to hear the announcements.",
      },
    },
  },
  render: () => {
    const announce = createAnnounce();
    const [message, setMessage] = createSignal("Changes saved successfully");
    const [politeness, setPoliteness] = createSignal<"polite" | "assertive">("polite");
    const [log, setLog] = createSignal<{ text: string; p: string }[]>([]);

    const send = () => {
      const text = message();
      const p = politeness();
      if (!text.trim()) return;
      announce(text, p);
      setLog(prev => [{ text, p }, ...prev].slice(0, 5));
    };

    return (
      <Container width={400}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
            <label style={{ "font-size": font.sizeSm, color: colors.muted, "font-weight": "500" }}>
              Message
            </label>
            <input
              value={message()}
              onInput={e => setMessage(e.currentTarget.value)}
              style={{ ...inputStyle, outline: "none" }}
              placeholder="Enter announcement text…"
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant={politeness() === "polite" ? "primary" : "outline"}
              onClick={() => setPoliteness("polite")}
            >
              polite
            </Button>
            <Button
              variant={politeness() === "assertive" ? "primary" : "outline"}
              onClick={() => setPoliteness("assertive")}
            >
              assertive
            </Button>
          </div>
          <Button onClick={send}>Announce</Button>
        </div>
        <Separator />
        <Section title="Announcement log">
          <Show
            when={log().length > 0}
            fallback={
              <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
                No announcements yet — click Announce above.
              </span>
            }
          >
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
              <For each={log()}>
                {entry => (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      "align-items": "baseline",
                      "font-size": font.sizeSm,
                    }}
                  >
                    <span
                      style={{
                        color: entry.p === "assertive" ? "#e11d48" : colors.primary,
                        "font-weight": "600",
                        "min-width": "5.5rem",
                        "flex-shrink": "0",
                      }}
                    >
                      {entry.p}
                    </span>
                    <span style={{ color: colors.dark }}>{entry.text}</span>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Section>
      </Container>
    );
  },
});

// ─── createReducedMotion ──────────────────────────────────────────────────────

export const ReducedMotion = meta.story({
  name: "Reduced motion preference",
  parameters: {
    docs: {
      description: {
        story:
          "`createReducedMotion` returns a reactive `Accessor<boolean>` that mirrors the user's `prefers-reduced-motion` OS setting. When `true`, suppress or replace animations. Toggle in macOS: System Settings → Accessibility → Display → Reduce Motion.",
      },
    },
  },
  render: () => {
    const osPrefersReduced = createReducedMotion();
    const [override, setOverride] = createSignal<boolean | undefined>(undefined);
    const prefersReduced = () => override() ?? osPrefersReduced();

    return (
      <Container width={380}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
          <BoolRow label="prefersReduced()" value={prefersReduced()} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant={prefersReduced() ? "primary" : "outline"}
              onClick={() => setOverride(v => (v === true ? undefined : true))}
            >
              Enable reduced motion
            </Button>
            <Button
              variant={!prefersReduced() ? "primary" : "outline"}
              onClick={() => setOverride(v => (v === false ? undefined : false))}
            >
              Disable reduced motion
            </Button>
          </div>
          <Separator />
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
            <span style={{ "font-size": font.sizeSm, color: colors.muted, "font-weight": "500" }}>
              Demo element
            </span>
            <div
              style={{
                padding: "0.75rem 1rem",
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                "border-radius": radii.md,
                "font-size": font.sizeSm,
                color: colors.dark,
                animation: prefersReduced() ? "none" : "a11y-pulse 2s ease-in-out infinite",
              }}
            >
              <Show
                when={prefersReduced()}
                fallback={<span>Animation active — enable Reduce Motion to suppress it.</span>}
              >
                <span>Motion reduced — animation suppressed.</span>
              </Show>
            </div>
          </div>
          <style>{`
            @keyframes a11y-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
              50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
            }
          `}</style>
          <Show when={override() !== undefined}>
            <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
              Overriding OS preference. Click the active button again to clear.
            </span>
          </Show>
        </div>
      </Container>
    );
  },
});

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

// ─── Context provider pattern ─────────────────────────────────────────────────

export const ContextProviderPattern = meta.story({
  name: "Context provider pattern",
  parameters: {
    docs: {
      description: {
        story:
          "Shows how to wire `<FormControlContext value={ctx}>` and `useFormControl()` directly — without any storybook UI helpers. Each sub-component calls `useFormControl()`, derives its ID with `ctx.generateId()`, registers on mount via `onCleanup(ctx.register*(id))`, and the input calls `createFormControlInput()` to get its computed ARIA props.",
      },
    },
  },
  render: () => {
    const [validationState, setValidationState] = createSignal<"valid" | "invalid" | undefined>(
      undefined,
    );

    // ── Sub-components built inline to show the raw wiring ───────────────────

    const Label = (props: { children: Element }) => {
      const ctx = useFormControl();
      const id = ctx.generateId("label");
      onCleanup(ctx.registerLabel(id));
      return (
        <label
          id={id}
          style={{ "font-size": font.sizeSm, "font-weight": "500", color: colors.muted }}
        >
          {props.children}
        </label>
      );
    };

    const Input = (props: { placeholder?: string; type?: string }) => {
      const { fieldProps } = createFormControlInput();
      const ctx = useFormControl();
      return (
        <input
          id={fieldProps.id()}
          type={props.type ?? "text"}
          placeholder={props.placeholder}
          aria-labelledby={fieldProps.ariaLabelledBy()}
          aria-describedby={fieldProps.ariaDescribedBy()}
          aria-invalid={ctx.validationState() === "invalid" ? "true" : undefined}
          aria-required={ctx.isRequired() ? "true" : undefined}
          style={{ ...inputStyle, outline: "none" }}
        />
      );
    };

    const Description = (props: { children: Element }) => {
      const ctx = useFormControl();
      const id = ctx.generateId("description");
      onCleanup(ctx.registerDescription(id));
      return (
        <span id={id} style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
          {props.children}
        </span>
      );
    };

    const ErrorMessageInner = (props: { children: Element }) => {
      const ctx = useFormControl();
      const id = ctx.generateId("error-message");
      onCleanup(ctx.registerErrorMessage(id));
      return (
        <span id={id} role="alert" style={{ "font-size": font.sizeSm, color: "#e11d48" }}>
          {props.children}
        </span>
      );
    };

    const ErrorMessage = (props: { children: Element }) => {
      const ctx = useFormControl();
      return (
        <Show when={ctx.validationState() === "invalid"}>
          <ErrorMessageInner>{props.children}</ErrorMessageInner>
        </Show>
      );
    };

    // ── Root: creates context, provides it ───────────────────────────────────

    const ctx = createFormControl({ id: "ctx-demo", validationState, required: true });

    return (
      <Container width={360}>
        <FormControlContext value={ctx}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
            <Label>Username</Label>
            <Input placeholder="Enter a username…" />
            <Description>Must be unique across all accounts.</Description>
            <ErrorMessage>Username is required.</ErrorMessage>
          </div>
        </FormControlContext>
        <Separator />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={() => setValidationState("valid")}>Set valid</Button>
          <Button onClick={() => setValidationState("invalid")}>Set invalid</Button>
          <Button variant="outline" onClick={() => setValidationState(undefined)}>Reset</Button>
        </div>
        <StatRow label="validationState" value={validationState() ?? "—"} />
        <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
          Inspect the input in DevTools — aria-labelledby, aria-describedby, and aria-invalid
          update as the state changes.
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
  name: "Label chain resolution",
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
