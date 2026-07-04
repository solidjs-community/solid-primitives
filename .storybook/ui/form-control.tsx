import { type JSX, Show, onCleanup } from "solid-js";
import {
  type FormControlContextValue,
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "@solid-primitives/a11y";
import { colors, font, radii } from "./tokens.js";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TextFieldRootProps = {
  id?: string;
  name?: string;
  validationState?: "valid" | "invalid" | undefined;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  children: JSX.Element;
};

export type TextFieldInputProps = {
  placeholder?: string;
  type?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

/**
 * Provides the form-control context for a text field group.
 * Renders a flex-column wrapper and spreads data-* attributes for styling hooks.
 */
export const TextFieldRoot = (props: TextFieldRootProps) => {
  const ctx = createFormControl(props);
  return (
    <FormControlContext value={ctx}>
      <div
        style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}
        {...ctx.dataset()}
      >
        {props.children}
      </div>
    </FormControlContext>
  );
};

// ─── Label ────────────────────────────────────────────────────────────────────

/**
 * Registers itself as the field label and shows an asterisk for required fields.
 */
export const TextFieldLabel = (props: { children: JSX.Element }) => {
  const ctx = useFormControl();
  const id = ctx.generateId("label");
  onCleanup(ctx.registerLabel(id));
  return (
    <label
      id={id}
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "0.2rem",
        "font-size": font.sizeSm,
        "font-weight": "500",
        color: ctx.isDisabled() ? colors.mutedFg : colors.muted,
        cursor: ctx.isDisabled() ? "not-allowed" : "default",
        "user-select": "none",
      }}
    >
      {props.children}
      <Show when={ctx.isRequired()}>
        <span style={{ color: "#e11d48", "font-size": "0.65rem", "line-height": "1" }} aria-hidden="true">
          ✱
        </span>
      </Show>
    </label>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * The actual input element. Reads ARIA state from context and applies
 * validation-state border colours.
 */
export const TextFieldInput = (props: TextFieldInputProps) => {
  const { fieldProps } = createFormControlInput({
    id: props.id,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-describedby": props["aria-describedby"],
  });
  const ctx = useFormControl();

  const borderColor = () => {
    if (ctx.validationState() === "invalid") return "#e11d48";
    if (ctx.validationState() === "valid") return "#16a34a";
    return colors.border;
  };

  const boxShadow = () => {
    if (ctx.validationState() === "invalid") return "0 0 0 3px rgba(225,29,72,0.12)";
    if (ctx.validationState() === "valid") return "0 0 0 3px rgba(22,163,74,0.12)";
    return "none";
  };

  return (
    <input
      id={fieldProps.id()}
      type={props.type ?? "text"}
      placeholder={props.placeholder}
      aria-labelledby={fieldProps.ariaLabelledBy()}
      aria-describedby={fieldProps.ariaDescribedBy()}
      aria-invalid={ctx.validationState() === "invalid" ? "true" : undefined}
      aria-required={ctx.isRequired() ? "true" : undefined}
      disabled={ctx.isDisabled() ?? false}
      readonly={ctx.isReadOnly() ?? false}
      style={{
        display: "block",
        width: "100%",
        padding: "0.45rem 0.75rem",
        "font-size": font.sizeBase,
        "font-family": font.system,
        "line-height": "1.5",
        color: ctx.isDisabled() ? colors.mutedFg : colors.dark,
        background: ctx.isDisabled() || ctx.isReadOnly() ? colors.surface : "#ffffff",
        border: `1px solid ${borderColor()}`,
        "border-radius": radii.md,
        "box-shadow": boxShadow(),
        "box-sizing": "border-box",
        outline: "none",
        cursor: ctx.isDisabled() ? "not-allowed" : ctx.isReadOnly() ? "default" : "text",
        opacity: ctx.isDisabled() ? "0.6" : "1",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    />
  );
};

// ─── Description ─────────────────────────────────────────────────────────────

/**
 * Helper text shown below the input. Always rendered; always included in aria-describedby.
 */
export const TextFieldDescription = (props: { children: JSX.Element }) => {
  const ctx = useFormControl();
  const id = ctx.generateId("description");
  onCleanup(ctx.registerDescription(id));
  return (
    <span
      id={id}
      style={{
        "font-size": font.sizeSm,
        "line-height": "1.45",
        color: colors.mutedFg,
      }}
    >
      {props.children}
    </span>
  );
};

// ─── Error message ────────────────────────────────────────────────────────────

const ErrorMessageInner = (props: { ctx: FormControlContextValue; children: JSX.Element }) => {
  const id = props.ctx.generateId("error-message");
  onCleanup(props.ctx.registerErrorMessage(id));
  return (
    <span
      id={id}
      role="alert"
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "0.3rem",
        "font-size": font.sizeSm,
        "line-height": "1.45",
        color: "#e11d48",
      }}
    >
      <span aria-hidden="true" style={{ "font-size": "0.7rem", "flex-shrink": "0" }}>
        ✖
      </span>
      {props.children}
    </span>
  );
};

/**
 * Mounts only when `validationState === "invalid"`, registers its ID into
 * `errorMessageId`, and unmounts (deregisters) when valid again.
 */
export const TextFieldErrorMessage = (props: { children: JSX.Element }) => {
  const ctx = useFormControl();
  return (
    <Show when={ctx.validationState() === "invalid"}>
      <ErrorMessageInner ctx={ctx}>{props.children}</ErrorMessageInner>
    </Show>
  );
};
