import { Accessor, createSignal, Setter } from "solid-js";
import { Get, createTriggerCache } from "@solid-primitives/utils";

export class ReactiveSet<T> {
  private s: Set<T>;
  private get: Accessor<Set<T>>;
  private _set: Setter<Set<T>>;
  private cache = createTriggerCache<T>();

  constructor(initial?: T[]) {
    this.s = new Set(initial);
    const [get, set] = createSignal(this.s, { equals: false });
    this.get = get;
    this._set = set;
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }

  add(v: T): boolean {
    const set = this.get();
    if (set.has(v)) return false;
    set.add(v);
    this._set(set);
    this.cache.dirty(v);
    return true;
  }
  delete(v: T): boolean {
    const set = this.get();
    const r = set.delete(v);
    if (r) {
      this._set(set);
      this.cache.dirty(v);
    }
    return r;
  }
  clear() {
    const set = this.get();
    if (set.size) {
      set.clear();
      this._set(set);
      this.cache.dirtyAll();
    }
  }
  set(list: T[]) {
    const set = this.get();
    set.clear();
    list.forEach(v => set.add(v));
    this._set(set);
    this.cache.dirtyAll();
  }
  forEach(cb: Get<T>) {
    this.get().forEach(cb);
  }
  values() {
    return this.get().values();
  }
  get size() {
    return this.get().size;
  }

  [Symbol.iterator]() {
    return this.values();
  }
}

export function createSet<T>(initial: T[]): Accessor<T[]> & ReactiveSet<T> {
  const set = new ReactiveSet(initial);
  return new Proxy(set, {
    apply: () => [...set]
  }) as Accessor<T[]> & ReactiveSet<T>;
}
