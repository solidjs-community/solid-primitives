import { GenericListen, GenericListenProtect } from ".";

type ToPromiseValue<T extends any[]> = void extends T[1] ? T[0] : T;

export function toPromise<T extends any[]>(subscribe: GenericListen<T>): Promise<ToPromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect?: boolean
): Promise<ToPromiseValue<T>>;
export function toPromise<T extends any[]>(
  subscribe: GenericListenProtect<T>,
  protect = false
): Promise<ToPromiseValue<T>> {
  return new Promise<ToPromiseValue<T>>(resolve => {
    const unsub = subscribe((...payload) => {
      unsub();
      resolve(payload.length > 1 ? payload : payload[0]);
    }, protect);
  });
}

/**
 * Type Check
 */
// import { createEmitter, createEventBus, createEventStack } from ".";

// const emitter = createEmitter<string, number, boolean>();
// const res = await toPromise(emitter.listen);
// // [string, number, boolean]

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

// const race = await raceAgainstTime(toPromise(emitter.listen), 2000);
// const race2 = await raceAgainstTime([toPromise(emitter3.listen), toPromise(stack.listen)], 2000);
