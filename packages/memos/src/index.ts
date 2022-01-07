import {
  Accessor,
  createComputed,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner
} from "solid-js";
import { MemoOptions } from "solid-js/types/reactive/signal";

/*
export declare function createMemo<Next extends _Next, Init = Next, _Next = Next>(fn: EffectFunction<Init | _Next, Next>, value: Init, options?: MemoOptions<Next>): Accessor<Next>;
export declare function createMemo<Next extends _Next, Init = undefined, _Next = Next>(..._: undefined extends Init ? [fn: EffectFunction<Init | _Next, Next>, value?: Init, options?: MemoOptions<Next>] : [fn: EffectFunction<Init | _Next, Next>, value: Init, options?: MemoOptions<Next>]): Accessor<Next>;
*/

export function createLazyMemo<T>(
  fn: (prev: T) => T,
  options?: MemoOptions<T> & { value?: T; init?: boolean }
): Accessor<T | undefined>;
export function createLazyMemo<T>(
  fn: (prev: T) => T,
  options?: MemoOptions<T> & { value: T }
): Accessor<T>;
export function createLazyMemo<T>(
  fn: (prev: T | undefined) => T,
  options?: MemoOptions<T> & { init: true }
): Accessor<T>;
export function createLazyMemo<T>(
  fn: (prev: T) => T,
  options?: MemoOptions<T> & { value: T; init: true }
): Accessor<T>;
export function createLazyMemo<T>(
  fn: (prev: T) => T,
  options?: MemoOptions<T> & { value?: T; init?: boolean }
): Accessor<T> {
  const [state, setState] = createSignal<any>(options?.value ?? undefined);
  options?.init && setState<T>(prev => fn(prev));

  let listeners = 0;
  let isActive = false;
  const owner = getOwner();

  function recreateComputation() {
    if (listeners !== 1 || !owner || isActive) return;
    isActive = true;
    runWithOwner(owner, () => {
      createComputed(() => {
        if (listeners > 0) setState<T>(prev => fn(prev));
        else isActive = false;
      });
    });
  }

  return () => {
    if (getOwner()) {
      listeners++;
      onCleanup(() => listeners--);
      recreateComputation();
    }
    return state();
  };
}
