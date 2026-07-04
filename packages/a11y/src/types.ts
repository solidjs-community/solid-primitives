import type { Accessor } from "solid-js";
import type { MaybeAccessor } from "@solid-primitives/utils";

/** Props accepted by `createFormControl`. All values may be static or reactive accessors. */
export type CreateFormControlProps = {
  /**
   * Stable identifier for this field group. Used as the prefix for all generated sub-element
   * IDs (label, field, description, error). Auto-generated via `createUniqueId()` if omitted —
   * but prefer supplying an explicit ID in SSR contexts to avoid hydration mismatches.
   */
  id?: MaybeAccessor<string>;
  /**
   * HTML `name` attribute forwarded to the underlying input. Falls back to `id` when omitted,
   * which is sufficient for most single-input groups.
   */
  name?: MaybeAccessor<string>;
  /** Whether the current value passes (`"valid"`) or fails (`"invalid"`) validation. `undefined` means neutral — no validation feedback shown. */
  validationState?: MaybeAccessor<"valid" | "invalid" | undefined>;
  /** When `true`, sub-components should render a required indicator and set `aria-required`. */
  required?: MaybeAccessor<boolean | undefined>;
  /** When `true`, sub-components should disable user interaction and set `disabled`/`aria-disabled`. */
  disabled?: MaybeAccessor<boolean | undefined>;
  /** When `true`, the field value is visible but not editable. Sub-components should set `readonly`/`aria-readonly`. */
  readOnly?: MaybeAccessor<boolean | undefined>;
};

/** Props accepted by `createFormControlInput`. All values may be static or reactive accessors. */
export type CreateFormControlInputProps = {
  /**
   * Explicit ID for the input element. Defaults to `context.generateId("field")` so that the
   * label's `for` attribute and `aria-labelledby` chains stay in sync without manual IDs.
   */
  id?: MaybeAccessor<string>;
  /** Inline label text. When present alongside a visible label, the input's own ID is appended to `aria-labelledby` so screen readers announce both. */
  "aria-label"?: MaybeAccessor<string>;
  /** Space-separated list of IDs that label this input. Merged with the registered label ID. */
  "aria-labelledby"?: MaybeAccessor<string>;
  /** Space-separated list of IDs that describe this input. Merged with the registered description and error-message IDs. */
  "aria-describedby"?: MaybeAccessor<string>;
};

/**
 * Data attributes set on the root element to reflect the current field state.
 * Each attribute is an empty string when active, `undefined` when inactive —
 * matching the convention used by Kobalte and Radix for CSS-selector targeting
 * (`[data-invalid]`, `[data-disabled]`, etc.).
 */
export type FormControlDataSet = {
  "data-valid": string | undefined;
  "data-invalid": string | undefined;
  "data-required": string | undefined;
  "data-disabled": string | undefined;
  "data-readonly": string | undefined;
};

/**
 * Shared accessibility state provided by `createFormControl` and consumed by
 * sub-components through `FormControlContext`.
 *
 * Sub-components register themselves by calling one of the `register*` methods on mount
 * and passing the returned cleanup to `onCleanup`. Registration writes the element's ID
 * into the corresponding signal so that `getAriaLabelledBy` / `getAriaDescribedBy` can
 * build correct, live `aria-*` attribute strings.
 */
export type FormControlContextValue = {
  /** Field name for the owning form. Falls back to the control's auto-generated ID. */
  name: Accessor<string>;
  /** Reactive snapshot of all `data-*` state attributes. Spread onto the root element. */
  dataset: Accessor<FormControlDataSet>;
  /** Current validation state. `undefined` means neutral (no feedback). */
  validationState: Accessor<"valid" | "invalid" | undefined>;
  /** Whether the field is required. `undefined` means unset (not the same as `false`). */
  isRequired: Accessor<boolean | undefined>;
  /** Whether the field is disabled. `undefined` means unset. */
  isDisabled: Accessor<boolean | undefined>;
  /** Whether the field is read-only. `undefined` means unset. */
  isReadOnly: Accessor<boolean | undefined>;
  /** ID of the currently registered label element, or `undefined` if none is mounted. */
  labelId: Accessor<string | undefined>;
  /** ID of the currently registered field (input) element, or `undefined` if none is mounted. */
  fieldId: Accessor<string | undefined>;
  /** ID of the currently registered description element, or `undefined` if none is mounted. */
  descriptionId: Accessor<string | undefined>;
  /** ID of the currently registered error-message element, or `undefined` if none is mounted. */
  errorMessageId: Accessor<string | undefined>;
  /**
   * Computes the `aria-labelledby` value for an input element.
   *
   * When both a visible label (`labelId`) and an explicit `aria-label` are present, the
   * input's own ID is appended to the chain so screen readers announce the visible label
   * text *and* the programmatic label — matching the Kobalte / React Aria behaviour.
   *
   * @param fieldId - The input element's own ID.
   * @param ariaLabel - The input's `aria-label` prop value, if any.
   * @param ariaLabelledBy - Extra IDs already on the input's `aria-labelledby` prop, if any.
   */
  getAriaLabelledBy: (
    fieldId: string | undefined,
    ariaLabel: string | undefined,
    ariaLabelledBy: string | undefined,
  ) => string | undefined;
  /**
   * Computes the `aria-describedby` value for an input element by joining the registered
   * description ID, the registered error-message ID, and any caller-supplied IDs.
   *
   * Note: we deliberately use `aria-describedby` for error messages rather than
   * `aria-errormessage` because VoiceOver and NVDA have incomplete support for the latter.
   * See: https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
   *
   * @param ariaDescribedBy - Extra IDs already on the input's `aria-describedby` prop, if any.
   */
  getAriaDescribedBy: (ariaDescribedBy: string | undefined) => string | undefined;
  /**
   * Generates a stable ID for a named sub-element part.
   * @example `generateId("label")` → `"my-form-control-label"`
   */
  generateId: (part: string) => string;
  /**
   * Registers a label element by ID. Returns a cleanup function that deregisters it —
   * pass the return value directly to `onCleanup`.
   * @example `onCleanup(ctx.registerLabel(labelId))`
   */
  registerLabel: (id: string) => () => void;
  /**
   * Registers the field (input) element by ID. Returns a cleanup function.
   * Called internally by `createFormControlInput`; you rarely need this directly.
   */
  registerField: (id: string) => () => void;
  /**
   * Registers a description element by ID. Returns a cleanup function — pass to `onCleanup`.
   * @example `onCleanup(ctx.registerDescription(descriptionId))`
   */
  registerDescription: (id: string) => () => void;
  /**
   * Registers an error-message element by ID. Returns a cleanup function — pass to `onCleanup`.
   * Mount this element conditionally (e.g. inside `<Show when={validationState === "invalid"}>`);
   * the ID will only be in `aria-describedby` while the element is actually in the DOM.
   * @example `onCleanup(ctx.registerErrorMessage(errorId))`
   */
  registerErrorMessage: (id: string) => () => void;
};
