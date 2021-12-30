import { getOwner, onCleanup } from "solid-js";
import { GenericListen, GenericListener, GenericListenProtect, Unsubscribe } from ".";

export const onRootCleanup: typeof onCleanup = fn => (getOwner() ? onCleanup(fn) : fn);

type ToPromiseValue<T extends any[]> = void extends T[1] ? T[0] : T;

/**
 * Turns a stream-like listen function, into a promise resolving when the first event is captured.
 * @param subscribe listen function from any EventBus/Emitter
 * @returns a promise resulting in the captured event value
 * @example
 * const emitter = createEmitter<string>();
 * const event = await toPromise(emitter.listen);
 */
export function toPromise<T extends any[]>(subscribe: GenericListen<T>): Promise<ToPromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect?: boolean
): Promise<ToPromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect?: boolean
): Promise<ToPromiseValue<T>> {
  return new Promise<ToPromiseValue<T>>(resolve => {
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
 * Type Check
 */
// import { createEmitter, createEventBus, createEventStack } from ".";

// const emitter = createEmitter<string, number, boolean>();
// const res = await toPromise(emitter.listen);
// // [string, number, boolean]

// once(emitter.listen, (a, b, c) => {});

// const bus = createEventBus<string>();
// const res2 = await toPromise(bus.listen);
// // [string, string | undefined]

// const emitter3 = createEmitter<string>();
// const res3 = await toPromise(emitter3.listen);
// // string

// const emitterVoid = createEmitter();
// const res4 = await toPromise(emitterVoid.listen);
// // void

// const stack = createEventStack<{ text: string }>();
// const res5 = await toPromise(stack.listen);
// // [{text: string}, {text: string}[], Fn]
