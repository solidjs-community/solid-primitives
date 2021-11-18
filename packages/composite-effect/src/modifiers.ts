import { createEffectModifier } from "./createEffectModifier";
import _debounce from "@solid-primitives/debounce";
import _throttle from "@solid-primitives/throttle";
import { type Accessor, createMemo, createSignal, onCleanup, type Setter } from "solid-js";
import { access, type Fn, type MaybeAccessor } from "./common";
import type { StopEffect } from "./types";

/**
 * returns `{ stop: StopEffect }`, that can be used to manually dispose of the effects.
 * 
 * @example
 * ```ts
 * const { stop } = createCompositeEffect(stoppable(source, () => {}));
 * ```
 */
export const stoppable = createEffectModifier<void, { stop: StopEffect }, true>(
  (s, callback, o, stop) => [callback, { stop }],
  true
);

/**
 * disposes itself on the first captured change. **Set the defer option to true**, otherwise the callback will run and dispose itself on the initial setup.
 * 
 * @example
 * ```ts
 * createCompositeEffect(once(source, () => {}),{ defer: true });
 * ```
 */
export const once = createEffectModifier<void, {}, true>(
  (s, callback, o, stop) => [
    (...a) => {
      stop();
      callback(...a);
    },
    {}
  ],
  true
);

/**
 * Specify the number of times it can triggered, until disposes itself.
 * 
 * @example
 * ```ts
const { count } = createCompositeEffect(atMost(source, () => {}, { limit: 8 }));
```
 */
export const atMost = createEffectModifier<
  { limit: MaybeAccessor<number> },
  { count: Accessor<number> },
  true
>((s, callback, config, stop) => {
  const [count, setCount] = createSignal(0);
  const _fn = (...a: [any, any, any]) => {
    setCount(p => p + 1);
    count() + 1 >= access(config.limit) && stop();
    callback(...a);
  };
  return [_fn, { count }];
}, true);


/**
 * debounces callback by specified time
 * 
 * @example
 * ```ts
 * createCompositeEffect(debounce(source, () => {}, { wait: 300 }));
 * ```
 */
export const debounce = createEffectModifier<{
  wait: number;
}>((s, fn, options) => {
  const [_fn, clear] = _debounce(fn, options.wait);
  onCleanup(clear);
  return [_fn, {}];
});

/**
 * throttles callback by specified time
 * 
 * @example
 * ```ts
 * createCompositeEffect(throttle(source, () => {}, { wait: 300 }));
 * ```
 */
export const throttle = createEffectModifier<{
  wait: number;
}>((s, fn, options) => {
  const [_fn, clear] = _throttle(fn, options.wait);
  onCleanup(clear);
  return [_fn, {}];
});

/**
 * Runs callback only when the source is truthy.
 * 
 * @example
 * ```ts
 * createCompositeEffect(whenever(() => count() > 5, () => {}));
 * ```
 */
export const whenever = createEffectModifier<void>((source, fn) => {
  const isArray = Array.isArray(source);
  const isTrue = createMemo(() => (isArray ? source.every(a => !!a()) : !!source()));
  const _fn = (...a: [any, any, any]) => isTrue() && fn(...a);
  return [_fn, {}];
});


/**
 * Manually controll if the callback gets to be executed.
 * 
 * @example
 * ```ts
 * const { pause, resume, toggle } = createCompositeEffect(
 *   pausable(source, () => {}, { active: false })
 * );
 * ```
 */
export const pausable = createEffectModifier<
  { active?: boolean } | void,
  {
    pause: Fn;
    resume: Fn;
    toggle: (v?: boolean | ((prev: boolean) => boolean)) => boolean;
  }
>((s, fn, options) => {
  const [active, toggle] = createSignal(options?.active ?? true);
  return [
    (...a: [any, any, any]) => active() && fn(...a),
    {
      pause: () => toggle(false),
      resume: () => toggle(true),
      toggle: v => {
        if (typeof v !== 'undefined') toggle(v);
        else toggle(p => !p);
        return active();
      }
    }
  ];
});

/**
 * Let's you ignore changes for them to not cause the next effect to run.
 * 
 * @returns `ignoreNext` - ignores the next effect
 * @returns `ignoring` - ignores the updates made inside
 * 
 * @example
 * ```ts
 * const { ignoreNext, ignoring } = createCompositeEffect(
 *   ignorable(source, () => {})
 * );
 * ```
 * 
 * *See [the readme](https://github.com/davedbase/solid-primitives/blob/main/packages/composite-effect#ignorable) for better usage examples*
 */
export const ignorable = createEffectModifier<
  void,
  {
    ignoreNext: () => void | Setter<boolean>;
    ignoring: (updater: Fn) => void;
  }
>((s, fn) => {
  const [ignore, setIgnore] = createSignal(false);
  let usesIgnoring = false
  const _fn = (...a: [any, any, any]) => {
    if (usesIgnoring) return
    ignore() ? setIgnore(false) : fn(...a)
  };
  const ignoreNext = (a?: Parameters<Setter<boolean>>[0]) => {
    typeof a === "undefined" ? setIgnore(true) : setIgnore(a);
  };
  const ignoring = (updater: Fn) => {
    usesIgnoring = true
    updater();
    usesIgnoring = false
  };
  return [_fn, { ignoreNext, ignoring }];
});
