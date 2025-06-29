import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

/**
 * signal-builder turning passed value to a string
 */
export const string = (from: any): Accessor<string> => createMemo(() => access(from) + "");

/**
 * signal-builder turning passed string to an float number
 */
export const float = (input: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(input)));

/**
 * signal-builder turning passed string to an intiger
 */
export const int = (input: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(input), radix));

/**
 * signal-builder joining array with a separator to a string
 */
export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>,
): Accessor<string> => createMemo(() => access(list).join(access(separator)));
