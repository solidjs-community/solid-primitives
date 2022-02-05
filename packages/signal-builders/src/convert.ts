import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

/**
 * signal-builder turning passed value to a string
 */
export const string = (from: any): Accessor<string> => createMemo(() => access(from) + "");

/**
 * signal-builder turning passed string to an float number
 */
export const float = (string: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(string)));

/**
 * signal-builder turning passed string to an intiger
 */
export const int = (string: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(string), radix));

/**
 * signal-builder joining array with a separator to a string
 */
export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>
): Accessor<string> => createMemo(() => access(list).join(access(separator)));
