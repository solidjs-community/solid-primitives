import type {
   FilterFnModifier,
   StopEffect,
   EffectArrayCallback,
   Filter,
   FilterReturn,
   EffectSignalCallback,
} from './types'
import type { Fn } from './common'

export function createEffectModifier<
   Config extends {} | void,
   Returns extends {} = {},
   RequireStop extends boolean = false,
>(
   modifier: (
      source: Fn<any> | Fn<any>[],
      callback: EffectArrayCallback<Fn<any>[], unknown> & EffectSignalCallback<Fn<any>, unknown>,
      config: Config,
      stop: RequireStop extends true ? StopEffect : undefined,
   ) => [(input: any, prevInput: any, prevValue?: unknown) => void, Returns],
   requireStop?: RequireStop,
): Filter<Config, Returns> {
   return (a: any, b?: any, c?: any): FilterReturn<any, any, Returns> => {
      const stopRequired = (requireStop as boolean) ?? false
      let source: any,
         initialCallback: (a: any, b: any, c: any) => void,
         config: Config,
         modifyers: FilterFnModifier<any, any, Object>[] = []

      if (typeof b === 'function') {
         // passed normal arguments
         source = a
         initialCallback = b
         config = c ?? {}
      } else {
         const returned = a as FilterReturn<any, any, Object>
         // passed nested filter
         source = returned.initialSource
         initialCallback = returned.initialCallback
         modifyers = returned.modifyers
         config = b ?? {}
      }

      const filterModifier: FilterFnModifier<any, any, Returns> = (callback, stop) =>
         modifier(source, callback, config, stop as any)
      modifyers.push(filterModifier)

      return {
         stopRequired,
         initialCallback,
         initialSource: source,
         modifyers: modifyers as any,
      }
   }
}
