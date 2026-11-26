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
