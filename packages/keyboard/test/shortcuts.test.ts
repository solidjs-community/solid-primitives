import { createRoot, createSignal, flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createShortcuts, makeShortcutRegistry } from "../src/index.js";

const fire = (
  target: EventTarget,
  key: string,
  type: "keydown" | "keyup" = "keydown",
  extra: Partial<KeyboardEvent> = {},
) => {
  const ev = new Event(type, { cancelable: true, bubbles: true }) as any;
  ev.key = key;
  Object.assign(ev, extra);
  target.dispatchEvent(ev);
  return ev as KeyboardEvent;
};
const press = (key: string, extra: Partial<KeyboardEvent> = {}, target: EventTarget = window) => {
  const down = fire(target, key, "keydown", extra);
  fire(target, key, "keyup", extra);
  return down;
};

afterEach(() => {
  // make sure no test leaves pressed-key state behind on window
  window.dispatchEvent(new Event("blur"));
});

describe("makeShortcutRegistry", () => {
  test("survives disposal of a foreign owner that registered first", () => {
    let registry!: ReturnType<typeof makeShortcutRegistry>;
    const dispose0 = createRoot(d => {
      registry = makeShortcutRegistry();
      return d;
    });
    const handler = vi.fn();
    let disposeB!: VoidFunction;
    createRoot(d => {
      disposeB = d;
      registry.register({ keys: "A", handler });
    });
    press("a");
    expect(handler).toHaveBeenCalledTimes(1);
    disposeB();
    press("a");
    expect(handler).toHaveBeenCalledTimes(2);
    dispose0();
    press("a");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("fires on exact key set, order independent, case-insensitive, aliases", () => {
    const registry = makeShortcutRegistry();
    const a = vi.fn();
    registry.register({ keys: "Ctrl+Shift+k", handler: a });
    press("K", { ctrlKey: true, shiftKey: true });
    expect(a).toHaveBeenCalledTimes(1);
    press("K", { ctrlKey: true });
    press("K");
    expect(a).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("array keys, and multi-key chords of non-modifiers", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: ["a", "b"], handler: h });
    fire(window, "a");
    fire(window, "b");
    expect(h).toHaveBeenCalledTimes(1);
    fire(window, "b", "keyup");
    fire(window, "a", "keyup");
    registry.clear();
  });

  test('"+" key and empty definitions', () => {
    const registry = makeShortcutRegistry();
    const plus = vi.fn();
    const mod = vi.fn();
    registry.register({ keys: "+", handler: plus });
    registry.register({ keys: "Control++", handler: mod });
    registry.register({ keys: [], handler: vi.fn() })();
    press("+");
    press("+", { ctrlKey: true });
    expect(plus).toHaveBeenCalledTimes(1);
    expect(mod).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("keys with an Unidentified code do not get stuck (both release orders)", () => {
    for (const order of ["same", "reverse"]) {
      const registry = makeShortcutRegistry();
      const b = vi.fn();
      registry.register({ keys: "B", handler: b });
      const code = "Unidentified";
      fire(window, "a", "keydown", { code });
      fire(window, "b", "keydown", { code });
      const [first, second] = order === "same" ? ["a", "b"] : ["b", "a"];
      fire(window, first!, "keyup", { code });
      fire(window, second!, "keyup", { code });
      b.mockClear();
      // a stuck "A" would make the held set [A, B] and block a lone B
      fire(window, "b", "keydown", { code });
      fire(window, "b", "keyup", { code });
      expect(b).toHaveBeenCalledTimes(1);
      registry.clear();
    }
  });

  test("literal plus key in any position of a key string", () => {
    const registry = makeShortcutRegistry();
    const mid = vi.fn();
    const shiftPlus = vi.fn();
    registry.register({ keys: "Control+++K", handler: mid });
    registry.register({ keys: "Shift+++", handler: shiftPlus });
    // Control, +, K held together (chord of non-modifiers + and K)
    fire(window, "Control", "keydown", { ctrlKey: true, code: "ControlLeft" });
    fire(window, "+", "keydown", { ctrlKey: true, code: "Equal" });
    fire(window, "K", "keydown", { ctrlKey: true, code: "KeyK" });
    expect(mid).toHaveBeenCalledTimes(1);
    for (const [k, c] of [
      ["K", "KeyK"],
      ["+", "Equal"],
      ["Control", "ControlLeft"],
    ] as const)
      fire(window, k, "keyup", { code: c });
    fire(window, "Shift", "keydown", { shiftKey: true, code: "ShiftLeft" });
    fire(window, "+", "keydown", { shiftKey: true, code: "Equal" });
    expect(shiftPlus).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("a+++b registers a, + and b; malformed strings do not throw", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "a+++b", handler: h });
    fire(window, "a");
    fire(window, "+");
    fire(window, "b");
    expect(h).toHaveBeenCalledTimes(1);
    for (const k of ["b", "+", "a"]) fire(window, k, "keyup");
    for (const bad of ["", "+", "++", "+++", "a+", "+a", "a++b+", " ", "a+ +b"]) {
      expect(() => registry.register({ keys: bad, handler: vi.fn() })()).not.toThrow();
    }
    registry.clear();
  });

  test("preventDefault defaults to true and can be disabled", () => {
    const registry = makeShortcutRegistry();
    registry.register({ keys: "x", handler: () => {} });
    registry.register({ keys: "y", handler: () => {}, preventDefault: false });
    expect(press("x").defaultPrevented).toBe(true);
    expect(press("y").defaultPrevented).toBe(false);
    registry.clear();
  });

  test("uses one keydown and one keyup listener on the scope for all shortcuts", () => {
    const scope = document.createElement("div");
    const add = vi.spyOn(scope, "addEventListener");
    const registry = makeShortcutRegistry({ scope });
    registry.register({ keys: "a", handler: () => {} });
    registry.register({ keys: "b", handler: () => {} });
    registry.register({ keys: "c", handler: () => {} });
    // keyup is tracked on window (capture) so releases outside the scope are seen, and on the
    // scope itself so a scope whose events never reach window still sees releases
    expect(add.mock.calls.map(c => c[0]).sort()).toEqual(["focusout", "keydown", "keyup"]);
    registry.clear();
  });

  describe("conflict policy", () => {
    test("most recently registered eligible shortcut wins; only one fires", () => {
      const registry = makeShortcutRegistry();
      const first = vi.fn();
      const second = vi.fn();
      registry.register({ keys: "q", handler: first });
      registry.register({ keys: ["Q"], handler: second });
      press("q");
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("a disabled newer shortcut does not shadow an older one", () => {
      const registry = makeShortcutRegistry();
      const [enabled, setEnabled] = createSignal(false);
      const older = vi.fn();
      const newer = vi.fn();
      registry.register({ keys: "q", handler: older });
      registry.register({ keys: "q", handler: newer, enabled });
      press("q");
      expect(older).toHaveBeenCalledTimes(1);
      expect(newer).not.toHaveBeenCalled();
      setEnabled(true);
      flush();
      press("q");
      expect(newer).toHaveBeenCalledTimes(1);
      expect(older).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("input-ignoring newer shortcut falls through to older one inside inputs", () => {
      const registry = makeShortcutRegistry();
      const input = document.createElement("input");
      document.body.append(input);
      const older = vi.fn();
      const newer = vi.fn();
      registry.register({ keys: "q", handler: older });
      registry.register({ keys: "q", handler: newer, ignoreInputs: true });
      press("q", {}, input);
      expect(older).toHaveBeenCalledTimes(1);
      expect(newer).not.toHaveBeenCalled();
      press("q");
      expect(newer).toHaveBeenCalledTimes(1);
      input.remove();
      registry.clear();
    });

    test("different key sets never conflict (Ctrl+K vs K)", () => {
      const registry = makeShortcutRegistry();
      const plain = vi.fn();
      const mod = vi.fn();
      registry.register({ keys: "k", handler: plain });
      registry.register({ keys: "Control+k", handler: mod });
      press("k", { ctrlKey: true });
      expect(mod).toHaveBeenCalledTimes(1);
      expect(plain).not.toHaveBeenCalled();
      press("k");
      expect(plain).toHaveBeenCalledTimes(1);
      registry.clear();
    });
  });

  describe("dynamic registration", () => {
    test("unregister stops one shortcut; others keep working", () => {
      const registry = makeShortcutRegistry();
      const a = vi.fn();
      const b = vi.fn();
      const offA = registry.register({ keys: "a", handler: a });
      registry.register({ keys: "b", handler: b });
      offA();
      offA(); // idempotent
      press("a");
      press("b");
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("unregistering the newest reveals the older shortcut", () => {
      const registry = makeShortcutRegistry();
      const older = vi.fn();
      const newer = vi.fn();
      registry.register({ keys: "q", handler: older });
      const off = registry.register({ keys: "q", handler: newer });
      off();
      press("q");
      expect(older).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("register after clear works again; handlers added from within a handler", () => {
      const registry = makeShortcutRegistry();
      const late = vi.fn();
      registry.register({
        keys: "a",
        handler: () => {
          registry.register({ keys: "b", handler: late });
        },
      });
      press("a");
      press("b");
      expect(late).toHaveBeenCalledTimes(1);
      registry.clear();
      press("b");
      expect(late).toHaveBeenCalledTimes(1);
      const again = vi.fn();
      registry.register({ keys: "b", handler: again });
      press("b");
      expect(again).toHaveBeenCalledTimes(1);
      registry.clear();
    });
  });

  test("enabled accessor is read at key time", () => {
    const registry = makeShortcutRegistry();
    const [on, setOn] = createSignal(true);
    const h = vi.fn();
    registry.register({ keys: "e", handler: h, enabled: on });
    press("e");
    setOn(false);
    flush();
    press("e");
    expect(h).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("ignoreInputs skips input, textarea, select and contenteditable; default does not", () => {
    const registry = makeShortcutRegistry();
    const ignoring = vi.fn();
    const normal = vi.fn();
    registry.register({ keys: "s", handler: ignoring, ignoreInputs: true });
    registry.register({ keys: "t", handler: normal });
    const els = ["input", "textarea", "select"].map(t => document.createElement(t));
    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    els.push(editable);
    document.body.append(...els);
    for (const el of els) {
      press("s", {}, el);
      press("t", {}, el);
    }
    expect(ignoring).not.toHaveBeenCalled();
    expect(normal).toHaveBeenCalledTimes(4);
    press("s", {}, document.body);
    expect(ignoring).toHaveBeenCalledTimes(1);
    els.forEach(el => el.remove());
    registry.clear();
  });

  test("requireReset fires once until all keys are released", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "Control+k", handler: h, requireReset: true });
    fire(window, "Control", "keydown", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true });
    fire(window, "k", "keyup", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true }); // modifier still held
    expect(h).toHaveBeenCalledTimes(1);
    fire(window, "k", "keyup", { ctrlKey: true });
    fire(window, "Control", "keyup");
    fire(window, "Control", "keydown", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true });
    expect(h).toHaveBeenCalledTimes(2);
    registry.clear();
  });

  test("without requireReset, re-pressing the key with a held modifier retriggers; key repeat does not", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "Control+k", handler: h });
    fire(window, "Control", "keydown", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true, repeat: true });
    expect(h).toHaveBeenCalledTimes(1);
    fire(window, "k", "keyup", { ctrlKey: true });
    fire(window, "k", "keydown", { ctrlKey: true });
    expect(h).toHaveBeenCalledTimes(2);
    registry.clear();
  });

  test("Meta keyup clears stale state (macOS)", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "Meta+k", handler: h });
    fire(window, "Meta", "keydown", { metaKey: true });
    fire(window, "k", "keydown", { metaKey: true });
    expect(h).toHaveBeenCalledTimes(1);
    // no keyup for k, as on macOS
    fire(window, "Meta", "keyup");
    fire(window, "k", "keydown"); // must not be treated as Meta+k
    expect(h).toHaveBeenCalledTimes(1);
    fire(window, "k", "keyup");
    registry.clear();
  });

  test("modifiers held before listening are picked up from event flags; stale ones dropped", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "Alt+Shift+z", handler: h });
    press("z", { altKey: true, shiftKey: true });
    expect(h).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("blur resets pressed state", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "z", handler: h });
    fire(window, "a", "keydown"); // stray key held
    window.dispatchEvent(new Event("blur"));
    fire(window, "z", "keydown");
    expect(h).toHaveBeenCalledTimes(1);
    fire(window, "z", "keyup");
    registry.clear();
  });

  describe("scope element", () => {
    test("only reacts to events inside the scope", () => {
      const scope = document.createElement("div");
      const child = document.createElement("button");
      const outside = document.createElement("div");
      scope.append(child);
      document.body.append(scope, outside);
      const registry = makeShortcutRegistry({ scope });
      const h = vi.fn();
      registry.register({ keys: "a", handler: h });
      press("a", {}, outside);
      press("a");
      expect(h).not.toHaveBeenCalled();
      press("a", {}, child);
      press("a", {}, scope);
      expect(h).toHaveBeenCalledTimes(2);
      registry.clear();
      press("a", {}, child);
      expect(h).toHaveBeenCalledTimes(2);
      scope.remove();
      outside.remove();
    });
  });

  describe("scope keyup tracking", () => {
    test("a bare EventTarget scope (events never reach window) sees key releases", () => {
      const scope = new EventTarget();
      const registry = makeShortcutRegistry({ scope });
      const a = vi.fn();
      const b = vi.fn();
      registry.register({ keys: "a", handler: a });
      registry.register({ keys: "b", handler: b });
      fire(scope, "a", "keydown");
      fire(scope, "a", "keyup");
      fire(scope, "b", "keydown");
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("a keyup bubbling from the scope to window is processed exactly once", () => {
      // count how often the registry reads `key` while handling one keyup event
      const keyReads = (scope?: HTMLElement) => {
        if (scope) document.body.append(scope);
        const registry = makeShortcutRegistry({ scope });
        registry.register({ keys: "a", handler: () => {} });
        fire(scope ?? window, "a", "keydown");
        const up = new Event("keyup", { bubbles: true }) as any;
        let reads = 0;
        Object.defineProperty(up, "key", {
          get() {
            reads++;
            return "a";
          },
        });
        (scope ?? window).dispatchEvent(up);
        registry.clear();
        scope?.remove();
        return reads;
      };
      const baseline = keyReads();
      expect(baseline).toBeGreaterThan(0);
      expect(keyReads(document.createElement("div"))).toBe(baseline);
    });

    test("removes both keyup listeners on cleanup", () => {
      const scope = new EventTarget();
      const sAdd = vi.spyOn(scope, "addEventListener");
      const sRemove = vi.spyOn(scope, "removeEventListener");
      const wAdd = vi.spyOn(window, "addEventListener");
      const wRemove = vi.spyOn(window, "removeEventListener");
      const registry = makeShortcutRegistry({ scope });
      registry.register({ keys: "a", handler: () => {} });
      const sUp = sAdd.mock.calls.filter(c => c[0] === "keyup");
      const wUp = wAdd.mock.calls.filter(c => c[0] === "keyup");
      expect(sUp).toHaveLength(1);
      expect(wUp).toHaveLength(1);
      registry.clear();
      expect(sRemove.mock.calls.filter(c => c[0] === "keyup" && c[1] === sUp[0]![1])).toHaveLength(
        1,
      );
      expect(wRemove.mock.calls.filter(c => c[0] === "keyup" && c[1] === wUp[0]![1])).toHaveLength(
        1,
      );
      vi.restoreAllMocks();
    });
  });

  describe("scope element: focus leaving the scope", () => {
    const setup = () => {
      const scope = document.createElement("div");
      const child = document.createElement("button");
      const outside = document.createElement("button");
      scope.append(child);
      document.body.append(scope, outside);
      const registry = makeShortcutRegistry({ scope });
      const h = vi.fn();
      registry.register({ keys: "a", handler: h });
      const cleanup = () => {
        registry.clear();
        scope.remove();
        outside.remove();
      };
      return { scope, child, outside, registry, h, cleanup };
    };

    test("a keyup landing on an outside element still releases the key", () => {
      const { child, outside, h, cleanup } = setup();
      fire(child, "Tab", "keydown");
      fire(outside, "Tab", "keyup"); // focus moved out, keyup lands outside
      press("a", {}, child);
      expect(h).toHaveBeenCalledTimes(1);
      cleanup();
    });

    test("focusout to an element outside the scope resets pressed state", () => {
      const { child, outside, h, cleanup } = setup();
      fire(child, "Tab", "keydown");
      // no keyup is ever delivered (e.g. it was swallowed); focus just leaves the scope
      const out = new Event("focusout", { bubbles: true }) as any;
      out.relatedTarget = outside;
      child.dispatchEvent(out);
      press("a", {}, child);
      expect(h).toHaveBeenCalledTimes(1);
      cleanup();
    });

    test("focusout to another element inside the scope does not reset, null relatedTarget is ignored", () => {
      const { scope, child, h, cleanup } = setup();
      const other = document.createElement("input");
      scope.append(other);
      fire(child, "Control", "keydown", { ctrlKey: true });
      const inside = new Event("focusout", { bubbles: true }) as any;
      inside.relatedTarget = other;
      child.dispatchEvent(inside);
      const nul = new Event("focusout", { bubbles: true }) as any;
      nul.relatedTarget = null;
      child.dispatchEvent(nul);
      // Control still held: Control+a would need a different shortcut; plain "a" must NOT match
      fire(child, "a", "keydown", { ctrlKey: true });
      expect(h).not.toHaveBeenCalled();
      cleanup();
    });

    test("still does not fire for keydown outside the scope", () => {
      const { child, outside, h, cleanup } = setup();
      fire(child, "Tab", "keydown");
      fire(outside, "Tab", "keyup");
      fire(outside, "a", "keydown");
      fire(outside, "a", "keyup");
      expect(h).not.toHaveBeenCalled();
      cleanup();
    });

    test("cleanup removes the window keyup listener with matching capture flag", () => {
      const scope = document.createElement("div");
      const addW = vi.spyOn(window, "addEventListener");
      const remW = vi.spyOn(window, "removeEventListener");
      const addS = vi.spyOn(scope, "addEventListener");
      const remS = vi.spyOn(scope, "removeEventListener");
      const registry = makeShortcutRegistry({ scope });
      registry.register({ keys: "a", handler: () => {} });
      registry.clear();
      const up = (m: typeof addW) => m.mock.calls.filter(c => c[0] === "keyup");
      expect(up(addW).length).toBe(1);
      expect(up(remW).length).toBe(1);
      expect(up(remW)[0]![2]).toBe(up(addW)[0]![2]);
      expect(up(addW)[0]![2]).toBe(true);
      expect(addS.mock.calls.map(c => c[0]).sort()).toEqual(remS.mock.calls.map(c => c[0]).sort());
      press("a");
      vi.restoreAllMocks();
    });
  });

  describe("changing key values between keydown and keyup", () => {
    test("Shift+1: releasing Shift first, then the digit", () => {
      const registry = makeShortcutRegistry();
      const h = vi.fn();
      registry.register({ keys: "a", handler: h });
      fire(window, "Shift", "keydown", { code: "ShiftLeft", shiftKey: true });
      fire(window, "!", "keydown", { code: "Digit1", shiftKey: true });
      fire(window, "Shift", "keyup", { code: "ShiftLeft" });
      fire(window, "1", "keyup", { code: "Digit1" });
      press("a");
      expect(h).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("Shift+1: releasing the digit first, then Shift", () => {
      const registry = makeShortcutRegistry();
      const h = vi.fn();
      registry.register({ keys: "a", handler: h });
      fire(window, "Shift", "keydown", { code: "ShiftLeft", shiftKey: true });
      fire(window, "!", "keydown", { code: "Digit1", shiftKey: true });
      fire(window, "!", "keyup", { code: "Digit1", shiftKey: true });
      fire(window, "Shift", "keyup", { code: "ShiftLeft" });
      press("a");
      expect(h).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("letters: Shift+A released as Shift first then a", () => {
      const registry = makeShortcutRegistry();
      const h = vi.fn();
      registry.register({ keys: "b", handler: h });
      fire(window, "Shift", "keydown", { code: "ShiftLeft", shiftKey: true });
      fire(window, "A", "keydown", { code: "KeyA", shiftKey: true });
      fire(window, "Shift", "keyup", { code: "ShiftLeft" });
      fire(window, "a", "keyup", { code: "KeyA" });
      press("b");
      expect(h).toHaveBeenCalledTimes(1);
      registry.clear();
    });

    test("Meta keyup still clears everything", () => {
      const registry = makeShortcutRegistry();
      const h = vi.fn();
      registry.register({ keys: "a", handler: h });
      fire(window, "Meta", "keydown", { code: "MetaLeft", metaKey: true });
      fire(window, "x", "keydown", { code: "KeyX", metaKey: true });
      fire(window, "Meta", "keyup", { code: "MetaLeft" }); // no keyup for x on macOS
      press("a", { code: "KeyA" });
      expect(h).toHaveBeenCalledTimes(1);
      registry.clear();
    });
  });

  describe("cleanup", () => {
    test("clear removes all listeners from scope and window", () => {
      const scope = document.createElement("div");
      const addW = vi.spyOn(window, "addEventListener");
      const remW = vi.spyOn(window, "removeEventListener");
      const addS = vi.spyOn(scope, "addEventListener");
      const remS = vi.spyOn(scope, "removeEventListener");
      const registry = makeShortcutRegistry({ scope });
      registry.register({ keys: "a", handler: () => {} });
      registry.register({ keys: "b", handler: () => {} });
      registry.clear();
      expect(remS.mock.calls.map(c => c[0]).sort()).toEqual(addS.mock.calls.map(c => c[0]).sort());
      const added = addW.mock.calls.map(c => c[0]).filter(t => t === "blur" || t === "contextmenu");
      const removed = remW.mock.calls
        .map(c => c[0])
        .filter(t => t === "blur" || t === "contextmenu");
      expect(removed.sort()).toEqual(added.sort());
      expect(added.length).toBe(2);
      vi.restoreAllMocks();
    });

    test("listeners are removed once the last shortcut is unregistered", () => {
      const scope = document.createElement("div");
      const rem = vi.spyOn(scope, "removeEventListener");
      const registry = makeShortcutRegistry({ scope });
      const off1 = registry.register({ keys: "a", handler: () => {} });
      const off2 = registry.register({ keys: "b", handler: () => {} });
      off1();
      expect(rem).not.toHaveBeenCalled();
      off2();
      expect(rem).toHaveBeenCalledTimes(3);
      vi.restoreAllMocks();
    });

    test("is cleared when the owner is disposed", () => {
      const h = vi.fn();
      const dispose = createRoot(d => {
        makeShortcutRegistry().register({ keys: "a", handler: h });
        return d;
      });
      press("a");
      expect(h).toHaveBeenCalledTimes(1);
      dispose();
      press("a");
      expect(h).toHaveBeenCalledTimes(1);
    });
  });
});

describe("createShortcuts", () => {
  test("list form", () => {
    const h = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts([{ keys: "Control+s", handler: h }]);
      return d;
    });
    flush();
    press("s", { ctrlKey: true });
    expect(h).toHaveBeenCalledTimes(1);
    dispose();
    press("s", { ctrlKey: true });
    expect(h).toHaveBeenCalledTimes(1);
  });

  test("map form with handler and options objects", () => {
    const a = vi.fn();
    const b = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts({ "Control+a": a, x: { handler: b, preventDefault: false } });
      return d;
    });
    flush();
    press("a", { ctrlKey: true });
    expect(press("x").defaultPrevented).toBe(false);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("later entries win conflicts", () => {
    const a = vi.fn();
    const b = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts([
        { keys: "m", handler: a },
        { keys: "m", handler: b },
      ]);
      return d;
    });
    flush();
    press("m");
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("accessor of shortcuts re-registers when it changes", () => {
    const [list, setList] = createSignal<any[]>([]);
    const a = vi.fn();
    const b = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts(list);
      return d;
    });
    flush();
    press("a");
    setList([{ keys: "a", handler: a }]);
    flush();
    press("a");
    expect(a).toHaveBeenCalledTimes(1);
    setList([{ keys: "b", handler: b }]);
    flush();
    press("a");
    press("b");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("reactive scope accessor moves the listeners", () => {
    const s1 = document.createElement("div");
    const s2 = document.createElement("div");
    const [scope, setScope] = createSignal<EventTarget>(s1);
    const h = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts([{ keys: "a", handler: h }], { scope });
      return d;
    });
    flush();
    press("a", {}, s1);
    expect(h).toHaveBeenCalledTimes(1);
    setScope(s2);
    flush();
    press("a", {}, s1);
    press("a", {}, s2);
    expect(h).toHaveBeenCalledTimes(2);
    dispose();
  });

  test("enabled accessor per shortcut", () => {
    const [on, setOn] = createSignal(false);
    const h = vi.fn();
    const dispose = createRoot(d => {
      createShortcuts([{ keys: "a", handler: h, enabled: on }]);
      return d;
    });
    flush();
    press("a");
    expect(h).not.toHaveBeenCalled();
    setOn(true);
    flush();
    press("a");
    expect(h).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("disposal removes listeners (no leaks)", () => {
    const rem = vi.spyOn(window, "removeEventListener");
    const add = vi.spyOn(window, "addEventListener");
    const dispose = createRoot(d => {
      createShortcuts([{ keys: "a", handler: () => {} }]);
      return d;
    });
    flush();
    const added = add.mock.calls.filter(c => c[0] === "keydown").length;
    dispose();
    expect(rem.mock.calls.filter(c => c[0] === "keydown").length).toBe(added);
    vi.restoreAllMocks();
  });
});
