import type { ReturnTypes } from "solid-js";
import type { Fn } from "./common";

export type StopEffect = Fn;

export interface WatchOptions<U> {
  defer?: boolean; // for "on"
  name?: string; // for "createEffect", "createComputed", "createMemo", etc. (for debugging)
  value?: U; // for "createEffect", "createComputed", "createMemo", etc. (initial value)
}

export type EffectArrayCallback<Source extends Fn<any>[], U> = (
  input: ReturnTypes<Source>,
  prevInput: ReturnTypes<Source>,
  prevValue?: U,
) => U;

export type EffectSignalCallback<Source extends Fn<any>, U> = (
  input: ReturnType<Source>,
  prevInput: ReturnType<Source>,
  prevValue?: U,
) => U;

export type EffectCallback<Source extends Fn<any> | Fn<any>[], U> = Source extends Fn<any>[]
  ? EffectArrayCallback<Source, U>
  : Source extends Fn<any>
  ? EffectSignalCallback<Source, U>
  : never;

export type EffectSource<Source extends Fn<any> | Fn<any>[]> = Source extends Fn<any>[]
  ? [...Source]
  : Source extends Fn<any>
  ? Source
  : never;

export interface Modifier<Config extends unknown, Returns extends {}> {
  <Source extends Fn<any>[] | Fn<any>, U, NestedReturns extends {}>(
    filter: ModifierReturn<Source, U, NestedReturns>,
    options: Config,
  ): ModifierReturn<Source, U, Returns & NestedReturns>;
  <Source extends Fn<any>[], U>(
    source: [...Source],
    callback: EffectArrayCallback<Source, U>,
    options: Config,
  ): ModifierReturn<Source, U, Returns>;
  <Source extends Fn<any>, U>(
    source: Source,
    callback: EffectSignalCallback<Source, U>,
    options: Config,
  ): ModifierReturn<Source, U, Returns>;
}

export type CallbackModifier<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}> = (
  callback: EffectCallback<Source, U>,
  stop: StopEffect | undefined,
) => [EffectCallback<Source, U>, Returns];

export type ModifierReturn<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}> = {
  stopRequired: boolean;
  initialSource: EffectSource<Source>;
  initialCallback: EffectCallback<Source, U>;
  modifyers: CallbackModifier<Source, U, Returns>[];
};
