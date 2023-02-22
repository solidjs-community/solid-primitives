import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, on } from "solid-js";

/**
 * Signal builder: `String.prototype.toLowerCase()`
 */
export const lowercase = (string: Accessor<string>) => createMemo(() => string().toLowerCase());
/**
 * Signal builder: `String.prototype.toUpperCase()`
 */
export const uppercase = (string: Accessor<string>) => createMemo(() => string().toUpperCase());
/**
 * Signal builder: capitalize a string input
 */
export const capitalize = (string: Accessor<string>) =>
  createMemo(on(string, s => s[0]!.toUpperCase() + s.substring(1).toLowerCase()));
/**
 * Signal builder: `String.prototype.substring()`
 * @param start The zero-based index number indicating the beginning of the substring.
 * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end. If end is omitted, the characters from start through the end of the original string are returned.
 */
export const substring = (
  string: MaybeAccessor<string>,
  start: MaybeAccessor<number>,
  end?: MaybeAccessor<number>
) => createMemo(() => access(string).substring(access(start), access(end)));

// a string primitive harvested from @lxsmnsyc's solid-use:
/**
 * Signal builder: Create reactive string templates
 * @example
 * const [greeting, setGreeting] = createSignal('Hello');
 * const [target, setTarget] = createSignal('Solid');
 * const message = template`${greeting}, ${target}!`;
 * message() // => Hello, Solid!
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
