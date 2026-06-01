import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

/** Reactively coerces any value or signal to a string. */
export const string = (from: any): Accessor<string> => createMemo(() => access(from) + "");

/** Reactively parses a string signal or value as a floating-point number. Wraps `Number.parseFloat`. */
export const float = (input: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(input)));

/**
 * Reactively parses a string signal or value as an integer. Wraps `Number.parseInt`.
 * @param radix Base for parsing: 2 for binary, 8 for octal, 16 for hex. Defaults to 10.
 */
export const int = (input: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(input), radix));

/**
 * Reactively joins an array signal or value into a string.
 * @example
 * const [items, setItems] = createSignal(["a", "b", "c"]);
 * const csv = join(items, ",");
 * csv(); // => "a,b,c"
 */
export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>,
): Accessor<string> => createMemo(() => access(list).join(access(separator)));
