import { type Accessor, createEffect, createMemo, createSignal, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, type MaybeAccessor } from "@solid-primitives/utils";
import { computePosition } from "./compute.ts";
import { type AutoUpdateOptions, makeAutoUpdate } from "./autoUpdate.ts";
import type {
  ArrowOptions,
  Boundary,
  ComputePositionOptions,
  ComputePositionResult,
  FlipOptions,
  MiddlewareData,
  OffsetOptions,
  Placement,
  ReferenceElement,
  RootBoundary,
  ShiftOptions,
  SizeOptions,
  Strategy,
} from "./types.ts";

export type FloatingStyles = {
  position: Strategy;
  top: string;
  left: string;
  transform?: string;
};

export type CreateFloatingOptions = {
  reference: MaybeAccessor<ReferenceElement | null | undefined>;
  floating: MaybeAccessor<HTMLElement | null | undefined>;
  /** Default `"bottom"`. */
  placement?: MaybeAccessor<Placement | undefined>;
  /** Default `"absolute"`. */
  strategy?: MaybeAccessor<Strategy | undefined>;
  rtl?: MaybeAccessor<boolean | undefined>;
  offset?: MaybeAccessor<OffsetOptions | undefined>;
  flip?: MaybeAccessor<boolean | FlipOptions | undefined>;
  shift?: MaybeAccessor<boolean | ShiftOptions | undefined>;
  size?: MaybeAccessor<SizeOptions | undefined>;
  arrow?: MaybeAccessor<
    { element: MaybeAccessor<Element | null | undefined>; padding?: number } | undefined
  >;
  boundary?: MaybeAccessor<Boundary | undefined>;
  rootBoundary?: MaybeAccessor<RootBoundary | undefined>;
  /**
   * Position with `transform: translate()` (default) instead of `top` / `left`.
   */
  transform?: MaybeAccessor<boolean | undefined>;
  /**
   * Runs while both elements exist, e.g. `makeAutoUpdate`. Receives `update`; returns a cleanup.
   * Takes precedence over `autoUpdate`.
   */
  whileElementsMounted?: (
    reference: ReferenceElement,
    floating: HTMLElement,
    update: () => void,
  ) => VoidFunction | void;
  /** Shorthand for `whileElementsMounted: makeAutoUpdate` with these options. */
  autoUpdate?: MaybeAccessor<boolean | AutoUpdateOptions | undefined>;
};

export type FloatingReturn = {
  x: Accessor<number>;
  y: Accessor<number>;
  /** The placement actually used; differs from the requested one after a flip. */
  placement: Accessor<Placement>;
  strategy: Accessor<Strategy>;
  middlewareData: Accessor<MiddlewareData | undefined>;
  /** `false` until the first position has been computed on the client. */
  isPositioned: Accessor<boolean>;
  /** Inline styles for the floating element. */
  styles: Accessor<FloatingStyles>;
  /** Recompute now. Safe to call from event handlers; does nothing without both elements. */
  update: () => void;
};

type Config = {
  reference: ReferenceElement | null | undefined;
  floating: HTMLElement | null | undefined;
  options: ComputePositionOptions;
  transform: boolean;
};

function sameResult(a: ComputePositionResult | undefined, b: ComputePositionResult | undefined) {
  if (!a || !b) return a === b;
  const am = a.middlewareData;
  const bm = b.middlewareData;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.placement === b.placement &&
    a.strategy === b.strategy &&
    am.flipped === bm.flipped &&
    am.shifted === bm.shifted &&
    am.availableWidth === bm.availableWidth &&
    am.availableHeight === bm.availableHeight &&
    am.transformOrigin === bm.transformOrigin &&
    am.arrow?.x === bm.arrow?.x &&
    am.arrow?.y === bm.arrow?.y &&
    am.arrow?.centerOffset === bm.arrow?.centerOffset
  );
}

/**
 * Reactive floating-element positioning. Recomputes whenever the elements or any option
 * changes. SSR-safe: the server renders the unpositioned styles and never measures.
 */
export function createFloating(options: CreateFloatingOptions): FloatingReturn {
  const readConfig = (): Config => {
    const arrow = access(options.arrow);
    return {
      reference: access(options.reference),
      floating: access(options.floating),
      transform: access(options.transform) ?? true,
      options: {
        placement: access(options.placement),
        strategy: access(options.strategy),
        rtl: access(options.rtl),
        offset: access(options.offset),
        flip: access(options.flip),
        shift: access(options.shift),
        size: access(options.size),
        boundary: access(options.boundary),
        rootBoundary: access(options.rootBoundary),
        arrow:
          arrow &&
          ({
            element: access(arrow.element),
            padding: arrow.padding,
          } satisfies ArrowOptions),
      },
    };
  };

  const config = createMemo(readConfig);
  const [result, setResult] = createSignal<ComputePositionResult | undefined>(undefined, {
    ...INTERNAL_OPTIONS,
    equals: sameResult,
  });

  // The latest config the first effect has seen; lets `update` run from untracked contexts.
  let current: Config | undefined;

  const run = (cfg: Config) => {
    if (isServer || !cfg.reference || !cfg.floating) return;
    setResult(computePosition(cfg.reference, cfg.floating, cfg.options));
  };
  const update = () => run(current ?? untrack(config));

  createEffect(config, cfg => {
    current = cfg;
    run(cfg);
  });

  createEffect(
    () =>
      [access(options.reference), access(options.floating), access(options.autoUpdate)] as const,
    ([reference, floating, auto]) => {
      if (!reference || !floating) return;
      if (options.whileElementsMounted) {
        return options.whileElementsMounted(reference, floating, update) || undefined;
      }
      if (auto) {
        return makeAutoUpdate(reference, floating, update, auto === true ? {} : auto);
      }
    },
  );

  const strategy = createMemo(() => access(options.strategy) ?? "absolute");
  const x = createMemo(() => result()?.x ?? 0);
  const y = createMemo(() => result()?.y ?? 0);
  const placement = createMemo(() => result()?.placement ?? access(options.placement) ?? "bottom");

  const styles = createMemo<FloatingStyles>(() => {
    const position = strategy();
    if (!result()) return { position, top: "0", left: "0" };
    const dpr = (!isServer && globalThis.devicePixelRatio) || 1;
    const round = (v: number) => Math.round(v * dpr) / dpr;
    if (access(options.transform) ?? true) {
      return {
        position,
        top: "0",
        left: "0",
        transform: `translate(${round(x())}px, ${round(y())}px)`,
      };
    }
    return { position, top: `${round(y())}px`, left: `${round(x())}px` };
  });

  return {
    x,
    y,
    placement,
    strategy,
    middlewareData: () => result()?.middlewareData,
    isPositioned: () => result() !== undefined,
    styles,
    update,
  };
}
