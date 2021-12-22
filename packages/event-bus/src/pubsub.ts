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

export type EmitGuard<A0 = void, A1 = void, A2 = void> = (
  pub: MultiArgEmit<A0, A1, A2>,
  ...payload: [A0, A1, A2]
) => void;

export type RemoveGuard<Listener extends Function> = (
  remove: () => boolean,
  listener: Listener
) => boolean;

export type Pubsub<A0 = void, A1 = void, A2 = void> = [
  sub: MultiArgListen<A0, A1, A2>,
  pub: MultiArgEmit<A0, A1, A2>,
  rest: {
    remove: Remove<A0, A1, A2>;
    clear: ClearListeners;
    has: (listener: MultiArgListener<A0, A1, A2>) => boolean;
  }
];

export function createPubsub<A0 = void, A1 = void, A2 = void>(config?: {
  emitGuard?: EmitGuard<A0, A1, A2>;
  removeGuard?: RemoveGuard<MultiArgListener<A0, A1, A2>>;
  beforeEmit?: MultiArgListener<A0, A1, A2>;
}): Pubsub<A0, A1, A2> {
  type _Listener = MultiArgListener<A0, A1, A2>;
  type _Listen = MultiArgListen<A0, A1, A2>;
  type _Emit = MultiArgEmit<A0, A1, A2>;
  type _Remove = Remove<A0, A1, A2>;

  const { emitGuard, removeGuard, beforeEmit } = config ?? {};
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

  const _emit: _Emit = beforeEmit
    ? (...p) => {
        beforeEmit(...p);
        forEachListener(cb => cb(...p));
      }
    : (...p) => forEachListener(cb => cb(...p));
  const emit: _Emit = emitGuard ? (...payload) => emitGuard(_emit, ...payload) : _emit;

  const clear = () => {
    for (const cb of set.values()) remove(cb);
  };
  const has = (listener: _Listener) => set.has(listener);

  onCleanup(() => set.clear());

  return [
    listen,
    emit,
    {
      remove,
      clear,
      has
    }
  ];
}
