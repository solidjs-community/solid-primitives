import { describe, it, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
} from "../src/index.js";

// ─── createFormControl ────────────────────────────────────────────────────────

describe("createFormControl", () => {
  it("auto-generates a stable id when none provided", () => {
    createRoot(dispose => {
      const ctx = createFormControl({});
      const id = ctx.name(); // name falls back to id
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
      dispose();
    });
  });

  it("uses the provided id", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "my-field" });
      expect(ctx.generateId("label")).toBe("my-field-label");
      dispose();
    });
  });

  it("accepts a reactive id accessor", () => {
    const [id, setId] = createSignal("first");
    let ctx!: ReturnType<typeof createFormControl>;
    const dispose = createRoot(d => {
      ctx = createFormControl({ id });
      return d;
    });
    expect(ctx.generateId("label")).toBe("first-label");
    setId("second");
    flush();
    expect(ctx.generateId("label")).toBe("second-label");
    dispose();
  });

  it("name falls back to id when name is omitted", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "email-field" });
      expect(ctx.name()).toBe("email-field");
      dispose();
    });
  });

  it("uses the provided name", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "email-field", name: "email" });
      expect(ctx.name()).toBe("email");
      dispose();
    });
  });

  it("generateId returns baseId-part", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.generateId("field")).toBe("ctrl-field");
      expect(ctx.generateId("label")).toBe("ctrl-label");
      expect(ctx.generateId("description")).toBe("ctrl-description");
      dispose();
    });
  });

  // ─── dataset ───────────────────────────────────────────────────────────────

  it("dataset: undefined validationState sets no data attributes", () => {
    createRoot(dispose => {
      const ctx = createFormControl({});
      const d = ctx.dataset();
      expect(d["data-valid"]).toBeUndefined();
      expect(d["data-invalid"]).toBeUndefined();
      dispose();
    });
  });

  it("dataset: valid sets only data-valid", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ validationState: "valid" });
      const d = ctx.dataset();
      expect(d["data-valid"]).toBe("");
      expect(d["data-invalid"]).toBeUndefined();
      dispose();
    });
  });

  it("dataset: invalid sets only data-invalid", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ validationState: "invalid" });
      const d = ctx.dataset();
      expect(d["data-valid"]).toBeUndefined();
      expect(d["data-invalid"]).toBe("");
      dispose();
    });
  });

  it("dataset: required sets data-required", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ required: true });
      expect(ctx.dataset()["data-required"]).toBe("");
      dispose();
    });
  });

  it("dataset: disabled sets data-disabled", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ disabled: true });
      expect(ctx.dataset()["data-disabled"]).toBe("");
      dispose();
    });
  });

  it("dataset: readOnly sets data-readonly", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ readOnly: true });
      expect(ctx.dataset()["data-readonly"]).toBe("");
      dispose();
    });
  });

  it("dataset is reactive to validationState signal", () => {
    const [state, setState] = createSignal<"valid" | "invalid" | undefined>(undefined);
    let ctx!: ReturnType<typeof createFormControl>;
    const dispose = createRoot(d => {
      ctx = createFormControl({ validationState: state });
      return d;
    });
    expect(ctx.dataset()["data-valid"]).toBeUndefined();
    setState("valid");
    flush();
    expect(ctx.dataset()["data-valid"]).toBe("");
    setState("invalid");
    flush();
    expect(ctx.dataset()["data-invalid"]).toBe("");
    expect(ctx.dataset()["data-valid"]).toBeUndefined();
    dispose();
  });

  // ─── state accessors ───────────────────────────────────────────────────────

  it("state accessors reflect props reactively", () => {
    const [required, setRequired] = createSignal<boolean | undefined>(false);
    const [disabled, setDisabled] = createSignal<boolean | undefined>(false);
    let ctx!: ReturnType<typeof createFormControl>;
    const dispose = createRoot(d => {
      ctx = createFormControl({ required, disabled });
      return d;
    });
    expect(ctx.isRequired()).toBe(false);
    expect(ctx.isDisabled()).toBe(false);
    setRequired(true);
    setDisabled(true);
    flush();
    expect(ctx.isRequired()).toBe(true);
    expect(ctx.isDisabled()).toBe(true);
    dispose();
  });

  // ─── registration ──────────────────────────────────────────────────────────

  it("registerLabel sets labelId and cleanup deregisters", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.labelId()).toBeUndefined();
      const cleanup = ctx.registerLabel("ctrl-label");
      flush();
      expect(ctx.labelId()).toBe("ctrl-label");
      cleanup();
      flush();
      expect(ctx.labelId()).toBeUndefined();
      dispose();
    });
  });

  it("registerDescription sets descriptionId and cleanup deregisters", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      const cleanup = ctx.registerDescription("ctrl-description");
      flush();
      expect(ctx.descriptionId()).toBe("ctrl-description");
      cleanup();
      flush();
      expect(ctx.descriptionId()).toBeUndefined();
      dispose();
    });
  });

  it("registerErrorMessage sets errorMessageId and cleanup deregisters", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      const cleanup = ctx.registerErrorMessage("ctrl-error");
      flush();
      expect(ctx.errorMessageId()).toBe("ctrl-error");
      cleanup();
      flush();
      expect(ctx.errorMessageId()).toBeUndefined();
      dispose();
    });
  });

  // ─── ARIA computation ──────────────────────────────────────────────────────

  it("getAriaLabelledBy: returns undefined with no label registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.getAriaLabelledBy("ctrl-field", undefined, undefined)).toBeUndefined();
      dispose();
    });
  });

  it("getAriaLabelledBy: returns labelId when label is registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerLabel("ctrl-label");
      flush();
      expect(ctx.getAriaLabelledBy("ctrl-field", undefined, undefined)).toBe("ctrl-label");
      dispose();
    });
  });

  it("getAriaLabelledBy: merges explicit ariaLabelledBy with registered label", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerLabel("ctrl-label");
      flush();
      expect(ctx.getAriaLabelledBy("ctrl-field", undefined, "external-label")).toBe(
        "external-label ctrl-label",
      );
      dispose();
    });
  });

  it("getAriaLabelledBy: adds fieldId when both ariaLabel and labelledby are present", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerLabel("ctrl-label");
      flush();
      expect(ctx.getAriaLabelledBy("ctrl-field", "My label", undefined)).toBe(
        "ctrl-label ctrl-field",
      );
      dispose();
    });
  });

  it("getAriaDescribedBy: returns undefined with nothing registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.getAriaDescribedBy(undefined)).toBeUndefined();
      dispose();
    });
  });

  it("getAriaDescribedBy: includes descriptionId when registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerDescription("ctrl-desc");
      flush();
      expect(ctx.getAriaDescribedBy(undefined)).toBe("ctrl-desc");
      dispose();
    });
  });

  it("getAriaDescribedBy: includes errorMessageId when registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerErrorMessage("ctrl-error");
      flush();
      expect(ctx.getAriaDescribedBy(undefined)).toBe("ctrl-error");
      dispose();
    });
  });

  it("getAriaDescribedBy: combines description, error message, and explicit value", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      ctx.registerDescription("ctrl-desc");
      ctx.registerErrorMessage("ctrl-error");
      flush();
      expect(ctx.getAriaDescribedBy("extra")).toBe("ctrl-desc ctrl-error extra");
      dispose();
    });
  });

  it("getAriaDescribedBy: always includes errorMessageId regardless of validationState", () => {
    const [state, setState] = createSignal<"valid" | "invalid" | undefined>(undefined);
    let ctx!: ReturnType<typeof createFormControl>;
    const dispose = createRoot(d => {
      ctx = createFormControl({ id: "ctrl", validationState: state });
      return d;
    });
    ctx.registerErrorMessage("ctrl-error");
    flush();
    // included even when not invalid — caller controls whether to mount the element
    expect(ctx.getAriaDescribedBy(undefined)).toBe("ctrl-error");
    setState("valid");
    flush();
    expect(ctx.getAriaDescribedBy(undefined)).toBe("ctrl-error");
    dispose();
  });
});

// ─── createFormControlInput ───────────────────────────────────────────────────

describe("createFormControlInput", () => {
  function withControl(
    ctxId: string,
    fieldProps: Parameters<typeof createFormControlInput>[0],
    fn: (
      ctx: ReturnType<typeof createFormControl>,
      fp: ReturnType<typeof createFormControlInput>["fieldProps"],
    ) => void,
  ) {
    const container = document.createElement("div");
    const ctx = createFormControl({ id: ctxId });
    let captured!: ReturnType<typeof createFormControlInput>["fieldProps"];

    const dispose = render(() => {
      return (
        <FormControlContext value={ctx}>
          {(() => {
            captured = createFormControlInput(fieldProps).fieldProps;
            return null;
          })()}
        </FormControlContext>
      ) as any;
    }, container);

    flush();
    fn(ctx, captured);
    dispose();
  }

  it("default id is generateId('field')", () => {
    withControl("ctrl", {}, (ctx, fp) => {
      expect(fp.id()).toBe("ctrl-field");
    });
  });

  it("registers fieldId in context after flush", () => {
    withControl("ctrl", {}, (ctx, _fp) => {
      expect(ctx.fieldId()).toBe("ctrl-field");
    });
  });

  it("uses explicit id prop", () => {
    withControl("ctrl", { id: "my-input" }, (ctx, fp) => {
      expect(fp.id()).toBe("my-input");
      expect(ctx.fieldId()).toBe("my-input");
    });
  });

  it("ariaLabel returns the aria-label prop", () => {
    withControl("ctrl", { "aria-label": "Search" }, (_ctx, fp) => {
      expect(fp.ariaLabel()).toBe("Search");
    });
  });

  it("ariaLabelledBy is undefined with no label registered and no prop", () => {
    withControl("ctrl", {}, (_ctx, fp) => {
      expect(fp.ariaLabelledBy()).toBeUndefined();
    });
  });

  it("ariaLabelledBy includes registered label id", () => {
    const container = document.createElement("div");
    const ctx = createFormControl({ id: "ctrl" });
    ctx.registerLabel("ctrl-label");
    let fp!: ReturnType<typeof createFormControlInput>["fieldProps"];

    const dispose = render(() => {
      return (
        <FormControlContext value={ctx}>
          {(() => {
            fp = createFormControlInput({}).fieldProps;
            return null;
          })()}
        </FormControlContext>
      ) as any;
    }, container);

    flush();
    expect(fp.ariaLabelledBy()).toBe("ctrl-label");
    dispose();
  });

  it("ariaDescribedBy is undefined with nothing registered", () => {
    withControl("ctrl", {}, (_ctx, fp) => {
      expect(fp.ariaDescribedBy()).toBeUndefined();
    });
  });

  it("ariaDescribedBy includes registered description and error message", () => {
    const container = document.createElement("div");
    const ctx = createFormControl({ id: "ctrl" });
    ctx.registerDescription("ctrl-desc");
    ctx.registerErrorMessage("ctrl-error");
    let fp!: ReturnType<typeof createFormControlInput>["fieldProps"];

    const dispose = render(() => {
      return (
        <FormControlContext value={ctx}>
          {(() => {
            fp = createFormControlInput({}).fieldProps;
            return null;
          })()}
        </FormControlContext>
      ) as any;
    }, container);

    flush();
    expect(fp.ariaDescribedBy()).toBe("ctrl-desc ctrl-error");
    dispose();
  });

  it("deregisters fieldId on dispose", () => {
    const container = document.createElement("div");
    const ctx = createFormControl({ id: "ctrl" });
    let fp!: ReturnType<typeof createFormControlInput>["fieldProps"];

    const dispose = render(() => {
      return (
        <FormControlContext value={ctx}>
          {(() => {
            fp = createFormControlInput({}).fieldProps;
            return null;
          })()}
        </FormControlContext>
      ) as any;
    }, container);

    flush();
    expect(ctx.fieldId()).toBe("ctrl-field");
    dispose();
    flush();
    expect(ctx.fieldId()).toBeUndefined();
  });
});

// ─── useFormControl ───────────────────────────────────────────────────────────

describe("useFormControl", () => {
  it("throws when called outside a FormControlContext", () => {
    createRoot(dispose => {
      expect(() => useFormControl()).toThrow();
      dispose();
    });
  });

  it("returns the context value inside a FormControlContext", () => {
    const container = document.createElement("div");
    const ctx = createFormControl({ id: "ctrl" });
    let captured: ReturnType<typeof useFormControl> | undefined;

    const dispose = render(() => {
      return (
        <FormControlContext value={ctx}>
          {(() => {
            captured = useFormControl();
            return null;
          })()}
        </FormControlContext>
      ) as any;
    }, container);

    expect(captured).toBe(ctx);
    dispose();
  });
});
