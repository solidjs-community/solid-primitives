/** A value to write, or a function deriving it from the previous value. */
export type SetterValue<Prev, Next = Prev> = Next | ((prev: Prev) => Next);
