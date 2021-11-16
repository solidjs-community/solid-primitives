import type { ReturnTypes } from "solid-js";
import type { Fn } from "./common";

export type StopEffect = Fn;

export interface WatchOptions {
  defer?: boolean; // for "on"
}

export type EffectArrayCallback<Source extends Fn<any>[], U> = (
  input: ReturnTypes<Source>,
  prevInput: ReturnTypes<Source>,
  prevValue?: U
) => U;

export type EffectSignalCallback<Source extends Fn<any>, U> = (
  input: ReturnType<Source>,
  prevInput: ReturnType<Source>,
  prevValue?: U
) => U;

export type EffectCallback<Source extends Fn<any> | Fn<any>[], U> = Source extends Fn<any>[]
  ? EffectArrayCallback<Source, U>
  : Source extends Fn<any>
  ? EffectSignalCallback<Source, U>
  : never;

export type EffectSource<Source extends Fn<any> | Fn<any>[], U> = Source extends Fn<any>[]
  ? [...Source]
  : Source extends Fn<any>
  ? Source
  : never;

export interface Filter<Config extends {} | void, Returns extends {}> {
  <Source extends Fn<any>[] | Fn<any>, U, NestedReturns extends {}>(
    filter: FilterReturn<Source, U, NestedReturns>,
    options: Config
  ): FilterReturn<Source, U, Returns & NestedReturns>;
  <Source extends Fn<any>[], U>(
    source: [...Source],
    callback: EffectArrayCallback<Source, U>,
    options: Config
  ): FilterReturn<Source, U, Returns>;
  <Source extends Fn<any>, U>(
    source: Source,
    callback: EffectSignalCallback<Source, U>,
    options: Config
  ): FilterReturn<Source, U, Returns>;
}

export type FilterFnModifier<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}> = (
  callback: EffectCallback<Source, U>,
  stop: StopEffect | undefined
) => [EffectCallback<Source, U>, Returns];

export type FilterReturn<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}> = {
  stopRequired: boolean;
  initialSource: EffectSource<Source, U>;
  initialCallback: EffectCallback<Source, U>;
  modifyers: FilterFnModifier<Source, U, Returns>[];
};
