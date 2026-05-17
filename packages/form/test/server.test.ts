import { describe, it, expect } from "vitest";
import { createForm } from "../src/index.js";

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

  it("touched always returns false on server", () => {
    const form = createForm({
      fields: { email: { initial: "" } },
    });

    expect(form.fields.email.touched()).toBe(false);
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
    expect(form.submitting()).toBe(false);
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
