import { Accessor, onCleanup, untrack } from "solid-js";

export function makeSetItem<T>(set: Set<T>, item: T) {
  set.add(item);
  onCleanup(() => {
    set.delete(item);
  });
}

export function arrayEquals<T extends Array<unknown>>(a: T, b: T): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function trackTransitionPending(isPending: Accessor<boolean>, callback: () => void): void {
  if (untrack(isPending)) {
    isPending();
    return;
  } else {
    callback();
  }
}
