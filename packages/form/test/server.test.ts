import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createForm, createFormControl, useFormControl } from "../src/index.js";

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email";

describe("createForm (SSR)", () => {
  it("returns static accessors with initial values", () => {
    const form = createForm({
      fields: {
        email: { initial: "test@example.com", validate: isEmail },
        password: { initial: "hunter2" },
      },
    });

    expect(form.fields.email.value()).toBe("test@example.com");
    expect(form.fields.password.value()).toBe("hunter2");
  });

  it("errors always return null on server", () => {
    const form = createForm({
      fields: { email: { initial: "not-valid", validate: isEmail } },
    });

    expect(form.fields.email.error()).toBe(null);
  });

  it("touched and pending always return false on server", () => {
    const form = createForm({
      fields: { email: { initial: "" } },
    });

    expect(form.fields.email.touched()).toBe(false);
    expect(form.fields.email.pending()).toBe(false);
  });

  it("form-level state is neutral on server", () => {
    const form = createForm({
      fields: {
        email: { initial: "bad-email", validate: isEmail },
        name: { initial: "" },
      },
    });

    expect(form.dirty()).toBe(false);
    expect(form.valid()).toBe(true);
    expect(form.pending()).toBe(false);
    expect(form.submitting()).toBe(false);
    expect(form.submitted()).toBe(false);
    expect(form.errors()).toEqual({});
  });

  it("values() returns plain object with initial values", () => {
    const form = createForm({
      fields: {
        email: { initial: "user@example.com" },
        name: { initial: "Alice" },
      },
    });

    expect(form.values()).toEqual({ email: "user@example.com", name: "Alice" });
  });

  it("bind, ref, and validate return no-op functions on server", () => {
    const form = createForm({ fields: { email: { initial: "" } } });

    expect(typeof form.bind("email")).toBe("function");
    expect(typeof form.ref).toBe("function");

    const error = form.validate(() => "always fails");
    expect(error()).toBe(null);
  });

  it("reset and submit are no-ops on server", async () => {
    const form = createForm({ fields: { email: { initial: "" } } });

    expect(() => form.reset()).not.toThrow();
    await expect(form.submit()).resolves.toBeUndefined();
  });
});

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
