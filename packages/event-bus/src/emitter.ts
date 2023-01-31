import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";
import { createEventBus, EventBusCore, Listener } from "./eventBus";

export class EmitterCore<M extends Record<PropertyKey, any>> extends Map<
  keyof M,
  EventBusCore<M[any]>
> {
  on<K extends keyof M>(event: K, listener: Listener<M[K]>): void {
    let bus = this.get(event);
    bus || this.set(event, (bus = new EventBusCore<M[K]>()));
    bus.add(listener);
  }

  off<K extends keyof M>(event: K, listener: Listener<M[K]>): void {
    const bus = this.get(event);
    bus?.delete(listener) && !bus.size && this.delete(event);
  }

  emit<K extends keyof M>(
    event: K,
    ..._: void extends M[K] ? [payload?: M[K]] : [payload: M[K]]
  ): void;
  emit<K extends keyof M>(event: K, value: M[K]): void {
    this.get(event)?.emit(value);
  }
}

export type EmitterOn<M extends Record<PropertyKey, any>> = <K extends keyof M>(
  event: K,
  listener: Listener<M[K]>
) => VoidFunction;

export type EmitterEmit<M extends Record<PropertyKey, any>> = EmitterCore<M>["emit"];

export type Emitter<M extends Record<PropertyKey, any>> = {
  readonly on: EmitterOn<M>;
  readonly emit: EmitterEmit<M>;
  readonly clear: VoidFunction;
};

/**
 * Creates an emitter with which you can listen to and emit various events.
 *
 * @returns emitter mathods: `{on, emit, clear}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEmitter
 *
 * @example
 * const emitter = createEmitter<{
 *   foo: number;
 *   bar: string;
 * }>();
 * // can be destructured
 * const { on, emit, clear } = emitter;
 *
 * emitter.on("foo", e => {});
 * emitter.on("bar", e => {});
 *
 * emitter.emit("foo", 0);
 * emitter.emit("bar", "hello");
 */
export function createEmitter<M extends Record<PropertyKey, any>>(): Emitter<M> {
  const emitter = new EmitterCore<M>();

  return {
    on(event, listener) {
      emitter.on(event, listener);
      return tryOnCleanup(emitter.off.bind(emitter, event, listener as any));
    },
    emit: emitter.emit.bind(emitter),
    clear: onCleanup(emitter.clear.bind(emitter))
  };
}

export type EmitterPayload<M extends Record<PropertyKey, any>> = {
  [K in keyof M]: { readonly name: K; readonly details: M[K] };
}[keyof M];

export type EmitterListener<M extends Record<PropertyKey, any>> = (
  payload: EmitterPayload<M>
) => void;

export type EmitterListen<M extends Record<PropertyKey, any>> = (
  listener: EmitterListener<M>
) => VoidFunction;

export type GlobalEmitter<M extends Record<PropertyKey, any>> = {
  readonly on: EmitterOn<M>;
  readonly listen: EmitterListen<M>;
  readonly emit: EmitterEmit<M>;
  readonly clear: VoidFunction;
};

/**
 * Creates an emitter with which you can listen to and emit various events. With this emitter you can also listen to all events.
 *
 * @returns emitter mathods: `{on, listen, emit, clear}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createGlobalEmitter
 *
 * @example
 * const emitter = createGlobalEmitter<{
 *   foo: number;
 *   bar: string;
 * }>();
 * // can be destructured
 * const { on, emit, clear, listen } = emitter;
 *
 * emitter.on("foo", e => {});
 * emitter.on("bar", e => {});
 *
 * emitter.emit("foo", 0);
 * emitter.emit("bar", "hello");
 *
 * emitter.listen(e => {
 *   switch (e.name) {
 *     case "foo": {
 *       e.details;
 *       break;
 *     }
 *     case "bar": {
 *       e.details;
 *       break;
 *     }
 *   }
 * })
 */
export function createGlobalEmitter<M extends Record<PropertyKey, any>>(): GlobalEmitter<M> {
  const emitter = createEmitter<M>();
  const global = createEventBus<{ name: PropertyKey; details: any }>();

  return {
    on: emitter.on,
    clear: emitter.clear,
    listen: global.listen,
    emit(name, details?: any) {
      global.emit({ name, details });
      emitter.emit(name, details);
    }
  };
}
