import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { ariaHideOutside, createHideOutside } from "../src/index.js";

const nextMicrotask = () => new Promise<void>(resolve => queueMicrotask(resolve));

function makeTree() {
  const root = document.createElement("div");
  document.body.appendChild(root);
  return {
    root,
    add(...tags: string[]) {
      return tags.map(tag => {
        const el = document.createElement(tag);
        root.appendChild(el);
        return el;
      });
    },
    cleanup() {
      document.body.removeChild(root);
    },
  };
}

describe("ariaHideOutside", () => {
  describe("Hiding", () => {
    it("hides elements outside the target", () => {
      const { root, add, cleanup } = makeTree();
      const [target, sibling1, sibling2] = add("div", "div", "div");

      const restore = ariaHideOutside([target!], root);

      expect(target!.getAttribute("aria-hidden")).toBeNull();
      expect(sibling1!.getAttribute("aria-hidden")).toBe("true");
      expect(sibling2!.getAttribute("aria-hidden")).toBe("true");

      restore();
      cleanup();
    });

    it("keeps all targets visible when multiple are given", () => {
      const { root, add, cleanup } = makeTree();
      const [a, b, other] = add("div", "div", "div");

      const restore = ariaHideOutside([a!, b!], root);

      expect(a!.getAttribute("aria-hidden")).toBeNull();
      expect(b!.getAttribute("aria-hidden")).toBeNull();
      expect(other!.getAttribute("aria-hidden")).toBe("true");

      restore();
      cleanup();
    });

    it("skips descendants of the target", () => {
      const { root, add, cleanup } = makeTree();
      const [target] = add("div");
      const nested = document.createElement("span");
      const outside = document.createElement("span");
      target!.appendChild(nested);
      root.appendChild(outside);

      const restore = ariaHideOutside([target!], root);

      expect(nested.getAttribute("aria-hidden")).toBeNull();
      expect(outside.getAttribute("aria-hidden")).toBe("true");

      restore();
      cleanup();
    });

    it("skips descendants of already-hidden elements", () => {
      const { root, add, cleanup } = makeTree();
      const [target, parent] = add("div", "div");
      const child = document.createElement("span");
      parent!.appendChild(child);

      const restore = ariaHideOutside([target!], root);

      expect(parent!.getAttribute("aria-hidden")).toBe("true");
      expect(child.getAttribute("aria-hidden")).toBeNull();

      restore();
      cleanup();
    });

    it("hides descendants of role=row even when the row itself is hidden", () => {
      const { root, add, cleanup } = makeTree();
      const [target, row] = add("div", "div");
      row!.setAttribute("role", "row");
      const cell = document.createElement("div");
      cell.setAttribute("role", "cell");
      row!.appendChild(cell);

      const restore = ariaHideOutside([target!], root);

      expect(row!.getAttribute("aria-hidden")).toBe("true");
      expect(cell.getAttribute("aria-hidden")).toBe("true");

      restore();
      cleanup();
    });

    it("leaves already-hidden elements untouched after restore", () => {
      const { root, add, cleanup } = makeTree();
      const [target, preHidden] = add("div", "div");
      preHidden!.setAttribute("aria-hidden", "true");

      const restore = ariaHideOutside([target!], root);
      restore();

      expect(preHidden!.getAttribute("aria-hidden")).toBe("true");
      cleanup();
    });
  });

  describe("Restore", () => {
    it("removes aria-hidden on restore", () => {
      const { root, add, cleanup } = makeTree();
      const [target, sibling] = add("div", "div");

      const restore = ariaHideOutside([target!], root);
      restore();

      expect(sibling!.getAttribute("aria-hidden")).toBeNull();
      cleanup();
    });

    it("role=row cell attributes are removed on restore", () => {
      const { root, add, cleanup } = makeTree();
      const [target, row] = add("div", "div");
      row!.setAttribute("role", "row");
      const cell = document.createElement("div");
      row!.appendChild(cell);

      const restore = ariaHideOutside([target!], root);
      restore();

      expect(row!.getAttribute("aria-hidden")).toBeNull();
      expect(cell.getAttribute("aria-hidden")).toBeNull();
      cleanup();
    });
  });

  describe("Stacking", () => {
    it("keeps shared elements hidden until all stacked restores run", () => {
      const { root, add, cleanup } = makeTree();
      const [target1, target2, shared] = add("div", "div", "div");

      const restore1 = ariaHideOutside([target1!], root);
      const restore2 = ariaHideOutside([target2!], root);

      expect(shared!.getAttribute("aria-hidden")).toBe("true");

      restore2();
      expect(shared!.getAttribute("aria-hidden")).toBe("true");

      restore1();
      expect(shared!.getAttribute("aria-hidden")).toBeNull();
      cleanup();
    });

    it("handles out-of-order restores", () => {
      const { root, add, cleanup } = makeTree();
      const [target1, target2, other] = add("div", "div", "div");

      const restore1 = ariaHideOutside([target1!], root);
      const restore2 = ariaHideOutside([target2!], root);

      restore1();
      restore2();

      expect(other!.getAttribute("aria-hidden")).toBeNull();
      cleanup();
    });
  });

  describe("MutationObserver", () => {
    it("hides elements added to the DOM after the call", async () => {
      const { root, add, cleanup } = makeTree();
      const [target] = add("div");

      const restore = ariaHideOutside([target!], root);

      const dynamic = document.createElement("div");
      root.appendChild(dynamic);
      await nextMicrotask();

      expect(dynamic.getAttribute("aria-hidden")).toBe("true");

      restore();
      cleanup();
    });

    it("does not hide elements added inside the target", async () => {
      const { root, add, cleanup } = makeTree();
      const [target] = add("div");

      const restore = ariaHideOutside([target!], root);

      const nested = document.createElement("span");
      target!.appendChild(nested);
      await nextMicrotask();

      expect(nested.getAttribute("aria-hidden")).toBeNull();

      restore();
      cleanup();
    });
  });
});

describe("createHideOutside", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides elements outside the target on mount", () => {
    const { root, add, cleanup } = makeTree();
    const [target, sibling] = add("div", "div");

    const dispose = createRoot(d => {
      createHideOutside({ targets: [target!], root });
      return d;
    });

    flush();
    expect(sibling!.getAttribute("aria-hidden")).toBe("true");

    dispose();
    cleanup();
  });

  it("restores aria-hidden when the reactive root is disposed", () => {
    const { root, add, cleanup } = makeTree();
    const [target, sibling] = add("div", "div");

    const dispose = createRoot(d => {
      createHideOutside({ targets: [target!], root });
      return d;
    });

    flush();
    dispose();

    expect(sibling!.getAttribute("aria-hidden")).toBeNull();
    cleanup();
  });

  describe("Configuration", () => {
    it("does not hide when isDisabled is true", () => {
      const { root, add, cleanup } = makeTree();
      const [target, sibling] = add("div", "div");

      const dispose = createRoot(d => {
        createHideOutside({ targets: [target!], root, isDisabled: true });
        return d;
      });

      flush();
      expect(sibling!.getAttribute("aria-hidden")).toBeNull();

      dispose();
      cleanup();
    });

    it("re-hides when isDisabled changes to false", () => {
      const { root, add, cleanup } = makeTree();
      const [target, sibling] = add("div", "div");
      const [isDisabled, setIsDisabled] = createSignal(true);

      const dispose = createRoot(d => {
        createHideOutside({ targets: [target!], root, isDisabled });
        return d;
      });

      flush();
      expect(sibling!.getAttribute("aria-hidden")).toBeNull();

      setIsDisabled(false);
      flush();
      expect(sibling!.getAttribute("aria-hidden")).toBe("true");

      dispose();
      cleanup();
    });

    it("restores when isDisabled changes to true", () => {
      const { root, add, cleanup } = makeTree();
      const [target, sibling] = add("div", "div");
      const [isDisabled, setIsDisabled] = createSignal(false);

      const dispose = createRoot(d => {
        createHideOutside({ targets: [target!], root, isDisabled });
        return d;
      });

      flush();
      expect(sibling!.getAttribute("aria-hidden")).toBe("true");

      setIsDisabled(true);
      flush();
      expect(sibling!.getAttribute("aria-hidden")).toBeNull();

      dispose();
      cleanup();
    });

    it("re-hides when targets change", () => {
      const { root, add, cleanup } = makeTree();
      const [a, b] = add("div", "div");
      const [targets, setTargets] = createSignal<Element[]>([a!]);

      const dispose = createRoot(d => {
        createHideOutside({ targets, root });
        return d;
      });

      flush();
      expect(a!.getAttribute("aria-hidden")).toBeNull();
      expect(b!.getAttribute("aria-hidden")).toBe("true");

      setTargets([b!]);
      flush();
      expect(b!.getAttribute("aria-hidden")).toBeNull();
      expect(a!.getAttribute("aria-hidden")).toBe("true");

      dispose();
      cleanup();
    });
  });
});
