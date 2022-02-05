import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

export const number = (string: MaybeAccessor<string | number>): Accessor<number> =>
  createMemo(() => +access(string));

export const string = (from: any): Accessor<string> => createMemo(() => access(from) + "");

export const float = (string: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(string)));

export const int = (string: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(string), radix));

export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>
): Accessor<string> => createMemo(() => access(list).join(access(separator)));
