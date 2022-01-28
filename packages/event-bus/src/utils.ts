import { push } from "@solid-primitives/immutable";
import { createEffect, createSignal, getOwner, on, onCleanup } from "solid-js";
import {
  GenericEmit,
  GenericListen,
  GenericListener,
  GenericListenProtect,
  Unsubscribe
} from "./types";

export const onRootCleanup: typeof onCleanup = fn => (getOwner() ? onCleanup(fn) : fn);

type _PromiseValue<T extends any[]> = void extends T[1] ? T[0] : T;

/**
 * Turns a stream-like listen function, into a promise resolving when the first event is captured.
 * @param subscribe listen function from any EventBus/Emitter
 * @returns a promise resulting in the captured event value
 * @example
 * const emitter = createEmitter<string>();
 * const event = await toPromise(emitter.listen);
 */
export function toPromise<T extends any[]>(subscribe: GenericListen<T>): Promise<_PromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect?: boolean
): Promise<_PromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect?: boolean
): Promise<_PromiseValue<T>> {
  return new Promise<_PromiseValue<T>>(resolve => {
    once(subscribe, (...data) => resolve(data.length > 1 ? data : data[0]), protect);
  });
}

/**
 * Listen to any EventBus/Emitter, but the listener will automatically unsubscribe on the first captured event. So the callback will run only **once**.
 *
 * @param subscribe Emitter's `listen` function
 * @param listener callback called when an event is emitted
 *
 * @returns unsubscribe function
 *
 * @example
 * const { listen, emit } = createEmitter<string>();
 * const unsub = once(listen, event => console.log(event));
 *
 * emit("foo") // will log "foo" and unsub
 *
 * emit("bar") // won't log
 */
export function once<T extends any[] = []>(
  subscribe: GenericListen<T>,
  listener: GenericListener<T>
): Unsubscribe;
export function once<T extends any[] = []>(
  subscribe: GenericListenProtect<T>,
  listener: GenericListener<T>,
  protect?: boolean
): Unsubscribe;
export function once<T extends any[] = []>(
  subscribe: GenericListenProtect<T>,
  listener: GenericListener<T>,
  protect?: boolean
): Unsubscribe {
  const unsub = subscribe((...payload) => {
    unsub();
    listener(...payload);
  }, protect);
  return unsub;
}

/**
 * Wraps `emit` calls inside a `createEffect`. It causes that listeners execute having an reactive owner available. It allows for usage of effects, memos and other primitives inside listeners, without having to create a synthetic root.
 *
 * @param emit the emit function of any emitter/event-bus
 * @returns modified emit function
 *
 * @example
 * const { listen, emit } = createEmitter();
 * const emitInEffect = toEffect(emit);
 * listen(() => console.log(getOwner()))
 *
 * // ...sometime later (after root initiation):
 * emit() // listener will log `null`
 * emitInEffect() // listener will log an owner object
 */
export function toEffect<T extends any[]>(emit: GenericEmit<T>): GenericEmit<T> {
  const [stack, setStack] = createSignal<T[]>([]);
  createEffect(
    on(stack, stack => {
      if (!stack.length) return;
      stack.forEach(payload => emit(...payload));
      setStack([]);
    })
  );
  return (...payload) => setStack(p => push(p, payload));
}
