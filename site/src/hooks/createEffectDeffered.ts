import { Accessor, AccessorArray, createEffect, on } from "solid-js";

/**
 *
 * createEffect but is deffered, doesn't run function on mount
 */
function createEffectDeffered<S, U>(
  deps: Accessor<S> | AccessorArray<S>,
  fn: (input: S, prevInput: S | undefined, prevValue: U | undefined) => U,
) {
  // @ts-ignore
  createEffect(on(deps, fn, { defer: true }));
}

export default createEffectDeffered;
