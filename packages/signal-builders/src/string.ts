import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

export const lowercase = (string: Accessor<string>) => createMemo(() => string().toLowerCase());
export const uppercase = (string: Accessor<string>) => createMemo(() => string().toUpperCase());
export const capitalize = (string: Accessor<string>) =>
  createMemo(() => { const s = string(); return s[0]!.toUpperCase() + s.substring(1).toLowerCase(); });

/**
 * `String.prototype.substring()`
 * @param end Exclusive upper bound; omit to extend through the end of the string.
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
