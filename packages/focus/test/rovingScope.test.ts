import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createRovingScope, makeRovingScope } from "../src/index.js";

const tick = () => new Promise<void>(r => setTimeout(r, 0));

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => {
  const e = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e;
};

const html = (inner: string) => {
  document.body.innerHTML = `<div id="root">${inner}</div>`;
  return document.getElementById("root")!;
};
const btn = (id: string) => document.getElementById(id) as HTMLElement;
const tabindexes = (root: Element) =>
  [...root.querySelectorAll("button")].map(b => b.getAttribute("tabindex"));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("makeRovingScope", () => {
  it("makes only the first item tabbable and ignores non-matching elements", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button><span id="s">x</span>`);
    makeRovingScope(root, { selector: "button" });
    expect(tabindexes(root)).toEqual(["0", "-1"]);
    expect(btn("s").hasAttribute("tabindex")).toBe(false);
  });

  it("honors initialActive and falls back when it is not navigable", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const scope = makeRovingScope(root, { selector: "button", initialActive: i => i[1] });
    expect(tabindexes(root)).toEqual(["-1", "0"]);
    expect(scope.active()).toBe(btn("b"));
  });

  it("navigates with arrows, Home and End and prevents default", () => {
    const root = html(
      `<button id="a">a</button><button id="b">b</button><button id="c">c</button>`,
    );
    makeRovingScope(root, { selector: "button", orientation: "horizontal" });
    btn("a").focus();
    expect(key(btn("a"), "ArrowRight").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(btn("b"));
    expect(tabindexes(root)).toEqual(["-1", "0", "-1"]);
    key(btn("b"), "End");
    expect(document.activeElement).toBe(btn("c"));
    key(btn("c"), "Home");
    expect(document.activeElement).toBe(btn("a"));
    key(btn("a"), "ArrowLeft"); // no loop: stays
    expect(document.activeElement).toBe(btn("a"));
  });

  it("respects orientation", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    makeRovingScope(root, { selector: "button", orientation: "vertical" });
    btn("a").focus();
    expect(key(btn("a"), "ArrowRight").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(btn("a"));
    key(btn("a"), "ArrowDown");
    expect(document.activeElement).toBe(btn("b"));
    key(btn("b"), "ArrowUp");
    expect(document.activeElement).toBe(btn("a"));
  });

  it("orientation both accepts all arrows", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    makeRovingScope(root, { selector: "button" });
    btn("a").focus();
    key(btn("a"), "ArrowDown");
    expect(document.activeElement).toBe(btn("b"));
    key(btn("b"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("a"));
  });

  it("loops when asked", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    makeRovingScope(root, { selector: "button", loop: true, orientation: "horizontal" });
    btn("a").focus();
    key(btn("a"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("b"));
    key(btn("b"), "ArrowRight");
    expect(document.activeElement).toBe(btn("a"));
  });

  it("flips horizontal arrows in rtl (option and [dir] detection)", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const scope = makeRovingScope(root, {
      selector: "button",
      orientation: "horizontal",
      textDirection: "rtl",
    });
    btn("a").focus();
    key(btn("a"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("b"));
    scope.dispose();

    document.body.innerHTML = `<div dir="rtl"><div id="root"><button id="a">a</button><button id="b">b</button></div></div>`;
    makeRovingScope(document.getElementById("root")!, {
      selector: "button",
      orientation: "horizontal",
    });
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).not.toBe(btn("b"));
    key(btn("a"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("b"));
  });

  it("skips disabled, aria-disabled and hidden items", () => {
    const root = html(
      `<button id="a">a</button><button id="b" disabled>b</button><button id="c" aria-disabled="true">c</button><button id="d" hidden>d</button><button id="e">e</button>`,
    );
    makeRovingScope(root, { selector: "button", orientation: "horizontal" });
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).toBe(btn("e"));
  });

  it("can keep aria-disabled items navigable", () => {
    const root = html(`<button id="a">a</button><button id="c" aria-disabled="true">c</button>`);
    makeRovingScope(root, { selector: "button", skipDisabled: false, orientation: "horizontal" });
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).toBe(btn("c"));
  });

  it("does not start on a disabled first item", () => {
    const root = html(`<button id="a" disabled>a</button><button id="b">b</button>`);
    makeRovingScope(root, { selector: "button" });
    expect(tabindexes(root)).toEqual(["-1", "0"]);
  });

  it("remembers the last active item when focus leaves and returns", () => {
    document.body.innerHTML = `<div id="root"><button id="a">a</button><button id="b">b</button></div><button id="out">o</button>`;
    const root = document.getElementById("root")!;
    const scope = makeRovingScope(root, { selector: "button" });
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    btn("out").focus();
    expect(scope.active()).toBe(btn("b"));
    expect(tabindexes(root)).toEqual(["-1", "0"]);
    expect(scope.focus()).toBe(btn("b"));
    expect(document.activeElement).toBe(btn("b"));
  });

  it("follows focus moved by click/programmatically", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const onActiveChange = vi.fn();
    makeRovingScope(root, { selector: "button", onActiveChange });
    btn("b").focus();
    expect(tabindexes(root)).toEqual(["-1", "0"]);
    expect(onActiveChange).toHaveBeenLastCalledWith(btn("b"));
  });

  it("picks up added items and re-elects when the active one is removed", async () => {
    const root = html(
      `<button id="a">a</button><button id="b">b</button><button id="c">c</button>`,
    );
    const scope = makeRovingScope(root, { selector: "button" });
    btn("b").focus();
    const d = document.createElement("button");
    d.id = "d";
    d.setAttribute("tabindex", "0");
    root.append(d);
    await tick();
    expect(tabindexes(root)).toEqual(["-1", "0", "-1", "-1"]);
    btn("b").remove();
    await tick();
    expect(scope.active()).toBe(btn("c"));
    expect(tabindexes(root)).toEqual(["-1", "0", "-1"]);
    btn("c").remove();
    btn("d").remove();
    await tick();
    expect(scope.active()).toBe(btn("a"));
  });

  it("re-elects when the active item becomes disabled", async () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const scope = makeRovingScope(root, { selector: "button" });
    btn("a").setAttribute("disabled", "");
    await tick();
    expect(scope.active()).toBe(btn("b"));
  });

  it("keeps nested scopes independent", () => {
    const root = html(
      `<button id="a">a</button><div id="inner"><button id="x">x</button><button id="y">y</button></div><button id="b">b</button>`,
    );
    const outer = makeRovingScope(root, { selector: "button", orientation: "horizontal" });
    const inner = makeRovingScope(document.getElementById("inner")!, {
      selector: "button",
      orientation: "vertical",
    });
    expect(outer.items().map(i => i.id)).toEqual(["a", "b"]);
    expect(inner.items().map(i => i.id)).toEqual(["x", "y"]);
    expect(btn("x").getAttribute("tabindex")).toBe("0");
    expect(btn("y").getAttribute("tabindex")).toBe("-1");
    expect(btn("b").getAttribute("tabindex")).toBe("-1");

    btn("x").focus();
    key(btn("x"), "ArrowRight"); // inner is vertical; outer must not react either
    expect(document.activeElement).toBe(btn("x"));
    key(btn("x"), "ArrowDown");
    expect(document.activeElement).toBe(btn("y"));
    expect(outer.active()).toBe(btn("a"));
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).toBe(btn("b"));
    expect(inner.active()).toBe(btn("y"));
  });

  it("an outer scope created before the inner one releases the inner items", () => {
    const root = html(`<button id="a">a</button><div id="inner"><button id="x">x</button></div>`);
    const outer = makeRovingScope(root, { selector: "button" });
    expect(outer.items().length).toBe(2);
    const inner = makeRovingScope(document.getElementById("inner")!, { selector: "button" });
    expect(outer.items().map(i => i.id)).toEqual(["a"]);
    expect(btn("x").getAttribute("tabindex")).toBe("0");
    inner.dispose();
    expect(outer.items().map(i => i.id)).toEqual(["a", "x"]);
    expect(btn("x").hasAttribute("tabindex")).toBe(true);
    expect(btn("x").getAttribute("tabindex")).toBe("-1");
  });

  it("ignores arrows inside text fields, modified keys and defaultPrevented events", () => {
    const root = html(`<input id="i" type="text"><button id="b">b</button>`);
    makeRovingScope(root, { selector: "input, button", orientation: "horizontal" });
    btn("i").focus();
    expect(key(btn("i"), "ArrowRight").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(btn("i"));
    btn("b").focus();
    key(btn("b"), "ArrowLeft", { shiftKey: true });
    key(btn("b"), "ArrowLeft", { ctrlKey: true });
    expect(document.activeElement).toBe(btn("b"));
  });

  it("restores original tabindex values and removes listeners on dispose", async () => {
    const root = html(`<button id="a" tabindex="3">a</button><button id="b">b</button>`);
    const scope = makeRovingScope(root, { selector: "button" });
    expect(btn("a").getAttribute("tabindex")).toBe("0");
    scope.dispose();
    expect(btn("a").getAttribute("tabindex")).toBe("3");
    expect(btn("b").hasAttribute("tabindex")).toBe(false);
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).toBe(btn("a"));
    const d = document.createElement("button");
    root.append(d);
    await tick();
    expect(d.hasAttribute("tabindex")).toBe(false);
    scope.dispose(); // idempotent
  });

  it("can disable keyboard navigation and exposes imperative navigation", () => {
    const root = html(
      `<button id="a">a</button><button id="b">b</button><button id="c">c</button>`,
    );
    const scope = makeRovingScope(root, { selector: "button", keyboardNavigation: false });
    btn("a").focus();
    key(btn("a"), "ArrowRight");
    expect(document.activeElement).toBe(btn("a"));
    expect(scope.focusNext()).toBe(btn("b"));
    expect(scope.focusLast()).toBe(btn("c"));
    expect(scope.focusPrevious()).toBe(btn("b"));
    expect(scope.focusFirst()).toBe(btn("a"));
    expect(scope.setActive(btn("c"))).toBe(true);
    expect(tabindexes(root)).toEqual(["-1", "-1", "0"]);
    expect(scope.setActive(document.body)).toBe(false);
  });
});

describe("makeRovingScope owner cleanup", () => {
  it("restores tabindex and detaches on owner disposal", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    createRoot(d => {
      makeRovingScope(root, { selector: "button" });
      expect(tabindexes(root)).toEqual(["0", "-1"]);
      d();
    });
    expect(tabindexes(root)).toEqual([null, null]);
  });
});

describe("createRovingScope", () => {
  it("keeps the remembered item when non-structural options change", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const [loop, setLoop] = createSignal(false);
    let scope!: ReturnType<typeof createRovingScope>;
    createRoot(() => {
      scope = createRovingScope(() => root, { selector: "button", loop });
    });
    flush();
    btn("b").focus();
    flush();
    expect(scope.active()).toBe(btn("b"));
    setLoop(true);
    flush();
    expect(scope.active()).toBe(btn("b"));
    expect(tabindexes(root)).toEqual(["-1", "0"]);
  });

  it("is reactive in container and options, and cleans up", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const [el, setEl] = createSignal<HTMLElement | undefined>(undefined);
    const [loop, setLoop] = createSignal(false);
    let scope!: ReturnType<typeof createRovingScope>;
    const dispose = createRoot(d => {
      scope = createRovingScope(el, { selector: "button", loop, orientation: "horizontal" });
      return d;
    });
    flush();
    expect(scope.active()).toBeUndefined();
    setEl(root);
    flush();
    expect(scope.active()).toBe(btn("a"));
    btn("a").focus();
    key(btn("a"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("a"));
    setLoop(true);
    flush();
    expect(scope.active()).toBe(btn("a"));
    key(btn("a"), "ArrowLeft");
    expect(document.activeElement).toBe(btn("b"));
    flush();
    expect(scope.active()).toBe(btn("b"));
    expect(scope.focusFirst()).toBe(btn("a"));
    dispose();
    flush();
    expect(btn("a").hasAttribute("tabindex")).toBe(false);
    expect(scope.focusNext()).toBeUndefined();
  });

  it("enabled=false restores tabindex", () => {
    const root = html(`<button id="a">a</button><button id="b">b</button>`);
    const [enabled, setEnabled] = createSignal(true);
    const dispose = createRoot(d => {
      createRovingScope(() => root, { selector: "button", enabled });
      return d;
    });
    flush();
    expect(tabindexes(root)).toEqual(["0", "-1"]);
    setEnabled(false);
    flush();
    expect(tabindexes(root)).toEqual([null, null]);
    dispose();
  });
});
