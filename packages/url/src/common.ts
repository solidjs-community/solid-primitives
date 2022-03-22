import { AnyObject } from "@solid-primitives/utils";
import { DeepReadonly } from "solid-js/store";

export type SetterValue<Prev, Next = Prev> = Next | ((prev: DeepReadonly<Prev>) => Next);

export const WHOLE = Symbol("watch_whole");

export const entries = Object.entries as <T extends AnyObject>(obj: T) => [keyof T, T[keyof T]][];
