import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createFormControl, useFormControl } from "../src/index.js";

describe("createFormControl (SSR)", () => {
  it("returns static accessors without throwing", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl", name: "email", validationState: "invalid", required: true });
      expect(ctx.name()).toBe("email");
      expect(ctx.validationState()).toBe("invalid");
      expect(ctx.isRequired()).toBe(true);
      expect(ctx.isDisabled()).toBeUndefined();
      expect(ctx.generateId("label")).toBe("ctrl-label");
      dispose();
    });
  });

  it("dataset returns correct static values", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl", validationState: "valid", disabled: true });
      const d = ctx.dataset();
      expect(d["data-valid"]).toBe("");
      expect(d["data-invalid"]).toBeUndefined();
      expect(d["data-disabled"]).toBe("");
      dispose();
    });
  });

  it("registration accessors return undefined on server (no effects run)", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.labelId()).toBeUndefined();
      expect(ctx.fieldId()).toBeUndefined();
      expect(ctx.descriptionId()).toBeUndefined();
      expect(ctx.errorMessageId()).toBeUndefined();
      dispose();
    });
  });

  it("getAriaLabelledBy and getAriaDescribedBy return undefined with nothing registered", () => {
    createRoot(dispose => {
      const ctx = createFormControl({ id: "ctrl" });
      expect(ctx.getAriaLabelledBy("ctrl-field", undefined, undefined)).toBeUndefined();
      expect(ctx.getAriaDescribedBy(undefined)).toBeUndefined();
      dispose();
    });
  });

  it("useFormControl throws outside a provider", () => {
    createRoot(dispose => {
      expect(() => useFormControl()).toThrow();
      dispose();
    });
  });
});
