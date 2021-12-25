import { Fn } from "@solid-primitives/utils";

export type ClearListeners = Fn;
export type Unsubscribe = Fn;

export type MultiArgListener<A0 = void, A1 = void, A2 = void> = (
  arg0: A0,
  arg1: A1,
  arg2: A2
) => void;
export type Listener<Payload = void> = (payload: Payload) => void;

// export type MultiArgListen<A0 = void, A1 = void, A2 = void> = (
//   listener: MultiArgListener<A0, A1, A2>
// ) => Unsubscribe;

export type Listen<Payload = void> = (listener: Listener<Payload>) => Unsubscribe;
export type GenericListen<_Listener extends MultiArgListener<any, any, any> | Listener<any>> = (
  listener: _Listener
) => Unsubscribe;
export type GenericListenProtect<
  _Listener extends MultiArgListener<any, any, any> | Listener<any>
> = (listener: _Listener, protect?: boolean) => Unsubscribe;

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
