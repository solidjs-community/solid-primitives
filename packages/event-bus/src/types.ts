export type Listener<T = void> = (payload: T) => void;

export type Listen<T = void> = (listener: Listener<T>) => VoidFunction;

export type Emit<T = void> = (..._: void extends T ? [payload?: T] : [payload: T]) => void;

export type Remove<T> = (listener: Listener<T>) => boolean;

export type EmitGuard<T = void> = (emit: Emit<T>, payload: T) => void;
