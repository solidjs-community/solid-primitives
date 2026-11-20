import { createSignal, untrack } from "solid-js";
import { isServer } from "@solidjs/web";

export const isWeakKey = (key: unknown): key is WeakKey =>
  (typeof key === "object" && key !== null) ||
  typeof key === "function" ||
  (typeof key === "symbol" && Symbol.keyFor(key) === undefined);

// Value-form signals consume no hydration id and retain no user key.
function createAliases(slot: string) {
  const [track, update] = createSignal(0);
  return { _slots: [slot], _track: track, _notify: () => update(value => value + 1) };
}

export abstract class KeyAliases<State extends Record<string, any>> {
  private _aliases = new WeakMap<WeakKey, ReturnType<typeof createAliases>>();
  private _notifications = new Set<() => void>();
  private _next = 0;
  protected _seen: WeakSet<object> = new WeakSet();

  abstract _adopt(state: State): void;
  protected abstract _readKey(state: State, slot: string): unknown;

  protected _register(key: WeakKey, slot: string): void {
    const aliases = this._aliases.get(key);
    if (!aliases) this._aliases.set(key, createAliases(slot));
    else if (!aliases._slots.includes(slot)) {
      aliases._slots.push(slot);
      this._notifications.add(aliases._notify);
    }
  }

  _notify(): void {
    for (const notify of this._notifications) notify();
    this._notifications.clear();
  }

  _slot(key: WeakKey, state: State): string {
    // The same key may have different local and wire slots. Use the alias in
    // this reader's visible generation without subscribing to the whole order.
    const slot = untrack(() => {
      this._adopt(state);
      const aliases = this._aliases.get(key);
      if (aliases)
        return (
          aliases._slots.find(slot => this._readKey(state, slot) === key) ?? aliases._slots.at(-1)!
        );
      const slot = "o:" + (isServer ? "s" : "c") + this._next++;
      this._aliases.set(key, createAliases(slot));
      return slot;
    });
    const aliases = this._aliases.get(key)!;
    aliases._track();
    if (aliases._slots.length > 1) for (const alias of aliases._slots) void ("k:" + alias in state);
    return slot;
  }
}
