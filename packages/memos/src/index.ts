import { EffectOptions } from "solid-js/types/reactive/signal";

export * from "./lazy";
export * from "./async";
export * from "./grouped";

export type MemoOptionsWithValue<T> = EffectOptions & { value?: T };
export type MemoOptionsWithValueInit<T> = MemoOptionsWithValue<T> & { init?: boolean };
