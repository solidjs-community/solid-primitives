import { createModifier } from "./createModifier";
import _debounce from "@solid-primitives/debounce";
import _throttle from "@solid-primitives/throttle";
import { type Accessor, createMemo, createSignal, onCleanup, type Setter } from "solid-js";
import { access, type Fn, type MaybeAccessor } from "./common";
import type { EffectCallback, StopEffect } from "./types";

/**
 * returns `{ stop: StopEffect }`, that can be used to manually dispose of the effects.
 *
 * @example
 * ```ts
 * const { stop } = createCompositeEffect(stoppable(source, () => {}));
 * ```
 */
export const stoppable = createModifier<void, { stop: StopEffect }, true>(
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
export const once = createModifier<void, {}, true>(
  (s, callback, o, stop) => [
    (...a) => {
      stop();
      return callback(...a);
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
export const atMost = createModifier<
  { limit: MaybeAccessor<number> },
  { count: Accessor<number> },
  true
>((s, callback, config, stop) => {
  const [count, setCount] = createSignal(0);
  const _fn: EffectCallback<any, any> = (a: any, b: any, c: any) => {
    setCount(p => p + 1);
    count() + 1 >= access(config.limit) && stop();
    return callback(a, b, c);
  };
  return [_fn, { count }];
}, true);

/**
 * debounces callback by specified time
 *
 * @example
 * ```ts
 * createCompositeEffect(debounce(source, () => {}, 300));
 * ```
 */
export const debounce = createModifier<number>((s, fn, wait) => {
  const _fn = _debounce(fn, wait);
  onCleanup(_fn.clear);
  return [_fn, {}];
});

/**
 * throttles callback by specified time
 *
 * @example
 * ```ts
 * createCompositeEffect(throttle(source, () => {}, 300));
 * ```
 */
export const throttle = createModifier<number>((s, fn, wait) => {
  const [_fn, clear] = _throttle(fn, wait);
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
export const whenever = createModifier<void>((source, fn) => {
  const isArray = Array.isArray(source);
  const isTrue = createMemo(() => (isArray ? source.every(a => !!a()) : !!source()));
  return [(a, b, c) => (isTrue() ? fn(a, b, c) : c), {}];
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
export const pausable = createModifier<
  { active?: boolean } | void,
  {
    pause: Fn;
    resume: Fn;
    toggle: (v?: boolean | ((prev: boolean) => boolean)) => boolean;
  }
>((s, fn, options) => {
  const [active, toggle] = createSignal(options.active ?? true);
  return [
    (a, b, c) => (active() ? fn(a, b, c) : c),
    {
      pause: () => toggle(false),
      resume: () => toggle(true),
      toggle: v => {
        if (typeof v !== "undefined") toggle(v);
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
 * const { ignoreNext, ignore } = createCompositeEffect(
 *   ignorable(source, () => {})
 * );
 * ```
 *
 * *See [the readme](https://github.com/solidjs-community/solid-primitives/blob/main/packages/composite#ignorable) for better usage examples*
 */
export const ignorable = createModifier<
  void,
  {
    ignoreNext: () => void | Setter<number>;
    ignore: (updater: Fn) => void;
  }
>((s, fn) => {
  const [ignoringNext, setIgnoringNext] = createSignal(0);
  let ignoring = false;
  const _fn: EffectCallback<any, any> = (a: any, b: any, c: any) => {
    if (ignoring) return c;
    if (ignoringNext() > 0) {
      setIgnoringNext(p => p - 1);
      return c;
    }
    return fn(a, b, c);
  };
  const ignoreNext = (a?: Parameters<Setter<number>>[0]) => {
    typeof a === "undefined" ? setIgnoringNext(1) : setIgnoringNext(a);
  };
  const ignore = (updater: Fn) => {
    ignoring = true;
    updater();
    ignoring = false;
  };
  return [_fn, { ignoreNext, ignore }];
});
