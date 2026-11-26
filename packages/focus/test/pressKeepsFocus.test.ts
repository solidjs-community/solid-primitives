import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot } from "solid-js";
import { createPressKeepsFocus, makePressKeepsFocus } from "../src/index.js";

const fire = (el: Element, type: string) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e;
};

function setup() {
  document.body.innerHTML = `
    <div id="editor" contenteditable="true" tabindex="0"></div>
    <div id="bar"><button id="bold">B</button><input id="field" type="text"><input id="box" type="checkbox"><textarea id="ta"></textarea><select id="sel"></select><div contenteditable="true"><span id="inner">x</span></div><button id="skip" data-skip>S</button></div>`;
  const q = (id: string) => document.getElementById(id)!;
  q("editor").focus();
  return q;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("makePressKeepsFocus", () => {
  it("prevents pointerdown and mousedown on buttons but not click", () => {
    const q = setup();
    const clear = makePressKeepsFocus(q("bar"));
    expect(fire(q("bold"), "pointerdown").defaultPrevented).toBe(true);
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(true);
    const onClick = vi.fn();
    q("bold").addEventListener("click", onClick);
    expect(fire(q("bold"), "click").defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    clear();
  });

  it("opts out for text inputs, textarea, select, contenteditable and checkbox-less inputs", () => {
    const q = setup();
    makePressKeepsFocus(q("bar"));
    for (const id of ["field", "ta", "sel", "inner"]) {
      expect(fire(q(id), "mousedown").defaultPrevented, id).toBe(false);
    }
    // a checkbox is a non-text control
    expect(fire(q("box"), "mousedown").defaultPrevented).toBe(true);
  });

  it("supports ignore and enabled", () => {
    const q = setup();
    let enabled = true;
    makePressKeepsFocus(q("bar"), {
      ignore: t => t.hasAttribute("data-skip"),
      enabled: () => enabled,
    });
    expect(fire(q("skip"), "mousedown").defaultPrevented).toBe(false);
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(true);
    enabled = false;
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(false);
  });

  it("does nothing when nothing is focused (unless onlyWhenFocused is false)", () => {
    const q = setup();
    (document.activeElement as HTMLElement).blur();
    makePressKeepsFocus(q("bar"));
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(false);
    makePressKeepsFocus(q("bar"), { onlyWhenFocused: false });
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(true);
  });

  it("does not touch already-prevented events and stops after cleanup", () => {
    const q = setup();
    const clear = makePressKeepsFocus(q("bar"));
    clear();
    expect(fire(q("bold"), "mousedown").defaultPrevented).toBe(false);
  });
});

describe("createPressKeepsFocus", () => {
  it("works as ref factory for several elements and cleans up with the owner", () => {
    const q = setup();
    let ref!: (el: HTMLElement) => void;
    const dispose = createRoot(d => {
      ref = createPressKeepsFocus();
      return d;
    });
    ref(q("bar"));
    ref(q("editor"));
    expect(fire(q("bold"), "pointerdown").defaultPrevented).toBe(true);
    dispose();
    expect(fire(q("bold"), "pointerdown").defaultPrevented).toBe(false);
  });
});
