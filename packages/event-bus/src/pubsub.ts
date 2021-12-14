import { onCleanup } from "solid-js";

export type Fn = () => void;
export type ClearListeners = Fn;
export type CookedUnsubscribe = Fn;

export type Listen<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  listener: Listener<Arg0, Arg1, Arg2, Arg3>
) => CookedUnsubscribe;
export type Listener<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  arg0: Arg0,
  arg1: Arg1,
  arg2: Arg2,
  arg3: Arg3
) => void;
export type Emit<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = Listener<
  Arg0,
  Arg1,
  Arg2,
  Arg3
>;
export type Remove<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  listener: Listener<Arg0, Arg1, Arg2, Arg3>
) => boolean;

export type Has<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  listener: Listener<Arg0, Arg1, Arg2, Arg3>
) => boolean;

export type BeforeEmit<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  pub: Emit<Arg0, Arg1, Arg2, Arg3>,
  ...payload: [Arg0, Arg1, Arg2, Arg3]
) => void;

export type BeforeRemove<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = (
  remove: () => boolean,
  listener: Listener<Arg0, Arg1, Arg2, Arg3>
) => boolean;

export type PubSub<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void> = {
  remove: Remove<Arg0, Arg1, Arg2, Arg3>;
  listen: Listen<Arg0, Arg1, Arg2, Arg3>;
  emit: Emit<Arg0, Arg1, Arg2, Arg3>;
  clear: ClearListeners;
  has: Has<Arg0, Arg1, Arg2, Arg3>;
};

export function createPubSub<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void>(config?: {
  beforeEmit?: BeforeEmit<Arg0, Arg1, Arg2, Arg3>;
  beforeRemove?: BeforeRemove<Arg0, Arg1, Arg2, Arg3>;
}): PubSub<Arg0, Arg1, Arg2, Arg3> {
  type _Listener = Listener<Arg0, Arg1, Arg2, Arg3>;
  type _Emit = Emit<Arg0, Arg1, Arg2, Arg3>;
  type _Remove = Remove<Arg0, Arg1, Arg2, Arg3>;

  const { beforeEmit, beforeRemove } = config ?? {};
  const set = new Set<_Listener>();

  const _remove: _Remove = listener => !!set.delete(listener);
  const remove: _Remove = beforeRemove
    ? listener => beforeRemove(() => _remove(listener), listener)
    : _remove;

  const listen: Listen<Arg0, Arg1, Arg2, Arg3> = listener => {
    set.add(listener);
    onCleanup(() => set.delete(listener));
    return () => remove(listener);
  };

  const _emit: _Emit = (...payload) => {
    for (const cb of set.values()) cb(...payload);
  };
  const emit: _Emit = beforeEmit ? (...payload) => beforeEmit(_emit, ...payload) : _emit;

  const clear = () => {
    for (const cb of set.values()) remove(cb);
  };
  const has = (listener: _Listener) => set.has(listener);

  onCleanup(() => set.clear());

  return {
    remove,
    listen,
    emit,
    clear,
    has
  };
}
