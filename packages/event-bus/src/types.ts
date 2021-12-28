import { Fn } from "@solid-primitives/utils";

export type ClearListeners = Fn;
export type Unsubscribe = Fn;

//
// Listener Types
//
export type GenericListener<Payload extends any[] = []> = (...payload: Payload) => void;

//
// Listen Types
//
export type Listen<A0 = void, A1 = void, A2 = void> = (
  listener: void extends A0
    ? GenericListener
    : void extends A1
    ? GenericListener<[A0]>
    : void extends A2
    ? GenericListener<[A0, A1]>
    : GenericListener<[A0, A1, A2]>
) => Unsubscribe;

export type ListenProtect<A0 = void, A1 = void, A2 = void> = (
  listener: Parameters<Listen<A0, A1, A2>>[0],
  protect?: boolean
) => Unsubscribe;

export type MultiArgListen<A0 = void, A1 = void, A2 = void> = (
  listener: GenericListener<[A0, A1, A2]>
) => Unsubscribe;

export type MultiArgListenProtect<A0 = void, A1 = void, A2 = void> = (
  listener: GenericListener<[A0, A1, A2]>,
  protect?: boolean
) => Unsubscribe;

//
// Emit Types
//
export type Emit<A0 = void, A1 = void, A2 = void> = void extends A0
  ? () => void
  : void extends A1
  ? (payload: A0) => void
  : void extends A2
  ? GenericEmit<[A0, A1]>
  : GenericEmit<[A0, A1, A2]>;

export type GenericEmit<Payload extends any[] = []> = (...payload: Payload) => void;

export type Remove<A0 = void, A1 = void, A2 = void> = (
  listener: GenericListener<[A0, A1, A2]>
) => boolean;

export type EmitGuard<A0 = void, A1 = void, A2 = void> = {
  (emit: { (arg0: A0, arg1: A1, arg2: A2): void; (): void }, ...payload: [A0, A1, A2]): void;
};

export type RemoveGuard<Listener extends Function> = (
  remove: () => boolean,
  listener: Listener
) => boolean;
