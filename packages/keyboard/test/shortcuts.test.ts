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
    expect(add.mock.calls.map(c => c[0])).toEqual(["keydown", "keyup"]);
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
      expect(rem).toHaveBeenCalledTimes(2);
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
