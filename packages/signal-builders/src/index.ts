import { AnyObject, keys } from "@solid-primitives/utils";
import { Accessor } from "solid-js";

// CONVERT
export * from "./convert";

// STRING

export * from "./string";

// NUMBER
export * from "./number";

// ARRAY
export * from "./array";

// OBJECT
export * from "./object";
export * from "./update";

// SPECIAL
export type Spread<T extends [] | any[] | AnyObject> = {
  [I in keyof T]: Accessor<T[I]>;
};
/**
 * Turn your signal into a tuple of signals, or map of signals. **(input needs to have static keys)**
 * @example // spread tuples
 * const [first, second, third] = spread(() => [1,2,3])
 * first() // => 1
 * second() // => 2
 * third() // => 3
 * @example // spread objects
 * const { name, age } = spread(() => ({ name: "John", age: 36 }))
 * name() // => "John"
 * age() // => 36
 */
export function spread<T extends [] | any[] | AnyObject>(obj: Accessor<T>): Spread<T> {
  const res: Spread<T> = obj().constructor();
  for (const key of keys(obj)) {
    res[key] = () => obj()[key];
  }
  return res;
}
