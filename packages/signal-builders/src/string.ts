import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

/** Reactive `String.prototype.toLowerCase()`. */
export const lowercase = (string: Accessor<string>) => createMemo(() => string().toLowerCase());

/** Reactive `String.prototype.toUpperCase()`. */
export const uppercase = (string: Accessor<string>) => createMemo(() => string().toUpperCase());

/**
 * Reactively capitalizes a string — uppercases the first character, lowercases the rest.
 * @example
 * const [s, setS] = createSignal("hELLO wORLD");
 * capitalize(s)(); // => "Hello world"
 */
export const capitalize = (string: Accessor<string>) =>
  createMemo(() => { const s = string(); return s.length === 0 ? s : s[0]!.toUpperCase() + s.substring(1).toLowerCase(); });

/**
 * Reactive `String.prototype.substring()`.
 * @param end Exclusive upper bound; omit to extend through the end of the string.
 * @example
 * const [s, setS] = createSignal("Hello, world!");
 * substring(s, 7, 12)(); // => "world"
 */
export const substring = (
  string: MaybeAccessor<string>,
  start: MaybeAccessor<number>,
  end?: MaybeAccessor<number>,
) => createMemo(() => access(string).substring(access(start), access(end)));

/**
 * Reactive tagged template literal — interpolated values can be signals or plain values.
 * @example
 * const [greeting, setGreeting] = createSignal('Hello');
 * const [target, setTarget] = createSignal('Solid');
 * const message = template`${greeting}, ${target}!`;
 * message() // => "Hello, Solid!"
 */
export function template(
  strings: TemplateStringsArray,
  ...args: MaybeAccessor<any>[]
): Accessor<string> {
  return createMemo(() => {
    let result = "";
    for (let i = 0, a = 0; i < strings.length; i++) {
      result += strings[i];
      if (a < args.length) result += access(args[a++]);
    }
    return result;
  });
}
