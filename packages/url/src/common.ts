/** A value to write, or a function deriving it from the previous value. */
export type SetterValue<Prev, Next = Prev> =
  Next extends Function ? (prev: Prev) => Next : Next | ((prev: Prev) => Next);
