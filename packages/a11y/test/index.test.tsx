import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import type { Accessor } from "solid-js";
import { render } from "@solidjs/web";
import {
  createFormControl,
  createFormControlInput,
  FormControlContext,
  useFormControl,
  makeAnnounce,
  createAnnounce,
  createReducedMotion,
} from "../src/index.js";

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
    // oxlint-disable-next-line no-unused-vars
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

describe("makeAnnounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll("[aria-live]").forEach(el => el.remove());
  });

  it("appends polite and assertive live regions to document.body", () => {
    const [, cleanup] = makeAnnounce();
    expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    expect(document.querySelector('[aria-live="assertive"]')).toBeTruthy();
    cleanup();
  });

  it("populates the polite region after the debounce delay", () => {
    const [announce, cleanup] = makeAnnounce();
    const polite = document.querySelector('[aria-live="polite"]')!;
    announce("File saved");
    expect(polite.textContent).toBe(""); // not yet set
    vi.runAllTimers();
    expect(polite.textContent).toBe("File saved");
    cleanup();
  });

  it("populates the assertive region when politeness is assertive", () => {
    const [announce, cleanup] = makeAnnounce();
    const assertive = document.querySelector('[aria-live="assertive"]')!;
    announce("Upload failed", "assertive");
    vi.runAllTimers();
    expect(assertive.textContent).toBe("Upload failed");
    cleanup();
  });

  it("re-announces identical messages by clearing the region first", () => {
    const [announce, cleanup] = makeAnnounce();
    const polite = document.querySelector('[aria-live="polite"]')!;
    announce("Same message");
    vi.runAllTimers();
    expect(polite.textContent).toBe("Same message");

    announce("Same message");
    expect(polite.textContent).toBe(""); // cleared before re-set
    vi.runAllTimers();
    expect(polite.textContent).toBe("Same message");
    cleanup();
  });

  it("cleanup removes both live regions from the DOM", () => {
    const [, cleanup] = makeAnnounce();
    expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    cleanup();
    expect(document.querySelector('[aria-live="polite"]')).toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
  });
});

describe("createAnnounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll("[aria-live]").forEach(el => el.remove());
  });

  it("returns an announce function", () => {
    createRoot(dispose => {
      const announce = createAnnounce();
      expect(typeof announce).toBe("function");
      dispose();
    });
  });

  it("removes live regions from DOM when the owner disposes", () => {
    const dispose = createRoot(d => {
      createAnnounce();
      return d;
    });
    expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    dispose();
    expect(document.querySelector('[aria-live="polite"]')).toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
  });

  it("announces a message to the polite region", () => {
    createRoot(dispose => {
      const announce = createAnnounce();
      const polite = document.querySelector('[aria-live="polite"]')!;
      announce("3 results found");
      vi.runAllTimers();
      expect(polite.textContent).toBe("3 results found");
      dispose();
    });
  });
});

describe("createReducedMotion", () => {
  let changeListeners: Array<(e: MediaQueryListEvent) => void> = [];
  let mqMatches = false;

  beforeEach(() => {
    changeListeners = [];
    mqMatches = false;
    vi.spyOn(window, "matchMedia").mockImplementation(
      query =>
        ({
          matches: mqMatches,
          media: query,
          addEventListener: vi.fn((_: string, handler: (e: MediaQueryListEvent) => void) => {
            changeListeners.push(handler);
          }),
          removeEventListener: vi.fn((_: string, handler: (e: MediaQueryListEvent) => void) => {
            const i = changeListeners.indexOf(handler);
            if (i !== -1) changeListeners.splice(i, 1);
          }),
          dispatchEvent: vi.fn(),
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  const fireChange = (matches: boolean) =>
    changeListeners.forEach(h => h({ matches } as MediaQueryListEvent));

  it("returns false when no preference is set", () => {
    createRoot(dispose => {
      const prefersReduced = createReducedMotion();
      expect(prefersReduced()).toBe(false);
      dispose();
    });
  });

  it("returns true when prefers-reduced-motion matches", () => {
    mqMatches = true;
    createRoot(dispose => {
      const prefersReduced = createReducedMotion();
      expect(prefersReduced()).toBe(true);
      dispose();
    });
  });

  it("updates reactively when the OS preference changes", () => {
    let prefersReduced!: Accessor<boolean>;
    const dispose = createRoot(d => {
      prefersReduced = createReducedMotion();
      return d;
    });

    expect(prefersReduced()).toBe(false);

    fireChange(true);
    flush();
    expect(prefersReduced()).toBe(true);

    fireChange(false);
    flush();
    expect(prefersReduced()).toBe(false);

    dispose();
  });

  it("removes the media query listener when the owner disposes", () => {
    const dispose = createRoot(d => {
      createReducedMotion();
      return d;
    });
    expect(changeListeners).toHaveLength(1);
    dispose();
    expect(changeListeners).toHaveLength(0);
  });
});
