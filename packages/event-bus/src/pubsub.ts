import { Fn } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export type ClearListeners = Fn;
export type Unsubscribe = Fn;

export type MultiArgListen<A0 = void, A1 = void, A2 = void> = (
  listener: MultiArgListener<A0, A1, A2>
) => Unsubscribe;
export type Listen<Payload = void> = (listener: Listener<Payload>) => Unsubscribe;

export type MultiArgListener<A0 = void, A1 = void, A2 = void> = (
  arg0: A0,
  arg1: A1,
  arg2: A2
) => void;
export type Listener<Payload = void> = (payload: Payload) => void;

export type MultiArgEmit<A0 = void, A1 = void, A2 = void> = MultiArgListener<A0, A1, A2>;
export type Emit<Payload = void> = (payload: Payload) => void;

export type Remove<A0 = void, A1 = void, A2 = void> = (
  listener: MultiArgListener<A0, A1, A2>
) => boolean;

export type EmitGuard<A0 = void, A1 = void, A2 = void> = {
  (emit: { (arg0: A0, arg1: A1, arg2: A2): void; (): void }, ...payload: [A0, A1, A2]): void;
};

export type RemoveGuard<Listener extends Function> = (
  remove: () => boolean,
  listener: Listener
) => boolean;

export type Pubsub<A0 = void, A1 = void, A2 = void> = {
  listen: MultiArgListen<A0, A1, A2>;
  once: MultiArgListen<A0, A1, A2>;
  emit: MultiArgEmit<A0, A1, A2>;
  remove: Remove<A0, A1, A2>;
  clear: ClearListeners;
  has: (listener: MultiArgListener<A0, A1, A2>) => boolean;
};

export type PubsubConfig<A0 = void, A1 = void, A2 = void> = {
  emitGuard?: EmitGuard<A0, A1, A2>;
  removeGuard?: RemoveGuard<MultiArgListener<A0, A1, A2>>;
  beforeEmit?: MultiArgListener<A0, A1, A2>;
};

export function createPubsub<A0 = void, A1 = void, A2 = void>(
  config: PubsubConfig<A0, A1, A2> = {}
): Pubsub<A0, A1, A2> {
  type _Listener = MultiArgListener<A0, A1, A2>;
  type _Listen = MultiArgListen<A0, A1, A2>;
  type _Emit = MultiArgEmit<A0, A1, A2>;
  type _Remove = Remove<A0, A1, A2>;

  const { emitGuard, removeGuard, beforeEmit } = config;
  const set = new Set<_Listener>();

  const forEachListener = (fn: (listener: _Listener) => void) => {
    for (const cb of set.values()) fn(cb);
  };

  const _remove: _Remove = listener => !!set.delete(listener);
  const remove: _Remove = removeGuard
    ? listener => removeGuard(() => _remove(listener), listener)
    : _remove;

  const listen: _Listen = listener => {
    set.add(listener);
    const unsub = () => set.delete(listener);
    onCleanup(unsub);
    return unsub;
  };

  const once: _Listen = listener => {
    const unsub = listen((...args) => {
      unsub();
      return listener(...args);
    });
    return unsub;
  };

  const _emit: _Emit = beforeEmit
    ? (...payload) => {
        beforeEmit(...payload);
        forEachListener(cb => cb(...payload));
      }
    : (...payload) => forEachListener(cb => cb(...payload));
  const emit: _Emit = emitGuard
    ? (...payload) =>
        emitGuard(
          // in the emitGuard's emit function: user can choose to pass arguments or not
          // if not then the original payload should be used
          (...args: [A0, A1, A2] | []) => _emit(...(args.length ? args : payload)),
          ...payload
        )
    : _emit;

  // cleanup uses set.clear() instead of clear() to always clear all the listeners,
  // ragardles of the conditions in the removeGuard
  onCleanup(() => set.clear());

  return {
    listen,
    once,
    emit,
    remove,
    clear: () => forEachListener(cb => remove(cb)),
    has: listener => set.has(listener)
  };
}
