import { push } from "@solid-primitives/immutable";
import { batch, createEffect, createSignal, on } from "solid-js";
import { Listen, Listener, Emit } from "./eventBus";

/**
 * Turns a stream-like listen function, into a promise resolving when the first event is captured.
 * @param subscribe listen function from any EventBus/Emitter
 * @returns a promise resulting in the captured event value
 * @example
 * const emitter = createEmitter<string>();
 * const event = await toPromise(emitter.listen);
 */
export function toPromise<T>(subscribe: Listen<T>): Promise<T> {
  return new Promise<T>(resolve => once(subscribe, resolve));
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
export function once<T>(subscribe: Listen<T>, listener: Listener<T>): VoidFunction {
  const unsub = subscribe(payload => {
    unsub();
    listener(payload);
  });
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
export function toEffect<T>(emit: Emit<T>): Emit<T> {
  const [stack, setStack] = createSignal<T[]>([]);
  createEffect(
    on(stack, stack => {
      if (!stack.length) return;
      setStack([]);
      stack.forEach(emit as Emit<any>);
    })
  );
  return (payload?: any) => void setStack(p => push(p, payload));
}

// TODO jsdoc

export function batchGuard<T = void>(emit: Emit<T>, payload: T): void {
  batch(() => emit(payload));
}
