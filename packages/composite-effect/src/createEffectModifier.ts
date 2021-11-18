import type {
  CallbackModifier,
  StopEffect,
  EffectArrayCallback,
  Modifier,
  ModifierReturn,
  EffectSignalCallback
} from "./types";
import type { Fn } from "./common";

/**
 * A utility for creating custom effect modifiers.
 *
 * @param callbackModifier function that is executed when your modifier gets attached to the `createCompositeEffect`. Here you get to modify the effect callback by attatching your logic to it.
 * @param requireStop Set to true `true` if you want to require the usage of inner `createRoot` to provide a `stop()` function for disposing of the effect permanently.
 *
 * *See [the implementation of official modifiers](https://github.com/davedbase/solid-primitives/blob/main/packages/composite-effect/src/modifiers.ts) for better reference*
 *
 */
export function createEffectModifier<
  Config extends {} | void,
  Returns extends {} = {},
  RequireStop extends boolean = false
>(
  modifier: (
    source: Fn<any> | Fn<any>[],
    callback: EffectArrayCallback<Fn<any>[], unknown> & EffectSignalCallback<Fn<any>, unknown>,
    config: Config,
    stop: RequireStop extends true ? StopEffect : undefined
  ) => [(input: any, prevInput: any, prevValue?: unknown) => void, Returns],
  requireStop?: RequireStop
): Modifier<Config, Returns> {
  return (a: any, b?: any, c?: any): ModifierReturn<any, any, Returns> => {
    const stopRequired = (requireStop as boolean) ?? false;
    let source: any,
      initialCallback: (a: any, b: any, c: any) => void,
      config: Config,
      modifyers: CallbackModifier<any, any, Object>[] = [];

    if (typeof b === "function") {
      // passed normal arguments
      source = a;
      initialCallback = b;
      config = c ?? {};
    } else {
      const returned = a as ModifierReturn<any, any, Object>;
      // passed nested filter
      source = returned.initialSource;
      initialCallback = returned.initialCallback;
      modifyers = returned.modifyers;
      config = b ?? {};
    }

    const filterModifier: CallbackModifier<any, any, Returns> = (callback, stop) =>
      modifier(source, callback, config, stop as any);
    modifyers.push(filterModifier);

    return {
      stopRequired,
      initialCallback,
      initialSource: source,
      modifyers: modifyers as any
    };
  };
}
