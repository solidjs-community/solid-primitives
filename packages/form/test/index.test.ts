import { describe, it, expect, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { createForm, toFormData } from "../src/index.js";

// ─── Inline validators used across tests ──────────────────────────────────────

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email";

const minLength = (n: number) => (v: string) =>
  v.length < n ? `Minimum ${n} characters` : null;

const hasUppercase = (v: string) =>
  /[A-Z]/.test(v) ? null : "Must contain an uppercase letter";

// ─── Field signals ────────────────────────────────────────────────────────────

describe("field signals", () => {
  it("initializes field values from config", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "" },
          age: { initial: 0 },
        },
      });

      expect(form.fields.email.value()).toBe("");
      expect(form.fields.age.value()).toBe(0);
      dispose();
    });
  });

  it("updates value with setValue", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      form.fields.name.setValue("Alice");
      flush();
      expect(form.fields.name.value()).toBe("Alice");
      dispose();
    });
  });

  it("tracks touched state", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.fields.name.touched()).toBe(false);
      form.fields.name.setTouched(true);
      flush();
      expect(form.fields.name.touched()).toBe(true);
      dispose();
    });
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("validation", () => {
  it("returns null error for valid field", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "user@example.com", validate: isEmail } },
      });

      expect(form.fields.email.error()).toBe(null);
      dispose();
    });
  });

  it("returns error message for invalid field", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "not-an-email", validate: isEmail } },
      });

      expect(form.fields.email.error()).toBe("Invalid email");
      dispose();
    });
  });

  it("runs array of validators and returns first failure", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "abc", validate: [minLength(8), hasUppercase] },
        },
      });

      expect(form.fields.password.error()).toBe("Minimum 8 characters");

      form.fields.password.setValue("abcdefgh");
      flush();
      expect(form.fields.password.error()).toBe("Must contain an uppercase letter");

      form.fields.password.setValue("Abcdefgh");
      flush();
      expect(form.fields.password.error()).toBe(null);

      dispose();
    });
  });

  it("reactively updates errors when value changes", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
      });

      expect(form.fields.email.error()).toBe("Invalid email");

      form.fields.email.setValue("user@example.com");
      flush();
      expect(form.fields.email.error()).toBe(null);

      dispose();
    });
  });

  it("returns null when no validator is configured", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.fields.name.error()).toBe(null);
      dispose();
    });
  });
});

// ─── Derived form state ───────────────────────────────────────────────────────

describe("dirty", () => {
  it("is false initially", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.dirty()).toBe(false);
      dispose();
    });
  });

  it("is true when any field changes from initial", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      form.fields.name.setValue("Alice");
      flush();
      expect(form.dirty()).toBe(true);
      dispose();
    });
  });

  it("returns to false when field value matches initial again", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      form.fields.name.setValue("Alice");
      flush();
      form.fields.name.setValue("");
      flush();
      expect(form.dirty()).toBe(false);
      dispose();
    });
  });
});

describe("valid", () => {
  it("is true when all fields pass validation", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "user@example.com", validate: isEmail } },
      });

      expect(form.valid()).toBe(true);
      dispose();
    });
  });

  it("is false when any field has an error", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
      });

      expect(form.valid()).toBe(false);
      dispose();
    });
  });

  it("is true when there are no validators", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.valid()).toBe(true);
      dispose();
    });
  });
});

describe("errors", () => {
  it("includes only fields with errors", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "bad", validate: isEmail },
          name: { initial: "Alice" },
        },
      });

      const errs = form.errors();
      expect(errs.email).toBe("Invalid email");
      expect(errs.name).toBeUndefined();
      dispose();
    });
  });

  it("is empty when all fields are valid", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "user@example.com", validate: isEmail } },
      });

      expect(form.errors()).toEqual({});
      dispose();
    });
  });
});

describe("values", () => {
  it("returns plain object with all current values", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "user@example.com" },
          name: { initial: "Alice" },
        },
      });

      expect(form.values()).toEqual({ email: "user@example.com", name: "Alice" });
      dispose();
    });
  });

  it("reflects updated values", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      form.fields.name.setValue("Bob");
      flush();
      expect(form.values()).toEqual({ name: "Bob" });
      dispose();
    });
  });
});

// ─── Reset ────────────────────────────────────────────────────────────────────

describe("reset", () => {
  it("restores all fields to initial values and clears touched", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "" },
          name: { initial: "" },
        },
      });

      form.fields.email.setValue("user@example.com");
      form.fields.name.setValue("Alice");
      form.fields.email.setTouched(true);
      flush();

      form.reset();
      flush();

      expect(form.fields.email.value()).toBe("");
      expect(form.fields.name.value()).toBe("");
      expect(form.fields.email.touched()).toBe(false);
      expect(form.dirty()).toBe(false);
      dispose();
    });
  });

  it("field.reset() restores only that field", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "" },
          name: { initial: "" },
        },
      });

      form.fields.email.setValue("user@example.com");
      form.fields.name.setValue("Alice");
      flush();

      form.fields.email.reset();
      flush();

      expect(form.fields.email.value()).toBe("");
      expect(form.fields.name.value()).toBe("Alice");
      dispose();
    });
  });
});

// ─── Submit ───────────────────────────────────────────────────────────────────

describe("submit", () => {
  it("calls onSubmit with current values when valid", async () => {
    const onSubmit = vi.fn();
    let submitPromise: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "user@example.com", validate: isEmail } },
        onSubmit: values => {
          onSubmit(values);
        },
      });
      submitPromise = form.submit();
      return d;
    });

    await submitPromise!;
    expect(onSubmit).toHaveBeenCalledWith({ email: "user@example.com" });
    dispose();
  });

  it("does not call onSubmit when form is invalid", async () => {
    const onSubmit = vi.fn();
    let submitPromise: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
        onSubmit,
      });
      submitPromise = form.submit();
      return d;
    });

    await submitPromise!;
    expect(onSubmit).not.toHaveBeenCalled();
    dispose();
  });

  it("touches all fields on submit attempt", async () => {
    let submitPromise: Promise<void>;
    let touchedAfterSubmit = false;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
      });

      submitPromise = form.submit().then(() => {
        flush();
        touchedAfterSubmit = form.fields.email.touched();
      });

      return d;
    });

    await submitPromise!;
    expect(touchedAfterSubmit).toBe(true);
    dispose();
  });

  it("sets submitting to true while processing", async () => {
    let submittingDuringCall = false;
    let submitPromise: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "user@example.com" } },
        onSubmit: () => {
          flush();
          submittingDuringCall = form.submitting();
        },
      });
      submitPromise = form.submit();
      return d;
    });

    await submitPromise!;
    expect(submittingDuringCall).toBe(true);
    dispose();
  });

  it("resets submitting to false after completion", async () => {
    let submitPromise: Promise<void>;
    let submittingAfter = true;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { name: { initial: "Alice" } },
        onSubmit: async () => {},
      });
      submitPromise = form.submit().then(() => {
        flush();
        submittingAfter = form.submitting();
      });
      return d;
    });

    await submitPromise!;
    expect(submittingAfter).toBe(false);
    dispose();
  });

  it("ignores concurrent submit calls", async () => {
    const onSubmit = vi.fn(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    let submitPromise1: Promise<void>;
    let submitPromise2: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { name: { initial: "Alice" } },
        onSubmit,
      });
      submitPromise1 = form.submit();
      submitPromise2 = form.submit();
      return d;
    });

    await Promise.all([submitPromise1!, submitPromise2!]);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    dispose();
  });
});

// ─── submitted flag ───────────────────────────────────────────────────────────

describe("submitted", () => {
  it("starts false", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.submitted()).toBe(false);
      dispose();
    });
  });

  it("becomes true after any submit attempt, including invalid", async () => {
    let submitPromise: Promise<void>;
    let submittedAfter = false;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
      });
      submitPromise = form.submit().then(() => {
        flush();
        submittedAfter = form.submitted();
      });
      return d;
    });

    await submitPromise!;
    expect(submittedAfter).toBe(true);
    dispose();
  });

  it("resets to false on form.reset()", async () => {
    let submitPromise: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({ fields: { name: { initial: "Alice" } } });
      submitPromise = form.submit().then(() => {
        flush();
        expect(form.submitted()).toBe(true);
        form.reset();
        flush();
        expect(form.submitted()).toBe(false);
      });
      return d;
    });

    await submitPromise!;
    dispose();
  });
});

// ─── validateOn ───────────────────────────────────────────────────────────────

describe("validateOn", () => {
  it("change (default): error() shows immediately", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
      });

      expect(form.fields.email.error()).toBe("Invalid email");
      dispose();
    });
  });

  it("blur: error() is null until field is touched", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail, validateOn: "blur" } },
      });

      expect(form.fields.email.error()).toBe(null);

      form.fields.email.setTouched(true);
      flush();
      expect(form.fields.email.error()).toBe("Invalid email");
      dispose();
    });
  });

  it("submit: error() is null until form.submit() is called", async () => {
    let submitPromise: Promise<void>;
    let errorBefore: string | null;
    let errorAfter: string | null;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail, validateOn: "submit" } },
      });

      errorBefore = form.fields.email.error();
      submitPromise = form.submit().then(() => {
        flush();
        errorAfter = form.fields.email.error();
      });
      return d;
    });

    await submitPromise!;
    expect(errorBefore!).toBe(null);
    expect(errorAfter!).toBe("Invalid email");
    dispose();
  });

  it("form-level validateOn applies to all fields", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail } },
        validateOn: "blur",
      });

      expect(form.fields.email.error()).toBe(null);

      form.fields.email.setTouched(true);
      flush();
      expect(form.fields.email.error()).toBe("Invalid email");
      dispose();
    });
  });

  it("per-field validateOn overrides form-level", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "", validate: isEmail },
          name: {
            initial: "",
            validate: (v: string) => (v ? null : "Required"),
            validateOn: "blur",
          },
        },
        validateOn: "submit",
      });

      // email inherits "submit" → hidden; name is "blur" → also hidden
      expect(form.fields.email.error()).toBe(null);
      expect(form.fields.name.error()).toBe(null);

      // touching name reveals its error; email stays hidden
      form.fields.name.setTouched(true);
      flush();
      expect(form.fields.name.error()).toBe("Required");
      expect(form.fields.email.error()).toBe(null);
      dispose();
    });
  });

  it("valid() always uses raw error regardless of validateOn", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail, validateOn: "blur" } },
      });

      // error() is null (not yet touched) but the field is actually invalid
      expect(form.fields.email.error()).toBe(null);
      expect(form.valid()).toBe(false);
      dispose();
    });
  });

  it("errors() always uses raw error regardless of validateOn", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "", validate: isEmail, validateOn: "blur" } },
      });

      expect(form.fields.email.error()).toBe(null);
      expect(form.errors().email).toBe("Invalid email");
      dispose();
    });
  });
});

// ─── Async validators ─────────────────────────────────────────────────────────

describe("async validators", () => {
  it("pending becomes true while an async validator is in flight", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: {
            initial: "test@example.com",
            validate: async () => {
              await new Promise(r => setTimeout(r, 50));
              return null;
            },
          },
        },
      });

      flush();
      expect(form.fields.email.pending()).toBe(true);
      expect(form.pending()).toBe(true);
      dispose();
    });
  });

  it("sets error after async validation resolves", async () => {
    const form = createRoot(() =>
      createForm({
        fields: {
          email: {
            initial: "taken@example.com",
            validate: async (v: string) =>
              v === "taken@example.com" ? "Email already taken" : null,
          },
        },
      }),
    );

    flush();
    await new Promise(r => setTimeout(r, 20));
    flush();
    expect(form.fields.email.error()).toBe("Email already taken");
    expect(form.fields.email.pending()).toBe(false);
  });

  it("sync and async validators coexist in one validate array", async () => {
    const form = createRoot(() =>
      createForm({
        fields: {
          email: {
            initial: "",
            validate: [
              isEmail,
              async (v: string) => (v === "taken@example.com" ? "Email already taken" : null),
            ],
          },
        },
      }),
    );

    // Sync validator fires immediately
    expect(form.fields.email.error()).toBe("Invalid email");

    form.fields.email.setValue("taken@example.com");
    flush();
    // Sync passes, async is in flight
    expect(form.fields.email.error()).toBe(null);
    expect(form.fields.email.pending()).toBe(true);

    await new Promise(r => setTimeout(r, 20));
    flush();
    expect(form.fields.email.error()).toBe("Email already taken");
  });

  it("valid() is false while any async validator is pending", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: {
            initial: "test@example.com",
            validate: async () => {
              await new Promise(r => setTimeout(r, 50));
              return null;
            },
          },
        },
      });

      flush();
      expect(form.valid()).toBe(false);
      dispose();
    });
  });

  it("stale results are discarded when value changes mid-flight", async () => {
    const form = createRoot(() =>
      createForm({
        fields: {
          username: {
            initial: "first",
            validate: async (v: string) => {
              await new Promise(r => setTimeout(r, 10));
              return v === "first" ? "taken" : null;
            },
          },
        },
      }),
    );

    flush();
    form.fields.username.setValue("second");
    flush();

    await new Promise(r => setTimeout(r, 30));
    flush();

    expect(form.fields.username.error()).toBe(null);
  });
});

// ─── Bind ─────────────────────────────────────────────────────────────────────

describe("bind", () => {
  it("sets initial input value from signal", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: { email: { initial: "initial@example.com" } },
      });

      const el = document.createElement("input");
      const cleanup = form.bind("email")(el);

      expect(el.value).toBe("initial@example.com");
      cleanup();
      dispose();
    });
  });

  it("updates signal when input event fires", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "" } } });

      const el = document.createElement("input");
      const cleanup = form.bind("email")(el);

      el.value = "user@example.com";
      el.dispatchEvent(new Event("input"));
      flush();

      expect(form.fields.email.value()).toBe("user@example.com");
      cleanup();
      dispose();
    });
  });

  it("sets touched on blur", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "" } } });

      const el = document.createElement("input");
      const cleanup = form.bind("email")(el);

      expect(form.fields.email.touched()).toBe(false);
      el.dispatchEvent(new Event("blur"));
      flush();
      expect(form.fields.email.touched()).toBe(true);
      cleanup();
      dispose();
    });
  });

  it("cleanup removes event listeners", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "" } } });

      const el = document.createElement("input");
      const cleanup = form.bind("email")(el);
      cleanup();

      el.value = "user@example.com";
      el.dispatchEvent(new Event("input"));
      flush();

      expect(form.fields.email.value()).toBe("");
      dispose();
    });
  });

  it("throws when field name does not exist", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "" } } });

      expect(() => form.bind("nonexistent" as any)).toThrow(
        'createForm: unknown field "nonexistent"',
      );
      dispose();
    });
  });

  it("checkbox: sets initial checked from boolean signal", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { agree: { initial: false } } });

      const el = document.createElement("input");
      el.type = "checkbox";
      const cleanup = form.bind("agree" as any)(el);

      expect(el.checked).toBe(false);
      cleanup();
      dispose();
    });
  });

  it("checkbox: updates signal with boolean on change event", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { agree: { initial: false } } });

      const el = document.createElement("input");
      el.type = "checkbox";
      const cleanup = form.bind("agree" as any)(el);

      el.checked = true;
      el.dispatchEvent(new Event("change"));
      flush();

      expect(form.fields.agree.value()).toBe(true);
      cleanup();
      dispose();
    });
  });
});

// ─── Form-level validate ──────────────────────────────────────────────────────

describe("validate", () => {
  it("returns null when the cross-field rule passes", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "secret" },
        },
      });

      const matchError = form.validate(v =>
        v.password !== v.confirm ? "Passwords must match" : null,
      );

      expect(matchError()).toBe(null);
      dispose();
    });
  });

  it("returns an error message when the rule fails", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "different" },
        },
      });

      const matchError = form.validate(v =>
        v.password !== v.confirm ? "Passwords must match" : null,
      );

      expect(matchError()).toBe("Passwords must match");
      dispose();
    });
  });

  it("updates reactively when a field value changes", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "" },
        },
      });

      const matchError = form.validate(v =>
        v.password !== v.confirm ? "Passwords must match" : null,
      );

      expect(matchError()).toBe("Passwords must match");

      form.fields.confirm.setValue("secret");
      flush();
      expect(matchError()).toBe(null);

      dispose();
    });
  });

  it("factors into form.valid()", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "" },
        },
      });

      form.validate(v => (v.password !== v.confirm ? "Passwords must match" : null));

      expect(form.valid()).toBe(false);

      form.fields.confirm.setValue("secret");
      flush();
      expect(form.valid()).toBe(true);

      dispose();
    });
  });

  it("multiple validate() calls are all checked by valid()", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          min: { initial: 5 },
          max: { initial: 3 },
          step: { initial: 0 },
        },
      });

      form.validate(v => (v.min >= v.max ? "min must be less than max" : null));
      form.validate(v => (v.step <= 0 ? "step must be positive" : null));

      expect(form.valid()).toBe(false);

      form.fields.max.setValue(10);
      flush();
      expect(form.valid()).toBe(false); // step still invalid

      form.fields.step.setValue(1);
      flush();
      expect(form.valid()).toBe(true);

      dispose();
    });
  });

  it("does not submit when a form-level validator fails", async () => {
    const onSubmit = vi.fn();
    let submitPromise: Promise<void>;

    const dispose = createRoot(d => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "wrong" },
        },
        onSubmit,
      });

      form.validate(v => (v.password !== v.confirm ? "Passwords must match" : null));

      submitPromise = form.submit();
      return d;
    });

    await submitPromise!;
    expect(onSubmit).not.toHaveBeenCalled();
    dispose();
  });
});

// ─── toFormData ───────────────────────────────────────────────────────────────

describe("toFormData", () => {
  it("returns a FormData with all current field values", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "user@example.com" },
          name: { initial: "Alice" },
        },
      });

      const fd = toFormData(form.values());
      expect(fd.get("email")).toBe("user@example.com");
      expect(fd.get("name")).toBe("Alice");
      dispose();
    });
  });

  it("reflects updated values", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      form.fields.name.setValue("Bob");
      flush();

      expect(toFormData(form.values()).get("name")).toBe("Bob");
      dispose();
    });
  });

  it("omits null and undefined values", () => {
    const fd = toFormData({ tag: null, label: undefined, name: "Alice" });
    expect(fd.get("tag")).toBeNull();
    expect(fd.get("label")).toBeNull();
    expect(fd.get("name")).toBe("Alice");
  });
});

// ─── setValues ───────────────────────────────────────────────────────────────

describe("setValues", () => {
  it("updates multiple fields at once", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "" },
          name: { initial: "" },
        },
      });

      form.setValues({ email: "user@example.com", name: "Alice" });
      flush();

      expect(form.fields.email.value()).toBe("user@example.com");
      expect(form.fields.name.value()).toBe("Alice");
      dispose();
    });
  });

  it("accepts a partial update — only named fields change", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          email: { initial: "original@example.com" },
          name: { initial: "Original" },
        },
      });

      form.setValues({ name: "Updated" });
      flush();

      expect(form.fields.name.value()).toBe("Updated");
      expect(form.fields.email.value()).toBe("original@example.com");
      dispose();
    });
  });

  it("marks the form dirty after update", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(form.dirty()).toBe(false);
      form.setValues({ name: "Alice" });
      flush();
      expect(form.dirty()).toBe(true);
      dispose();
    });
  });

  it("ignores unknown field keys", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { name: { initial: "" } } });

      expect(() => form.setValues({ unknown: "x" } as any)).not.toThrow();
      dispose();
    });
  });
});

// ─── validate() reactive invalidation ────────────────────────────────────────

describe("validate reactive invalidation", () => {
  it("valid() reflects a new cross-field rule added after it was first read", () => {
    createRoot(dispose => {
      const form = createForm({
        fields: {
          password: { initial: "secret" },
          confirm: { initial: "different" },
        },
      });

      // Read valid() before calling validate() — caches as true (no field validators)
      expect(form.valid()).toBe(true);

      // Now register a cross-field rule that currently fails
      form.validate(v => (v.password !== v.confirm ? "Passwords must match" : null));
      flush();

      // valid() must re-compute and reflect the new failing rule
      expect(form.valid()).toBe(false);
      dispose();
    });
  });
});

// ─── bind with textarea ───────────────────────────────────────────────────────

describe("bind with textarea", () => {
  it("sets initial value on a textarea", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { bio: { initial: "Hello" } } });

      const el = document.createElement("textarea");
      const cleanup = form.bind("bio")(el);

      expect(el.value).toBe("Hello");
      cleanup();
      dispose();
    });
  });

  it("updates signal when input event fires on textarea", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { bio: { initial: "" } } });

      const el = document.createElement("textarea");
      const cleanup = form.bind("bio")(el);

      el.value = "Updated bio";
      el.dispatchEvent(new Event("input"));
      flush();

      expect(form.fields.bio.value()).toBe("Updated bio");
      cleanup();
      dispose();
    });
  });
});

// ─── Form ref ─────────────────────────────────────────────────────────────────

describe("form ref", () => {
  it("intercepts submit event and prevents default", async () => {
    let submitPromise: Promise<void>;
    const onSubmit = vi.fn();

    const dispose = createRoot(d => {
      const form = createForm({
        fields: { name: { initial: "Alice" } },
        onSubmit: values => {
          onSubmit(values);
        },
      });

      const formEl = document.createElement("form");
      form.ref(formEl);

      const event = new SubmitEvent("submit", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      formEl.dispatchEvent(event);

      submitPromise = Promise.resolve();
      expect(preventDefaultSpy).toHaveBeenCalled();
      return d;
    });

    await submitPromise!;
    await new Promise(r => setTimeout(r, 0));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" });
    dispose();
  });
});
