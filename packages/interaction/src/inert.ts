import { createEffect } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, noop, type MaybeAccessor } from "@solid-primitives/utils";

/** How outside nodes are hidden. */
export type InertStrategy = "aria-hidden" | "inert" | "both";

/** One element, a list of elements, or nothing. */
export type InertTargets = HTMLElement | readonly HTMLElement[] | null | undefined;

export type InertOthersOptions = {
  /**
   * Which attribute(s) to apply to outside nodes.
   * @default "aria-hidden"
   */
  strategy?: InertStrategy;
  /**
   * Elements (and their subtrees) that must stay exposed in addition to the targets,
   * for example a toast region rendered outside the modal.
   */
  ignore?: Element | readonly (Element | null | undefined)[] | null;
  /**
   * Element whose subtree is walked. Everything outside the targets but inside this root is hidden.
   * @default the `body` of the first target's document
   */
  root?: Element;
};

export type CreateInertOthersOptions = Omit<InertOthersOptions, "ignore"> & {
  /** Reactive version of `ignore`. */
  ignore?: MaybeAccessor<Element | readonly (Element | null | undefined)[] | null | undefined>;
};

const LIVE_SELECTOR =
  '[aria-live]:not([aria-live="off"]),[role="alert"],[role="status"],[role="log"]';
const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "LINK", "META"]);

type NodeState = {
  ariaCount: number;
  ariaPrev: string | null;
  inertCount: number;
  inertPrev: string | null;
};
type Hold = { aria: boolean; inert: boolean };
type Layer = {
  targets: HTMLElement[];
  sweep: () => void;
};

/** Shared per-node ref counts: the reason stacked layers can close in any order. */
const states = new WeakMap<Element, NodeState>();
/** Open layers, lowest first. Upper layers' targets are protected from lower layers. */
const layers: Layer[] = [];

function toList<T extends Element>(
  value: T | readonly (T | null | undefined)[] | null | undefined,
): T[] {
  if (value == null) return [];
  const list = Array.isArray(value) ? (value as readonly (T | null | undefined)[]) : [value as T];
  return list.filter((el): el is T => el != null);
}

function acquire(el: Element, strategy: InertStrategy): Hold | undefined {
  let state = states.get(el);
  if (!state) {
    state = { ariaCount: 0, ariaPrev: null, inertCount: 0, inertPrev: null };
    states.set(el, state);
  }
  const hold: Hold = { aria: false, inert: false };
  if (strategy !== "inert") {
    if (state.ariaCount > 0) {
      state.ariaCount++;
      hold.aria = true;
    } else if (el.getAttribute("aria-hidden") !== "true") {
      // an element that was already aria-hidden by someone else is left alone
      state.ariaPrev = el.getAttribute("aria-hidden");
      el.setAttribute("aria-hidden", "true");
      state.ariaCount = 1;
      hold.aria = true;
    }
  }
  if (strategy !== "aria-hidden") {
    if (state.inertCount > 0) {
      state.inertCount++;
      hold.inert = true;
    } else if (!el.hasAttribute("inert")) {
      state.inertPrev = el.getAttribute("inert");
      el.setAttribute("inert", "");
      state.inertCount = 1;
      hold.inert = true;
    }
  }
  return hold.aria || hold.inert ? hold : undefined;
}

function release(el: Element, hold: Hold): void {
  const state = states.get(el);
  if (!state) return;
  if (hold.aria && state.ariaCount > 0 && --state.ariaCount === 0) {
    if (state.ariaPrev === null) el.removeAttribute("aria-hidden");
    else el.setAttribute("aria-hidden", state.ariaPrev);
    state.ariaPrev = null;
  }
  if (hold.inert && state.inertCount > 0 && --state.inertCount === 0) {
    if (state.inertPrev === null) el.removeAttribute("inert");
    else el.setAttribute("inert", state.inertPrev);
    state.inertPrev = null;
  }
  if (state.ariaCount === 0 && state.inertCount === 0) states.delete(el);
}

/**
 * Marks every subtree outside of the target element(s) as `aria-hidden="true"` and/or `inert`, so that
 * assistive technology and user interaction are confined to a modal layer.
 *
 * - Walks from each target up to the root and hides every sibling subtree that does not contain a target.
 * - Skips `options.ignore` elements, live regions, and nodes that were already `aria-hidden="true"` / `inert`.
 * - Restores each node's previous attribute value on cleanup.
 * - Layers are ref-counted per node: closing an upper layer never unhides nodes a lower layer still hides, in any close order.
 * - Nodes added later are hidden too (`MutationObserver`, disconnected on cleanup).
 *
 * @param targets the element(s) that stay accessible
 * @param options see {@link InertOthersOptions}
 * @returns a cleanup function that restores the DOM. Safe to call more than once.
 *
 * @example
 * ```ts
 * const cleanup = makeInertOthers(dialogEl);
 * // later
 * cleanup();
 * ```
 */
export function makeInertOthers(
  targets: InertTargets,
  options: InertOthersOptions = {},
): VoidFunction {
  if (isServer) return noop;
  const own = toList(targets);
  if (own.length === 0) return noop;

  const strategy = options.strategy ?? "aria-hidden";
  const root = options.root ?? own[0]!.ownerDocument.body;
  const held = new Map<Element, Hold>();
  let disposed = false;

  const observer = new MutationObserver(records => {
    if (disposed) return;
    for (const record of records)
      record.removedNodes.forEach(node => {
        const hold = held.get(node as Element);
        if (hold && !(node as Element).isConnected) {
          release(node as Element, hold);
          held.delete(node as Element);
        }
      });
    layer.sweep();
  });

  const layer: Layer = {
    targets: own,
    sweep() {
      if (disposed) return;
      // protected = own targets + ignore + live regions + targets of layers opened above this one
      const protectedEls: Element[] = [...own, ...toList(options.ignore)];
      // Live regions stay exposed only for aria-hidden (announcements still reach AT). With `inert` they
      // would stay interactive behind the modal, so they are hidden like everything else. A live region
      // that contains a lower layer's targets is never protected, so lower layers are always hidden.
      if (strategy === "aria-hidden") {
        const lower = layers.slice(0, layers.indexOf(layer)).flatMap(l => l.targets);
        for (const live of root.querySelectorAll(LIVE_SELECTOR))
          if (!lower.some(t => live.contains(t))) protectedEls.push(live);
      }
      for (let i = layers.indexOf(layer) + 1; i < layers.length; i++)
        protectedEls.push(...layers[i]!.targets);
      const inRoot = protectedEls.filter(el => root.contains(el));

      const parents = new Set<Element>();
      const desired = new Set<Element>();
      for (const el of own) {
        if (!root.contains(el)) continue;
        for (let p = el.parentElement; p; p = p.parentElement) {
          parents.add(p);
          if (p === root) break;
        }
      }
      // protected elements other than targets also need their own ancestors walked
      for (const el of inRoot)
        for (let p = el.parentElement; p; p = p.parentElement) {
          parents.add(p);
          if (p === root) break;
        }
      for (const parent of parents)
        for (const child of Array.from(parent.children)) {
          if (SKIPPED_TAGS.has(child.tagName)) continue;
          if (inRoot.some(p => child.contains(p))) continue;
          desired.add(child);
        }

      for (const [el, hold] of held)
        if (!desired.has(el)) {
          release(el, hold);
          held.delete(el);
        }
      for (const el of desired)
        if (!held.has(el)) {
          const hold = acquire(el, strategy);
          if (hold) held.set(el, hold);
        }

      // childList changes on the walked parents catch late additions; re-observe because the chain can change
      observer.disconnect();
      for (const parent of parents) observer.observe(parent, { childList: true });
    },
  };

  layers.push(layer);
  for (const l of [...layers]) l.sweep();

  return () => {
    if (disposed) return;
    observer.disconnect();
    for (const [el, hold] of held) release(el, hold);
    held.clear();
    disposed = true;
    const index = layers.indexOf(layer);
    if (index !== -1) layers.splice(index, 1);
    // layers below can now hide whatever this layer used to protect
    for (const l of [...layers]) l.sweep();
  };
}

/**
 * Reactive {@link makeInertOthers}: hides everything outside the target(s) while `enabled` is true,
 * and restores it when disabled, when the targets change, or when the owner is disposed.
 *
 * @param targets element(s), or an accessor of them (for example a ref signal); `undefined`/`null` disables it
 * @param enabled toggle, defaults to `true`
 * @param options see {@link CreateInertOthersOptions}; `ignore` may be an accessor
 *
 * @example
 * ```tsx
 * const [dialog, setDialog] = createSignal<HTMLElement>();
 * createInertOthers(dialog, isOpen);
 * <div ref={setDialog} role="dialog" />
 * ```
 */
export function createInertOthers(
  targets: MaybeAccessor<InertTargets>,
  enabled: MaybeAccessor<boolean> = true,
  options: CreateInertOthersOptions = {},
): void {
  if (isServer) return;
  createEffect(
    () => {
      if (!access(enabled)) return undefined;
      const list = toList(
        access(targets) as HTMLElement | readonly HTMLElement[] | null | undefined,
      );
      if (list.length === 0) return undefined;
      return { list, ignore: toList(access(options.ignore)) };
    },
    state => {
      if (!state) return;
      return makeInertOthers(state.list, {
        strategy: options.strategy,
        root: options.root,
        ignore: state.ignore,
      });
    },
  );
}
