import type { Accessor } from "solid-js";
import type { MaybeAccessor } from "@solid-primitives/utils";
import { access } from "@solid-primitives/utils";
import { mapRange } from "./mapRange.js";

/**
 * Reactively generates an array of numbers for the given range.
 *
 * When called with one argument, generates `[0, 1, ..., to - 1]`.
 * When called with two or three arguments, generates `[start, start + step, ..., to - 1]`.
 *
 * Step direction is inferred from the relationship between `start` and `to` — a negative
 * `to` relative to `start` produces a descending range regardless of the sign of `step`.
 *
 * @param startOrTo start of the range, or — when `to` is omitted — the end (start defaults to 0)
 * @param to end of the range (not included)
 * @param step difference between consecutive values (defaults to 1)
 * @returns accessor returning the current number array
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#createnumericrange
 * @example
 * ```ts
 * const nums = createNumericRange(5);         // [0, 1, 2, 3, 4]
 * const nums = createNumericRange(2, 7);      // [2, 3, 4, 5, 6]
 * const nums = createNumericRange(0, 10, 2);  // [0, 2, 4, 6, 8]
 *
 * // reactive
 * const [to, setTo] = createSignal(5);
 * const nums = createNumericRange(to);        // updates when `to` changes
 *
 * // use with <For>
 * const nums = createNumericRange(count);
 * <For each={nums()}>{n => <div>{n}</div>}</For>
 * ```
 */
export function createNumericRange(
  startOrTo: MaybeAccessor<number>,
  to?: MaybeAccessor<number>,
  step: MaybeAccessor<number> = 1,
): Accessor<number[]> {
  const getStart = to !== undefined ? () => access(startOrTo) : () => 0;
  const getTo = to !== undefined ? () => access(to) : () => access(startOrTo);
  const getStep = () => access(step);
  return mapRange(getStart, getTo, getStep, n => n);
}
