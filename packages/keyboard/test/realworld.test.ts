import { createRoot, flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createShortcut, makeShortcutRegistry, useKeyDownList } from "../src/index.js";

type Win = Window & typeof globalThis;

const fire = (
  target: EventTarget,
  key: string,
  type: "keydown" | "keyup" = "keydown",
  extra: Partial<KeyboardEvent> & { composed?: boolean } = {},
  EventCtor: typeof Event = Event,
) => {
  const ev = new EventCtor(type, {
    cancelable: true,
    bubbles: true,
    composed: extra.composed ?? true,
  }) as any;
  ev.key = key;
  Object.assign(ev, extra);
  target.dispatchEvent(ev);
  return ev as KeyboardEvent;
};

afterEach(() => {
  window.dispatchEvent(new Event("blur"));
  document.body.innerHTML = "";
});

describe("keyup is tracked in the capture phase", () => {
  const stoppingInput = () => {
    const input = document.createElement("input");
    input.addEventListener("keyup", e => e.stopPropagation());
    document.body.append(input);
    return input;
  };

  test("registry: a keyup stopped by an app handler does not leave the key stuck", () => {
    const input = stoppingInput();
    const registry = makeShortcutRegistry();
    const j = vi.fn();
    const k = vi.fn();
    registry.register({ keys: "J", handler: j });
    registry.register({ keys: "K", handler: k });
    fire(input, "j", "keydown");
    fire(input, "j", "keyup");
    fire(input, "k", "keydown");
    fire(input, "k", "keyup");
    expect(j).toHaveBeenCalledTimes(1);
    expect(k).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("createShortcut: a keyup stopped by an app handler does not leave the key stuck", () =>
    createRoot(dispose => {
      const input = stoppingInput();
      const j = vi.fn();
      const k = vi.fn();
      createShortcut(["J"], j);
      createShortcut(["K"], k);
      fire(input, "j", "keydown");
      fire(input, "j", "keyup");
      fire(input, "k", "keydown");
      fire(input, "k", "keyup");
      expect(j).toHaveBeenCalledTimes(1);
      expect(k).toHaveBeenCalledTimes(1);
      dispose();
    }));

  test("useKeyDownList: a keyup stopped by an app handler releases the key", () =>
    createRoot(dispose => {
      const input = stoppingInput();
      const keys = useKeyDownList();
      fire(input, "j", "keydown");
      flush();
      expect(keys()).toEqual(["J"]);
      fire(input, "j", "keyup");
      flush();
      expect(keys()).toEqual([]);
      dispose();
    }));

  test("a scoped registry still handles each keyup only once", () => {
    const scope = document.createElement("div");
    document.body.append(scope);
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
});

describe("lock keys are ignored", () => {
  test.each(["CapsLock", "NumLock", "ScrollLock"])(
    "%s keydown without a keyup does not break matching (all three primitives)",
    lock =>
      createRoot(dispose => {
        const cs = vi.fn();
        const reg = vi.fn();
        createShortcut(["Control", "K"], cs);
        const registry = makeShortcutRegistry();
        registry.register({ keys: "Control+J", handler: reg });
        const keys = useKeyDownList();

        fire(window, lock, "keydown");
        flush();
        expect(keys()).toEqual([]);

        fire(window, "Control", "keydown", { ctrlKey: true });
        fire(window, "k", "keydown", { ctrlKey: true });
        fire(window, "k", "keyup", { ctrlKey: true });
        fire(window, "j", "keydown", { ctrlKey: true });
        fire(window, "j", "keyup", { ctrlKey: true });
        fire(window, "Control", "keyup");
        expect(cs).toHaveBeenCalledTimes(1);
        expect(reg).toHaveBeenCalledTimes(1);

        fire(window, lock, "keyup");
        flush();
        expect(keys()).toEqual([]);
        registry.clear();
        dispose();
      }),
  );

  test("a lock key is not a shortcut key", () => {
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "CapsLock", handler: h });
    fire(window, "CapsLock", "keydown");
    expect(h).not.toHaveBeenCalled();
    registry.clear();
  });
});

describe("ignoreInputs in iframes", () => {
  const makeFrame = () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const win = iframe.contentWindow as unknown as Win;
    const doc = iframe.contentDocument!;
    return { iframe, win, doc };
  };

  test("registry with an iframe document scope honours ignoreInputs", () => {
    const { win, doc } = makeFrame();
    const input = doc.createElement("input");
    const button = doc.createElement("button");
    doc.body.append(input, button);
    // sanity: a cross-realm element is not an instance of this realm's HTMLElement
    expect(input instanceof HTMLElement).toBe(false);

    const registry = makeShortcutRegistry({ scope: doc });
    const h = vi.fn();
    registry.register({ keys: "S", ignoreInputs: true, handler: h });

    fire(input, "s", "keydown", {}, win.Event);
    fire(input, "s", "keyup", {}, win.Event);
    expect(h).not.toHaveBeenCalled();

    fire(button, "s", "keydown", {}, win.Event);
    fire(button, "s", "keyup", {}, win.Event);
    expect(h).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("registry with an iframe contenteditable honours ignoreInputs", () => {
    const { win, doc } = makeFrame();
    const div = doc.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    doc.body.append(div);
    const registry = makeShortcutRegistry({ scope: doc });
    const h = vi.fn();
    registry.register({ keys: "S", ignoreInputs: true, handler: h });
    fire(div, "s", "keydown", {}, win.Event);
    expect(h).not.toHaveBeenCalled();
    registry.clear();
  });

  test.each(["window", "document"] as const)(
    "iframe %s scope: a keyup stopped by an app handler does not leave the key stuck",
    kind => {
      const { win, doc } = makeFrame();
      const input = doc.createElement("input");
      doc.body.append(input);
      input.addEventListener("keyup", e => e.stopPropagation());
      const registry = makeShortcutRegistry({ scope: kind === "window" ? win : doc });
      const j = vi.fn();
      const k = vi.fn();
      registry.register({ keys: "J", handler: j });
      registry.register({ keys: "K", handler: k });

      fire(input, "j", "keydown", {}, win.Event);
      fire(input, "j", "keyup", {}, win.Event);
      fire(input, "k", "keydown", {}, win.Event);
      fire(input, "k", "keyup", {}, win.Event);
      expect(j).toHaveBeenCalledTimes(1);
      expect(k).toHaveBeenCalledTimes(1);
      registry.clear();
    },
  );

  test("focus leaving an iframe document scope resets pressed keys", () => {
    const { win, doc } = makeFrame();
    const inside = doc.createElement("input");
    doc.body.append(inside);
    const outside = document.createElement("input");
    document.body.append(outside);
    const registry = makeShortcutRegistry({ scope: doc });
    const k = vi.fn();
    registry.register({ keys: "K", handler: k });

    fire(inside, "j", "keydown", {}, win.Event);
    const focusout = new win.Event("focusout", { bubbles: true }) as any;
    focusout.relatedTarget = outside;
    inside.dispatchEvent(focusout);
    fire(inside, "k", "keydown", {}, win.Event);
    expect(k).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("focus moving within an iframe document scope does not reset", () => {
    const { win, doc } = makeFrame();
    const a = doc.createElement("input");
    const b = doc.createElement("input");
    doc.body.append(a, b);
    const registry = makeShortcutRegistry({ scope: doc });
    const jk = vi.fn();
    registry.register({ keys: "J+K", handler: jk });
    fire(a, "j", "keydown", {}, win.Event);
    const focusout = new win.Event("focusout", { bubbles: true }) as any;
    focusout.relatedTarget = b;
    a.dispatchEvent(focusout);
    fire(b, "k", "keydown", {}, win.Event);
    expect(jk).toHaveBeenCalledTimes(1);
    registry.clear();
  });
});

describe("ignoreInputs in open shadow roots", () => {
  const makeShadow = () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = host.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    const button = document.createElement("button");
    root.append(input, button);
    return { host, input, button };
  };

  test("registry ignoreInputs sees the input inside the shadow root", () => {
    const { input, button } = makeShadow();
    const registry = makeShortcutRegistry();
    const h = vi.fn();
    registry.register({ keys: "X", ignoreInputs: true, handler: h });
    fire(input, "x", "keydown");
    fire(input, "x", "keyup");
    expect(h).not.toHaveBeenCalled();
    fire(button, "x", "keydown");
    fire(button, "x", "keyup");
    expect(h).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("createShortcut ignoreWithinInputs sees the input inside the shadow root", () =>
    createRoot(dispose => {
      const { input, button } = makeShadow();
      const h = vi.fn();
      createShortcut(["S"], h, { ignoreWithinInputs: true });
      fire(input, "s", "keydown");
      fire(input, "s", "keyup");
      expect(h).not.toHaveBeenCalled();
      fire(button, "s", "keydown");
      fire(button, "s", "keyup");
      expect(h).toHaveBeenCalledTimes(1);
      dispose();
    }));
});
