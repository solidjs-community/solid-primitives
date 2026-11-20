import { describe, it, expect } from "vitest";
import { createForm } from "../src/index.js";

const isEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email");

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

  it("form-level state is what the client starts with", () => {
    const form = createForm({
      fields: {
        email: { initial: "bad-email", validate: isEmail },
        name: { initial: "" },
      },
    });

    expect(form.dirty()).toBe(false);
    expect(form.valid()).toBe(false);
    expect(form.pending()).toBe(false);
    expect(form.submitting()).toBe(false);
    expect(form.submitted()).toBe(false);
    expect(form.errors()).toEqual({ email: "Invalid email" });
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

  it("bind and ref return functions, and validate runs its rule, on server", () => {
    const form = createForm({ fields: { email: { initial: "" } } });

    expect(typeof form.bind("email")).toBe("function");
    expect(typeof form.ref).toBe("function");

    const error = form.validate(() => "always fails");
    expect(error()).toBe("always fails");
    expect(form.valid()).toBe(false);
  });

  it("an async validator leaves the field pending, as the client starts", () => {
    let calls = 0;
    const form = createForm({
      fields: {
        name: {
          initial: "ada",
          validate: async () => {
            calls++;
            return null;
          },
        },
      },
    });

    expect(calls).toBe(1);
    expect(form.pending()).toBe(true);
    expect(form.valid()).toBe(false);
  });

  it("reset and submit are no-ops on server", async () => {
    const form = createForm({ fields: { email: { initial: "" } } });

    expect(() => form.reset()).not.toThrow();
    await expect(form.submit()).resolves.toBeUndefined();
  });
});
