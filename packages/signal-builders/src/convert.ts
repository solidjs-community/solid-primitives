import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

export const string = (from: any): Accessor<string> => createMemo(() => access(from) + "");

export const float = (input: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(input)));

export const int = (input: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(input), radix));

export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>,
): Accessor<string> => createMemo(() => access(list).join(access(separator)));
