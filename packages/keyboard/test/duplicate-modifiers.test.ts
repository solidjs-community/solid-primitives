import { createRoot, flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createShortcut, makeShortcutRegistry, useKeyDownList } from "../src/index.js";

const send = (
  type: "keydown" | "keyup",
  key: string,
  code: string,
  flags: Partial<KeyboardEvent> = {},
) => {
  const ev = new Event(type, { cancelable: true, bubbles: true }) as any;
  ev.key = key;
  ev.code = code;
  Object.assign(ev, flags);
  window.dispatchEvent(ev);
};

const MODIFIERS = [
  ["Control", "ctrlKey", "CONTROL"],
  ["Shift", "shiftKey", "SHIFT"],
  ["Alt", "altKey", "ALT"],
  ["Meta", "metaKey", "META"],
] as const;

afterEach(() => {
  window.dispatchEvent(new Event("blur"));
});

describe.each(MODIFIERS)("both %s keys held", (mod, flag, upper) => {
  // Hold Left + Right + K, release K, release Left (flag still true), press K again.
  const run = (probe: () => void) => {
    const on = { [flag]: true };
    send("keydown", mod, `${mod}Left`, on);
    send("keydown", mod, `${mod}Right`, on);
    send("keydown", "k", "KeyK", on);
    probe();
    send("keyup", "k", "KeyK", on);
    send("keyup", mod, `${mod}Left`, on);
  };

  test("registry with requireReset does not re-fire until every modifier is released", () => {
    const handler = vi.fn();
    const on = { [flag]: true };
    const registry = makeShortcutRegistry();
    registry.register({ keys: `${mod}+K`, handler, requireReset: true });
    run(() => expect(handler).toHaveBeenCalledTimes(1));
    send("keydown", "k", "KeyK", on);
    expect(handler).toHaveBeenCalledTimes(1);
    send("keyup", "k", "KeyK", on);
    send("keyup", mod, `${mod}Right`, { [flag]: false });
    send("keydown", mod, `${mod}Left`, on);
    send("keydown", "k", "KeyK", on);
    expect(handler).toHaveBeenCalledTimes(2);
    registry.clear();
  });

  test("createShortcut with requireReset does not re-fire until every modifier is released", () => {
    const handler = vi.fn();
    const on = { [flag]: true };
    const dispose = createRoot(d => {
      createShortcut([mod, "K"], handler, { requireReset: true });
      return d;
    });
    flush();
    run(() => expect(handler).toHaveBeenCalledTimes(1));
    send("keydown", "k", "KeyK", on);
    expect(handler).toHaveBeenCalledTimes(1);
    send("keyup", "k", "KeyK", on);
    send("keyup", mod, `${mod}Right`, { [flag]: false });
    send("keydown", mod, `${mod}Left`, on);
    send("keydown", "k", "KeyK", on);
    expect(handler).toHaveBeenCalledTimes(2);
    dispose();
  });

  test("useKeyDownList keeps the modifier until the last physical key is released", () =>
    createRoot(dispose => {
      const keys = useKeyDownList();
      const on = { [flag]: true };
      run(() => {});
      flush();
      expect(keys()).toEqual([upper]);
      send("keydown", "k", "KeyK", on);
      flush();
      expect(keys()).toEqual([upper, "K"]);
      send("keyup", "k", "KeyK", on);
      send("keyup", mod, `${mod}Right`, { [flag]: false });
      flush();
      expect(keys()).toEqual([]);
      dispose();
    }));

  test("single modifier behaves as before", () =>
    createRoot(dispose => {
      const keys = useKeyDownList();
      const on = { [flag]: true };
      send("keydown", mod, `${mod}Left`, on);
      send("keydown", "k", "KeyK", on);
      flush();
      expect(keys()).toEqual([upper, "K"]);
      send("keyup", "k", "KeyK", on);
      send("keyup", mod, `${mod}Left`, { [flag]: false });
      flush();
      expect(keys()).toEqual([]);
      dispose();
    }));
});
