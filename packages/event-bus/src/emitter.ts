import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";
import { createEventBus, EventBusCore, Listener } from "./eventBus";

export class EmitterCore<M extends Record<PropertyKey, any>> {
  #buses: Record<PropertyKey, EventBusCore<any>> = {};

  on<K extends keyof M>(event: K, listener: Listener<M[K]>): void {
    (this.#buses[event] || (this.#buses[event] = new EventBusCore())).add(listener);
  }

  off<K extends keyof M>(event: K, listener: Listener<M[K]>): void {
    const bus = this.#buses[event];
    if (bus) {
      bus.delete(listener);
      if (!bus.size) delete this.#buses[event];
    }
  }

  emit<K extends keyof M>(
    event: K,
    ..._: void extends M[K] ? [payload?: M[K]] : [payload: M[K]]
  ): void;
  emit<K extends keyof M>(event: K, value: M[K]): void {
    this.#buses[event]?.emit(value);
  }

  clear(): void {
    this.#buses = {};
  }
}

export type EmitterOn<M extends Record<PropertyKey, any>> = <K extends keyof M>(
  event: K,
  listener: Listener<M[K]>
) => VoidFunction;

export type EmitterEmit<M extends Record<PropertyKey, any>> = EmitterCore<M>["emit"];

export type EmitterPayload<M extends Record<PropertyKey, any>> = {
  [K in keyof M]: { readonly name: K; readonly details: M[K] };
}[keyof M];

export type EmitterListener<M extends Record<PropertyKey, any>> = (
  payload: EmitterPayload<M>
) => void;

export type Emitter<M extends Record<PropertyKey, any>> = {
  readonly on: EmitterOn<M>;
  readonly emit: EmitterEmit<M>;
  readonly clear: VoidFunction;
};

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

export type EmitterListen<M extends Record<PropertyKey, any>> = (
  listener: EmitterListener<M>
) => VoidFunction;

export type GlobalEmitter<M extends Record<PropertyKey, any>> = {
  readonly on: EmitterOn<M>;
  readonly listen: EmitterListen<M>;
  readonly emit: EmitterEmit<M>;
  readonly clear: VoidFunction;
};

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
