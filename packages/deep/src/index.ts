import { Accessor, EffectFunction, NoInfer, OnEffectFunction, untrack } from "solid-js";

/**
 * createDeep - make a deep watch on the given object
 * ```typescript
 * export function deep<S, U>(
 *   dep: Accessor<S>,
 *   fn: (input: S, prevInput: S | undefined, prevValue: U | undefined) => U,
 * ): (prevValue: U | undefined) => U;
 * ```
 * @param dep reactive dependency
 * @param fn computation on input; the current previous content(s) of input and the previous value are given as arguments and it returns a new value
 * @returns an effect function that is passed into createEffect. For example:
 *
 * ```typescript
 * createEffect(
 *     createDeep(
 *         () => store,
 *         () => { ... }
 *     )
 * );
 * ```
 */
export function createDeep<S, Next extends Prev, Prev = Next>(
  dep: Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
): EffectFunction<undefined | NoInfer<Next>, NoInfer<Next>>;
export function createDeep<S, Next extends Prev, Prev = Next>(
  dep: Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
): EffectFunction<undefined | NoInfer<Next>> {
  let prevInput: S;
  return prevValue => {
    const input: S = deepTraverse(dep());

    const result = untrack(() => fn(input, prevInput, prevValue));
    prevInput = input;
    return result;
  };
}

/**
 * deepTraverse - traverse an object
 * @param obj an object to traverse
 * @returns an object with all values traversed
 * @private
 * */
function deepTraverse<S>(value: S): S {
  if (typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      deepTraverse(value[i]);
    }
  } else if (typeof value === "object" && value !== null) {
    for (const key in value) {
      deepTraverse(value[key]);
    }
  }
  return value;
}
