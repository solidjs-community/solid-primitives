import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createInertOthers, makeInertOthers } from "../src/index.js";

const el = (tag = "div", attrs: Record<string, string> = {}, parent: Element = document.body) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent.appendChild(node);
  return node;
};
const tick = () => new Promise<void>(r => setTimeout(r, 0));

let app: HTMLElement, dialog: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = "";
  app = el("div", { id: "app" });
  dialog = el("div", { id: "dialog" });
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("makeInertOthers", () => {
  test("hides siblings of the target and every ancestor, not the target path", () => {
    const wrapper = el("section");
    const inner = el("div", {}, wrapper);
    const sibling = el("p", {}, wrapper);
    const target = el("div", {}, inner);
    const targetChild = el("span", {}, target);
    const cleanup = makeInertOthers(target);
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    for (const node of [wrapper, inner, target, targetChild, document.body])
      expect(node.hasAttribute("aria-hidden")).toBe(false);
    expect(app.hasAttribute("inert")).toBe(false);
    cleanup();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    expect(sibling.hasAttribute("aria-hidden")).toBe(false);
  });

  test("accepts several targets", () => {
    const other = el("div");
    const cleanup = makeInertOthers([app, dialog]);
    expect(other.getAttribute("aria-hidden")).toBe("true");
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    expect(dialog.hasAttribute("aria-hidden")).toBe(false);
    cleanup();
  });

  test("strategies", () => {
    let c = makeInertOthers(dialog, { strategy: "inert" });
    expect(app.hasAttribute("inert")).toBe(true);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    c();
    expect(app.hasAttribute("inert")).toBe(false);

    c = makeInertOthers(dialog, { strategy: "both" });
    expect(app.hasAttribute("inert")).toBe(true);
    expect(app.getAttribute("aria-hidden")).toBe("true");
    c();
    expect(app.hasAttribute("inert")).toBe(false);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("restores pre-existing attribute values", () => {
    app.setAttribute("aria-hidden", "false");
    app.setAttribute("data-x", "1");
    const c = makeInertOthers(dialog, { strategy: "both" });
    expect(app.getAttribute("aria-hidden")).toBe("true");
    c();
    expect(app.getAttribute("aria-hidden")).toBe("false");
    expect(app.hasAttribute("inert")).toBe(false);
    expect(app.getAttribute("data-x")).toBe("1");
  });

  test("leaves already hidden/inert nodes untouched, including on cleanup", () => {
    const hidden = el("div", { "aria-hidden": "true" });
    const inertEl = el("div", { inert: "" });
    const c = makeInertOthers(dialog, { strategy: "both" });
    expect(hidden.getAttribute("aria-hidden")).toBe("true");
    expect(hidden.hasAttribute("inert")).toBe(true); // still gets the other strategy
    expect(inertEl.hasAttribute("inert")).toBe(true);
    expect(inertEl.getAttribute("aria-hidden")).toBe("true");
    c();
    expect(hidden.getAttribute("aria-hidden")).toBe("true");
    expect(hidden.hasAttribute("inert")).toBe(false);
    expect(inertEl.hasAttribute("inert")).toBe(true);
    expect(inertEl.hasAttribute("aria-hidden")).toBe(false);
  });

  test("ignore list", () => {
    const toast = el("div");
    const other = el("div");
    const c = makeInertOthers(dialog, { ignore: [toast, null] });
    expect(toast.hasAttribute("aria-hidden")).toBe(false);
    expect(other.getAttribute("aria-hidden")).toBe("true");
    c();
    const c2 = makeInertOthers(dialog, { ignore: toast });
    expect(toast.hasAttribute("aria-hidden")).toBe(false);
    c2();
  });

  test("ignored element nested deep keeps its path exposed", () => {
    const branch = el("div");
    const siblingInBranch = el("div", {}, branch);
    const toast = el("div", {}, branch);
    const c = makeInertOthers(dialog, { ignore: toast });
    expect(branch.hasAttribute("aria-hidden")).toBe(false);
    expect(siblingInBranch.getAttribute("aria-hidden")).toBe("true");
    expect(toast.hasAttribute("aria-hidden")).toBe(false);
    c();
  });

  test("skips live regions", () => {
    const polite = el("div", { "aria-live": "polite" });
    const off = el("div", { "aria-live": "off" });
    const status = el("div", { role: "status" });
    const c = makeInertOthers(dialog);
    expect(polite.hasAttribute("aria-hidden")).toBe(false);
    expect(status.hasAttribute("aria-hidden")).toBe(false);
    expect(off.getAttribute("aria-hidden")).toBe("true");
    c();
  });

  test("live regions are hidden under the inert strategy", () => {
    const main = el("main", { "aria-live": "polite" });
    const c = makeInertOthers(dialog, { strategy: "inert" });
    expect(main.hasAttribute("inert")).toBe(true);
    c();
    expect(main.hasAttribute("inert")).toBe(false);
  });

  test("an upper layer hides a lower alertdialog layer", () => {
    const lower = el("div", { role: "alertdialog" });
    const upper = el("div", { role: "dialog" });
    const c1 = makeInertOthers(lower);
    const c2 = makeInertOthers(upper, { strategy: "inert" });
    expect(lower.hasAttribute("inert")).toBe(true);
    c2();
    expect(lower.hasAttribute("inert")).toBe(false);
    c1();
  });

  test("a live region containing a lower layer target does not shield it", () => {
    const region = el("div", { "aria-live": "polite" });
    const lower = el("div", {}, region);
    const upper = el("div");
    const c1 = makeInertOthers(lower);
    const c2 = makeInertOthers(upper);
    expect(region.getAttribute("aria-hidden")).toBe("true");
    c2();
    expect(region.hasAttribute("aria-hidden")).toBe(false);
    c1();
  });

  test("skips script/style", () => {
    const script = el("script");
    const style = el("style");
    const c = makeInertOthers(dialog);
    expect(script.hasAttribute("aria-hidden")).toBe(false);
    expect(style.hasAttribute("aria-hidden")).toBe(false);
    c();
  });

  test("custom root", () => {
    const outside = el("div");
    const root = el("main");
    const a = el("div", {}, root);
    const target = el("div", {}, root);
    const c = makeInertOthers(target, { root });
    expect(a.getAttribute("aria-hidden")).toBe("true");
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    expect(root.hasAttribute("aria-hidden")).toBe(false);
    c();
  });

  test("targets outside the root are ignored", () => {
    const root = el("main");
    const a = el("div", {}, root);
    const c = makeInertOthers(dialog, { root });
    expect(a.hasAttribute("aria-hidden")).toBe(false);
    c();
  });

  test("no targets is a no-op", () => {
    const c = makeInertOthers(undefined);
    makeInertOthers([])();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    c();
  });

  test("cleanup is idempotent and does not clobber later changes", () => {
    const c = makeInertOthers(dialog);
    c();
    app.setAttribute("aria-hidden", "true");
    c();
    expect(app.getAttribute("aria-hidden")).toBe("true");
  });

  describe("stacking", () => {
    test("upper layer closes first", () => {
      const lower = el("div");
      const upper = el("div");
      const closeLower = makeInertOthers(lower);
      expect(upper.getAttribute("aria-hidden")).toBe("true"); // sibling of lower
      const closeUpper = makeInertOthers(upper);
      // opening the upper layer exposes it again, and hides the lower layer
      expect(upper.hasAttribute("aria-hidden")).toBe(false);
      expect(lower.getAttribute("aria-hidden")).toBe("true");
      expect(app.getAttribute("aria-hidden")).toBe("true");

      closeUpper();
      expect(app.getAttribute("aria-hidden")).toBe("true");
      expect(lower.hasAttribute("aria-hidden")).toBe(false);
      expect(upper.getAttribute("aria-hidden")).toBe("true");
      closeLower();
      for (const n of [app, lower, upper, dialog])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
    });

    test("lower layer closes first", () => {
      const lower = el("div");
      const upper = el("div");
      const closeLower = makeInertOthers(lower);
      const closeUpper = makeInertOthers(upper);
      closeLower();
      // still hidden by the upper layer
      expect(app.getAttribute("aria-hidden")).toBe("true");
      expect(lower.getAttribute("aria-hidden")).toBe("true");
      expect(upper.hasAttribute("aria-hidden")).toBe(false);
      closeUpper();
      for (const n of [app, lower, upper, dialog])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
    });

    test("nodes added while stacked are covered by both and restored once", () => {
      const lower = el("div");
      const upper = el("div");
      const closeLower = makeInertOthers(lower);
      const closeUpper = makeInertOthers(upper);
      return tick().then(async () => {
        const late = el("div");
        await tick();
        expect(late.getAttribute("aria-hidden")).toBe("true");
        closeUpper();
        expect(late.getAttribute("aria-hidden")).toBe("true");
        closeLower();
        expect(late.hasAttribute("aria-hidden")).toBe(false);
      });
    });

    test("pre-existing value survives stacked layers", () => {
      app.setAttribute("aria-hidden", "false");
      const a = makeInertOthers(dialog);
      const other = el("div");
      const b = makeInertOthers(other);
      a();
      expect(app.getAttribute("aria-hidden")).toBe("true");
      b();
      expect(app.getAttribute("aria-hidden")).toBe("false");
    });

    test("three layers closed in the middle first", () => {
      const l1 = el("div");
      const l2 = el("div");
      const l3 = el("div");
      const c1 = makeInertOthers(l1);
      const c2 = makeInertOthers(l2);
      const c3 = makeInertOthers(l3);
      c2();
      expect(l1.getAttribute("aria-hidden")).toBe("true");
      expect(l2.getAttribute("aria-hidden")).toBe("true");
      expect(l3.hasAttribute("aria-hidden")).toBe(false);
      c3();
      expect(l1.hasAttribute("aria-hidden")).toBe(false);
      expect(l2.getAttribute("aria-hidden")).toBe("true");
      c1();
      for (const n of [app, dialog, l1, l2, l3]) expect(n.hasAttribute("aria-hidden")).toBe(false);
    });
  });

  describe("protected elements inside a target", () => {
    test("children of a target that holds a live region / ignore element are not hidden", () => {
      const button = el("button", {}, dialog);
      const status = el("div", { role: "status" }, dialog);
      const toast = el("div", {}, dialog);
      const c = makeInertOthers(dialog, { strategy: "both", ignore: toast });
      for (const n of [button, status, toast, dialog]) {
        expect(n.hasAttribute("aria-hidden")).toBe(false);
        expect(n.hasAttribute("inert")).toBe(false);
      }
      expect(app.hasAttribute("inert")).toBe(true);
      c();
      const c2 = makeInertOthers(dialog);
      expect(button.hasAttribute("aria-hidden")).toBe(false);
      c2();
    });
  });

  describe("root handling", () => {
    test("a target equal to root does not hide siblings outside root", () => {
      const container = el("div", { id: "container" });
      const inside = el("div", {}, container);
      const outside = el("div", { id: "outside" });
      const c = makeInertOthers(container, { root: container });
      for (const n of [container, inside, outside, document.body, app, dialog])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
      c();
    });

    test("an ignored element equal to root does not walk above root", () => {
      const container = el("div", { id: "container" });
      const inside = el("div", {}, container);
      const target = el("div", {}, container);
      const outside = el("div", { id: "outside" });
      const c = makeInertOthers(target, { root: container, ignore: container });
      expect(outside.hasAttribute("aria-hidden")).toBe(false);
      expect(inside.hasAttribute("aria-hidden")).toBe(false);
      c();
    });
  });

  describe("dynamic nodes", () => {
    test("hides nodes added later and restores them on cleanup", async () => {
      const c = makeInertOthers(dialog);
      const late = el("div");
      const nested = el("div", {}, dialog.parentElement!);
      await tick();
      expect(late.getAttribute("aria-hidden")).toBe("true");
      expect(nested.getAttribute("aria-hidden")).toBe("true");
      c();
      expect(late.hasAttribute("aria-hidden")).toBe(false);
    });

    test("nodes added inside the target path (ancestor of target) are hidden", async () => {
      const wrapper = el("section");
      const target = el("div", {}, wrapper);
      const c = makeInertOthers(target);
      const late = el("div", {}, wrapper);
      await tick();
      expect(late.getAttribute("aria-hidden")).toBe("true");
      c();
    });

    test("live regions added later stay exposed", async () => {
      const c = makeInertOthers(dialog);
      const live = el("div", { "aria-live": "assertive" });
      await tick();
      expect(live.hasAttribute("aria-hidden")).toBe(false);
      c();
    });

    test("live regions added later inside an already hidden branch are re-evaluated", async () => {
      const wrapper = el("div", {}, app);
      const sibling = el("p", {}, wrapper);
      const c = makeInertOthers(dialog);
      expect(app.getAttribute("aria-hidden")).toBe("true");
      const live = el("div", { role: "status" }, wrapper);
      await tick();
      expect(live.hasAttribute("aria-hidden")).toBe(false);
      expect(wrapper.hasAttribute("aria-hidden")).toBe(false);
      expect(app.hasAttribute("aria-hidden")).toBe(false);
      expect(sibling.getAttribute("aria-hidden")).toBe("true");
      // a subtree that contains a live region counts too
      const host = el("section", {}, sibling);
      const nested = document.createElement("div");
      nested.setAttribute("aria-live", "polite");
      const deep = el("div");
      deep.appendChild(nested);
      host.appendChild(deep);
      await tick();
      expect(nested.hasAttribute("aria-hidden")).toBe(false);
      expect(deep.hasAttribute("aria-hidden")).toBe(false);
      // plain nodes do not make anything visible, and cleanup restores everything
      c();
      for (const n of [app, wrapper, sibling, host, deep])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
      const after = el("div", { role: "alert" }, app);
      await tick();
      expect(after.hasAttribute("aria-hidden")).toBe(false);
    });

    test("removed nodes are released", async () => {
      const c = makeInertOthers(dialog);
      app.remove();
      await tick();
      expect(app.hasAttribute("aria-hidden")).toBe(false);
      c();
    });

    test("moving a hidden node under a new hidden wrapper keeps it out of reach", async () => {
      const c = makeInertOthers(dialog);
      const holder = el("div");
      await tick();
      holder.appendChild(app);
      await tick();
      expect(holder.getAttribute("aria-hidden")).toBe("true");
      expect(app.hasAttribute("aria-hidden")).toBe(false); // covered by its hidden ancestor
      c();
    });

    test("observer is disconnected on cleanup", async () => {
      const c = makeInertOthers(dialog);
      c();
      const late = el("div");
      await tick();
      expect(late.hasAttribute("aria-hidden")).toBe(false);
    });

    test("stops observing so later nodes are never touched after cleanup of stacked layers", async () => {
      const a = makeInertOthers(dialog);
      const other = el("div");
      const b = makeInertOthers(other);
      a();
      b();
      const late = el("div");
      await tick();
      expect(late.hasAttribute("aria-hidden")).toBe(false);
    });
  });
});

describe("createInertOthers", () => {
  test("reacts to enabled", () => {
    const [enabled, setEnabled] = createSignal(false);
    const dispose = createRoot(d => {
      createInertOthers(dialog, enabled);
      return d;
    });
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    setEnabled(true);
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    setEnabled(false);
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dispose();
  });

  test("defaults to enabled and cleans up on dispose", () => {
    const dispose = createRoot(d => {
      createInertOthers(dialog);
      return d;
    });
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    dispose();
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("reacts to targets (accessor, appearing later, switching)", () => {
    const other = el("div");
    const [target, setTarget] = createSignal<HTMLElement | undefined>(undefined);
    const dispose = createRoot(d => {
      createInertOthers(target);
      return d;
    });
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    setTarget(dialog);
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.hasAttribute("aria-hidden")).toBe(false);
    setTarget(other);
    flush();
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    expect(other.hasAttribute("aria-hidden")).toBe(false);
    setTarget(undefined);
    flush();
    expect(dialog.hasAttribute("aria-hidden")).toBe(false);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dispose();
  });

  test("accepts an array of targets and a reactive ignore + strategy", () => {
    const toast = el("div");
    const [ignored, setIgnored] = createSignal<HTMLElement | undefined>(undefined);
    const dispose = createRoot(d => {
      createInertOthers([dialog], true, { strategy: "inert", ignore: ignored });
      return d;
    });
    flush();
    expect(toast.hasAttribute("inert")).toBe(true);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    setIgnored(toast);
    flush();
    expect(toast.hasAttribute("inert")).toBe(false);
    expect(app.hasAttribute("inert")).toBe(true);
    dispose();
    flush();
    expect(app.hasAttribute("inert")).toBe(false);
  });

  test("stacked reactive layers close in either order", () => {
    const upperEl = el("div");
    const [lowerOn, setLowerOn] = createSignal(true);
    const [upperOn, setUpperOn] = createSignal(true);
    const dispose = createRoot(d => {
      createInertOthers(dialog, lowerOn);
      createInertOthers(upperEl, upperOn);
      return d;
    });
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    setLowerOn(false);
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    setUpperOn(false);
    flush();
    for (const n of [app, dialog, upperEl]) expect(n.hasAttribute("aria-hidden")).toBe(false);
    dispose();
  });

  test("a lower layer keeps its stack position across reactive input changes", () => {
    const upperEl = el("div", { id: "upper" });
    const upperChild = el("button", {}, upperEl);
    const lowerAlt = el("div", { id: "lower-alt" });
    const toast = el("div", { id: "toast" });
    const [lowerTarget, setLowerTarget] = createSignal<HTMLElement>(dialog);
    const [lowerIgnore, setLowerIgnore] = createSignal<HTMLElement | undefined>(undefined);
    const [lowerOn, setLowerOn] = createSignal(true);
    const dispose = createRoot(d => {
      createInertOthers(lowerTarget, lowerOn, { ignore: lowerIgnore });
      createInertOthers(upperEl);
      return d;
    });
    const upperExposed = () => {
      for (const n of [upperEl, upperChild, document.body])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
    };
    flush();
    upperExposed();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.getAttribute("aria-hidden")).toBe("true");

    setLowerIgnore(toast);
    flush();
    upperExposed();
    expect(app.getAttribute("aria-hidden")).toBe("true");

    setLowerTarget(lowerAlt);
    flush();
    upperExposed();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(lowerAlt.getAttribute("aria-hidden")).toBe("true");

    setLowerOn(false);
    flush();
    upperExposed();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    // Stacking order is opening order, like a real modal stack: disabling and enabling again is a NEW
    // open, so the re-enabled layer goes on top and now hides the layer that opened in between.
    setLowerOn(true);
    flush();
    expect(upperEl.getAttribute("aria-hidden")).toBe("true");
    expect(lowerAlt.hasAttribute("aria-hidden")).toBe(false);
    // and it keeps that position across further input changes
    setLowerIgnore(undefined);
    flush();
    expect(upperEl.getAttribute("aria-hidden")).toBe("true");
    expect(lowerAlt.hasAttribute("aria-hidden")).toBe(false);
    dispose();
    flush();
    for (const n of [app, dialog, lowerAlt, upperEl, upperChild, toast])
      expect(n.hasAttribute("aria-hidden")).toBe(false);
  });

  test("the stack order is the order layers open, not the order they were created", () => {
    // hi is created first but disabled; low opens; then hi opens on top of low
    const hiEl = el("div", { id: "hi" });
    const hiChild = el("button", {}, hiEl);
    const lowEl = el("div", { id: "low" });
    const [hiOn, setHiOn] = createSignal(false);
    const run = (close: "hi-first" | "low-first") => {
      let disposeHi!: VoidFunction;
      createRoot(d => {
        disposeHi = d;
        createInertOthers(hiEl, hiOn);
      });
      flush();
      const closeLow = makeInertOthers(lowEl);
      expect(hiEl.getAttribute("aria-hidden")).toBe("true");
      setHiOn(true);
      flush();
      for (const n of [hiEl, hiChild, document.body])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
      expect(lowEl.getAttribute("aria-hidden")).toBe("true");
      expect(app.getAttribute("aria-hidden")).toBe("true");
      if (close === "hi-first") {
        setHiOn(false);
        flush();
        expect(hiEl.getAttribute("aria-hidden")).toBe("true");
        expect(lowEl.hasAttribute("aria-hidden")).toBe(false);
        closeLow();
      } else {
        closeLow();
        expect(hiEl.hasAttribute("aria-hidden")).toBe(false);
        expect(lowEl.getAttribute("aria-hidden")).toBe("true");
        disposeHi();
        flush();
      }
      disposeHi();
      flush();
      for (const n of [app, dialog, hiEl, hiChild, lowEl])
        expect(n.hasAttribute("aria-hidden")).toBe(false);
      setHiOn(false);
      flush();
    };
    run("hi-first");
    run("low-first");
  });

  test("layers closed in either order restore the original attributes after input changes", () => {
    const upperEl = el("div");
    const [lowerIgnore, setLowerIgnore] = createSignal<HTMLElement | undefined>(undefined);
    let disposeLower!: VoidFunction;
    let disposeUpper!: VoidFunction;
    createRoot(d => {
      disposeLower = d;
      createInertOthers(dialog, true, { ignore: lowerIgnore });
    });
    createRoot(d => {
      disposeUpper = d;
      createInertOthers(upperEl);
    });
    flush();
    setLowerIgnore(el("div"));
    flush();
    expect(upperEl.hasAttribute("aria-hidden")).toBe(false);
    expect(app.getAttribute("aria-hidden")).toBe("true");
    disposeLower();
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    disposeUpper();
    flush();
    for (const n of [app, dialog, upperEl]) expect(n.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("focus inside a branch that is about to be hidden", () => {
  // Chrome ignores aria-hidden on an ancestor of the focused element (the attribute is set but the
  // accessibility tree keeps exposing it, and it is never re-applied), so the attribute is deferred.
  let bgButton: HTMLButtonElement, dialogButton: HTMLButtonElement;
  beforeEach(() => {
    bgButton = el("button", {}, app) as HTMLButtonElement;
    dialogButton = el("button", {}, dialog) as HTMLButtonElement;
  });

  test("aria-hidden waits until focus leaves the branch, then applies", async () => {
    bgButton.focus();
    const cleanup = makeInertOthers(dialog);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dialogButton.focus();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("focus leaving to nothing (blur) also applies it", async () => {
    bgButton.focus();
    const cleanup = makeInertOthers(dialog);
    bgButton.blur();
    await tick();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("moving focus within the branch keeps it deferred", async () => {
    const second = el("button", {}, app);
    bgButton.focus();
    const cleanup = makeInertOthers(dialog);
    second.focus();
    await tick();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dialogButton.focus();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
  });

  test("closing before it was ever applied leaves the node untouched and drops the listeners", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    bgButton.focus();
    const cleanup = makeInertOthers(dialog);
    expect(add.mock.calls.filter(c => c[0] === "focusin")).toHaveLength(1);
    cleanup();
    expect(remove.mock.calls.filter(c => c[0] === "focusin")).toHaveLength(1);
    dialogButton.focus();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    add.mockRestore();
    remove.mockRestore();
  });

  test("a deferred node restores its previous value exactly, with stacked layers closed in either order", () => {
    for (const order of ["upper-first", "lower-first"]) {
      app.setAttribute("aria-hidden", "false");
      const upperEl = el("div");
      const upperButton = el("button", {}, upperEl);
      bgButton.focus();
      const lower = makeInertOthers(dialog);
      const upper = makeInertOthers(upperEl);
      expect(app.getAttribute("aria-hidden")).toBe("false");
      upperButton.focus();
      expect(app.getAttribute("aria-hidden")).toBe("true");
      expect(dialog.getAttribute("aria-hidden")).toBe("true");
      if (order === "upper-first") {
        upper();
        expect(app.getAttribute("aria-hidden")).toBe("true");
        lower();
      } else {
        lower();
        expect(app.getAttribute("aria-hidden")).toBe("true");
        upper();
      }
      expect(app.getAttribute("aria-hidden")).toBe("false");
      expect(dialog.hasAttribute("aria-hidden")).toBe(false);
      app.removeAttribute("aria-hidden");
      upperEl.remove();
    }
  });

  test("a node already hidden by another layer is counted at once even if focus is inside", () => {
    const upperEl = el("div");
    const upperButton = el("button", {}, upperEl);
    dialogButton.focus();
    const lower = makeInertOthers(upperEl); // hides app and dialog (dialog contains focus: deferred)
    upperButton.focus();
    expect(dialog.getAttribute("aria-hidden")).toBe("true");
    const upper = makeInertOthers(dialog);
    // a second layer hides upperEl (focus is inside it: deferred) and app (already held: counted)
    expect(app.getAttribute("aria-hidden")).toBe("true");
    dialogButton.focus();
    expect(upperEl.getAttribute("aria-hidden")).toBe("true");
    lower();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    upper();
    for (const n of [app, dialog, upperEl]) expect(n.hasAttribute("aria-hidden")).toBe(false);
  });

  test("the inert attribute is applied immediately even while focus is inside", () => {
    bgButton.focus();
    const cleanup = makeInertOthers(dialog, { strategy: "inert" });
    expect(app.hasAttribute("inert")).toBe(true);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    cleanup();
  });

  test("strategy both: inert at once, aria-hidden once focus has left", () => {
    bgButton.focus();
    const cleanup = makeInertOthers(dialog, { strategy: "both" });
    expect(app.hasAttribute("inert")).toBe(true);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dialogButton.focus();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    expect(app.hasAttribute("inert")).toBe(false);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("focus inside an open shadow root counts for its host", () => {
    const host = el("div", {}, app);
    const input = document.createElement("input");
    host.attachShadow({ mode: "open" }).appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(host);
    const cleanup = makeInertOthers(dialog);
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dialogButton.focus();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
  });

  test("createInertOthers defers the same way", () => {
    bgButton.focus();
    const [on, setOn] = createSignal(true);
    const dispose = createRoot(d => {
      createInertOthers(dialog, on);
      return d;
    });
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dialogButton.focus();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    setOn(false);
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dispose();
  });
});

describe("all targets removed while the layer is open", () => {
  test("held nodes stay held until the layer is updated or closed", async () => {
    const [target, setTarget] = createSignal<HTMLElement>(dialog);
    const dispose = createRoot(d => {
      createInertOthers(target);
      return d;
    });
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    dialog.remove();
    await tick();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    const next = el("div");
    setTarget(next);
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(next.hasAttribute("aria-hidden")).toBe(false);
    next.remove();
    await tick();
    dispose();
    flush();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });

  test("makeInertOthers: cleanup restores after the target was removed", async () => {
    const cleanup = makeInertOthers(dialog);
    dialog.remove();
    await tick();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("duplicate copies of the package", () => {
  test("share per-node state, so one copy's cleanup never reveals what another still hides", async () => {
    const wrapper = el("section");
    wrapper.appendChild(dialog);
    const other = el("div", { id: "other" });
    const extra = el("div", { id: "extra" });

    // a second, independent evaluation of the module, as with two installed copies
    vi.resetModules();
    const copy = await import("../src/inert.ts?copy");
    expect(copy.makeInertOthers).not.toBe(makeInertOthers);

    const cleanupA = makeInertOthers(dialog);
    const cleanupB = copy.makeInertOthers(extra);
    // `extra` is the only target of B, so A's target `dialog` is hidden by B while A hides `extra`
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(other.getAttribute("aria-hidden")).toBe("true");

    cleanupA();
    // B still hides everything that is not `extra`, even though A (another copy) just closed
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(other.getAttribute("aria-hidden")).toBe("true");
    expect(extra.hasAttribute("aria-hidden")).toBe(false);

    cleanupB();
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    expect(other.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("inferred root follows the first target", () => {
  test("a reactive target moving into an iframe document re-roots the layer", () => {
    const iframe = el("iframe") as HTMLIFrameElement;
    const idoc = iframe.contentDocument!;
    const iTarget = idoc.createElement("div");
    const iOther = idoc.createElement("div");
    idoc.body.append(iTarget, iOther);
    const [target, setTarget] = createSignal<HTMLElement>(dialog);
    const dispose = createRoot(d => {
      createInertOthers(target);
      return d;
    });
    flush();
    expect(app.getAttribute("aria-hidden")).toBe("true");
    expect(iOther.hasAttribute("aria-hidden")).toBe(false);
    setTarget(iTarget);
    flush();
    expect(iOther.getAttribute("aria-hidden")).toBe("true");
    expect(iTarget.hasAttribute("aria-hidden")).toBe(false);
    // the old document's holds are released
    expect(app.hasAttribute("aria-hidden")).toBe(false);
    dispose();
    flush();
    expect(iOther.hasAttribute("aria-hidden")).toBe(false);
  });

  test("an explicit root is preserved across updates", () => {
    const container = el("div");
    const a = el("div", {}, container);
    const b = el("div", {}, container);
    const outside = el("div");
    const [target, setTarget] = createSignal<HTMLElement>(a);
    const dispose = createRoot(d => {
      createInertOthers(target, true, { root: container });
      return d;
    });
    flush();
    expect(b.getAttribute("aria-hidden")).toBe("true");
    setTarget(b);
    flush();
    expect(a.getAttribute("aria-hidden")).toBe("true");
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    dispose();
  });
});

describe("ignore elements of upper layers", () => {
  for (const strategy of ["aria-hidden", "inert", "both"] as const) {
    const hidden = (n: Element) =>
      strategy === "aria-hidden"
        ? n.getAttribute("aria-hidden") === "true"
        : n.hasAttribute("inert");
    const clean = (n: Element) => !n.hasAttribute("aria-hidden") && !n.hasAttribute("inert");

    for (const order of ["upper first", "lower first"]) {
      test(`makeInertOthers (${strategy}), closing ${order}`, () => {
        const lower = el("div");
        const upper = el("div");
        const control = el("div");
        const unrelated = el("div");
        const closeA = makeInertOthers(lower, { strategy });
        expect(hidden(control)).toBe(true);
        const closeB = makeInertOthers(upper, { strategy, ignore: control });
        expect(clean(control)).toBe(true);
        expect(hidden(unrelated)).toBe(true);
        expect(hidden(lower)).toBe(true);
        if (order === "upper first") {
          closeB();
          closeA();
        } else {
          closeA();
          closeB();
        }
        for (const n of [app, dialog, lower, upper, control, unrelated])
          expect(clean(n)).toBe(true);
      });

      test(`createInertOthers (${strategy}) with reactive ignore, closing ${order}`, () => {
        const lower = el("div");
        const upper = el("div");
        const c1 = el("div");
        const c2 = el("div");
        const [ignore, setIgnore] = createSignal<Element>(c1);
        const closeA = makeInertOthers(lower, { strategy });
        const disposeB = createRoot(d => {
          createInertOthers(upper, true, { strategy, ignore });
          return d;
        });
        flush();
        expect(clean(c1)).toBe(true);
        expect(hidden(c2)).toBe(true);
        setIgnore(c2);
        flush();
        expect(clean(c2)).toBe(true);
        expect(hidden(c1)).toBe(true);
        if (order === "upper first") {
          disposeB();
          flush();
          closeA();
        } else {
          closeA();
          disposeB();
          flush();
        }
        for (const n of [app, dialog, lower, upper, c1, c2]) expect(clean(n)).toBe(true);
      });
    }
  }
});
