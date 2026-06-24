import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { ariaHideOutside, createHideOutside } from "../src/index.js";

// ─── ariaHideOutside ──────────────────────────────────────────────────────────

describe("ariaHideOutside", () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;
  let sibling: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    target = document.createElement("div");
    sibling = document.createElement("div");
    container.appendChild(target);
    container.appendChild(sibling);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("sets aria-hidden on elements outside the target", () => {
    const cleanup = ariaHideOutside([target]);
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    cleanup();
  });

  it("does not hide the target element itself", () => {
    const cleanup = ariaHideOutside([target]);
    expect(target.getAttribute("aria-hidden")).toBeNull();
    cleanup();
  });

  it("does not hide ancestors of the target", () => {
    const cleanup = ariaHideOutside([target]);
    expect(container.getAttribute("aria-hidden")).toBeNull();
    cleanup();
  });

  it("removes aria-hidden from all managed elements on cleanup", () => {
    const cleanup = ariaHideOutside([target]);
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
  });

  it("handles multiple targets — keeps all of them visible", () => {
    const extra = document.createElement("div");
    container.appendChild(extra);

    const cleanup = ariaHideOutside([target, extra]);
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    expect(target.getAttribute("aria-hidden")).toBeNull();
    expect(extra.getAttribute("aria-hidden")).toBeNull();
    cleanup();
  });

  it("limits hiding to the custom root subtree", () => {
    const outside = document.createElement("div");
    document.body.appendChild(outside);

    const cleanup = ariaHideOutside([target], container);
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    expect(outside.getAttribute("aria-hidden")).toBeNull();

    cleanup();
    document.body.removeChild(outside);
  });

  it("hides newly inserted elements via MutationObserver", async () => {
    const cleanup = ariaHideOutside([target]);
    const newEl = document.createElement("span");
    container.appendChild(newEl);
    await new Promise<void>(r => setTimeout(r, 0));
    expect(newEl.getAttribute("aria-hidden")).toBe("true");
    cleanup();
  });

  it("never hides elements matching alwaysVisibleSelector", () => {
    sibling.setAttribute("aria-live", "polite");
    const cleanup = ariaHideOutside([target], document.body, "[aria-live]");
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
    cleanup();
    sibling.removeAttribute("aria-live");
  });

  it("ref-counts nested calls — inner cleanup does not reveal hidden nodes", () => {
    const cleanup1 = ariaHideOutside([target]);
    const cleanup2 = ariaHideOutside([target]);

    expect(sibling.getAttribute("aria-hidden")).toBe("true");

    cleanup2(); // inner done — outer still holds the ref
    expect(sibling.getAttribute("aria-hidden")).toBe("true");

    cleanup1(); // outer done — now it can be revealed
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
  });

  it("does not manage pre-existing aria-hidden elements", () => {
    sibling.setAttribute("aria-hidden", "true");

    const cleanup = ariaHideOutside([target]);
    cleanup();

    // Pre-existing attribute was not managed; cleanup must not remove it.
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    sibling.removeAttribute("aria-hidden");
  });
});

// ─── createHideOutside ────────────────────────────────────────────────────────

describe("createHideOutside", () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;
  let sibling: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    target = document.createElement("div");
    sibling = document.createElement("div");
    container.appendChild(target);
    container.appendChild(sibling);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("hides elements outside targets on mount", () => {
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target] });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    dispose();
  });

  it("removes aria-hidden when the reactive scope is disposed", () => {
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target] });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    dispose();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
  });

  it("does nothing when disabled is true", () => {
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], disabled: true });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
    dispose();
  });

  it("does nothing when disabled accessor returns true", () => {
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], disabled: () => true });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
    dispose();
  });

  it("starts hiding when disabled changes from true to false", () => {
    const [disabled, setDisabled] = createSignal(true);
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], disabled });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();

    setDisabled(false);
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    dispose();
  });

  it("stops hiding when disabled changes from false to true", () => {
    const [disabled, setDisabled] = createSignal(false);
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], disabled });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBe("true");

    setDisabled(true);
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
    dispose();
  });

  it("reacts to targets changing — newly added target becomes visible", () => {
    const extra = document.createElement("div");
    container.appendChild(extra);

    const [targets, setTargets] = createSignal([target]);
    const dispose = createRoot(d => {
      createHideOutside({ targets });
      return d;
    });
    flush();

    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    expect(extra.getAttribute("aria-hidden")).toBe("true");

    setTargets([target, extra]);
    flush();

    expect(sibling.getAttribute("aria-hidden")).toBe("true"); // still outside both targets
    expect(extra.getAttribute("aria-hidden")).toBeNull(); // now a target
    dispose();
  });

  it("accepts a reactive root that limits the hidden subtree", () => {
    const outside = document.createElement("div");
    document.body.appendChild(outside);

    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], root: () => container });
      return d;
    });
    flush();

    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    expect(outside.getAttribute("aria-hidden")).toBeNull();

    dispose();
    document.body.removeChild(outside);
  });

  it("respects alwaysVisibleSelector — matching elements are never hidden", () => {
    sibling.setAttribute("aria-live", "assertive");
    const dispose = createRoot(d => {
      createHideOutside({ targets: [target], alwaysVisibleSelector: "[aria-live]" });
      return d;
    });
    flush();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
    dispose();
    sibling.removeAttribute("aria-live");
  });
});
