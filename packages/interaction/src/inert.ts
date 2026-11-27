import { createEffect, onCleanup } from "solid-js";
import {
  type MaybeAccessor,
  access,
  globalRegistry,
  isServer,
  noop,
} from "@solid-primitives/utils";

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
type Hold = {
  aria: boolean;
  inert: boolean;
  /** aria-hidden is wanted but postponed because the node contains the focused element. */
  pendingAria: boolean;
};
type Layer = {
  targets: HTMLElement[];
  /** Elements the layer keeps exposed besides its targets; lower layers must not hide them either. */
  ignore: Element[];
  sweep: (force?: boolean) => void;
};

type InertRegistry = {
  /** Shared per-node ref counts: the reason stacked layers can close in any order. */
  states: WeakMap<Element, NodeState>;
  /** Open layers in the order they opened, lowest first. Upper layers' targets are protected from lower layers. */
  layers: Layer[];
};

// Lives on `globalThis` (not in module-scope bindings) so it stays correct when the app's dependency
// graph ends up with more than one copy of this package: module-scope state would be split across the
// copies, and one copy's cleanup could then restore attributes another copy still needs.
const getRegistry = (): InertRegistry =>
  globalRegistry<InertRegistry>("@solid-primitives/interaction:inert", () => ({
    states: new WeakMap(),
    layers: [],
  }));

function toList<T extends Element>(
  value: T | readonly (T | null | undefined)[] | null | undefined,
): T[] {
  if (value == null) return [];
  const list = Array.isArray(value) ? (value as readonly (T | null | undefined)[]) : [value as T];
  return list.filter((el): el is T => el != null);
}

/** True when `el` contains the focused element, looking through open shadow roots. */
function containsFocus(el: Element): boolean {
  let active: Element | null = el.ownerDocument.activeElement;
  while (active) {
    if (el.contains(active)) return true;
    active = active.shadowRoot?.activeElement ?? null;
  }
  return false;
}

function getState(el: Element): NodeState {
  const { states } = getRegistry();
  let state = states.get(el);
  if (!state) {
    state = { ariaCount: 0, ariaPrev: null, inertCount: 0, inertPrev: null };
    states.set(el, state);
  }
  return state;
}

/**
 * Takes the aria-hidden part of a hold. Chrome refuses `aria-hidden` on an ancestor of the focused
 * element (the attribute is set but the accessibility tree keeps exposing the node), so in that case
 * the hold stays `pendingAria` and is retried once focus has left the node.
 */
function acquireAria(el: Element, hold: Hold): void {
  const state = getState(el);
  hold.pendingAria = false;
  if (state.ariaCount > 0) {
    state.ariaCount++;
    hold.aria = true;
  } else if (el.getAttribute("aria-hidden") !== "true") {
    // an element that was already aria-hidden by someone else is left alone
    if (containsFocus(el)) {
      hold.pendingAria = true;
      return;
    }
    state.ariaPrev = el.getAttribute("aria-hidden");
    el.setAttribute("aria-hidden", "true");
    state.ariaCount = 1;
    hold.aria = true;
  }
}

function acquire(el: Element, strategy: InertStrategy): Hold | undefined {
  const hold: Hold = { aria: false, inert: false, pendingAria: false };
  if (strategy !== "aria-hidden") {
    const state = getState(el);
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
  if (strategy !== "inert") acquireAria(el, hold);
  return hold.aria || hold.inert || hold.pendingAria ? hold : undefined;
}

function release(el: Element, hold: Hold): void {
  const { states } = getRegistry();
  const state = states.get(el);
  if (!state) {
    hold.pendingAria = false;
    return;
  }
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
  hold.pendingAria = false;
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
  return openLayer(own, toList(options.ignore), options).close;
}

type LayerHandle = {
  /** Replace the targets / ignore list in place (the layer keeps its stack position) and re-sweep. */
  update: (targets: HTMLElement[], ignore: Element[]) => void;
  close: VoidFunction;
};

function openLayer(
  initialTargets: HTMLElement[],
  initialIgnore: Element[],
  options: { strategy?: InertStrategy; root?: Element },
): LayerHandle {
  const { layers } = getRegistry();
  let own = initialTargets;
  let ignore = initialIgnore;

  const strategy = options.strategy ?? "aria-hidden";
  const explicitRoot = options.root;
  // without an explicit root it follows the first target (which may move to another document)
  let root = explicitRoot ?? own[0]!.ownerDocument.body;
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

  // Watches the hidden branches (aria-hidden strategy only) for live regions added later. childList only,
  // so our own attribute writes never retrigger it, and only a live-region node causes a re-sweep.
  const deepObserver = new MutationObserver(records => {
    if (disposed) return;
    const found = records.some(record =>
      Array.from(record.addedNodes).some(
        node =>
          node.nodeType === 1 &&
          ((node as Element).matches(LIVE_SELECTOR) ||
            (node as Element).querySelector(LIVE_SELECTOR) !== null),
      ),
    );
    if (found) layer.sweep();
  });

  // Hold on to aria-hidden for nodes that contain focus until focus leaves them (see acquireAria).
  let focusDoc: Document | undefined;
  let focusTimer: ReturnType<typeof setTimeout> | undefined;
  const retryPending = () => {
    if (disposed) return;
    let changed = false;
    for (const [el, hold] of held)
      if (hold.pendingAria && !containsFocus(el)) {
        acquireAria(el, hold);
        changed = true;
      }
    if (changed) syncFocusListeners();
  };
  const onFocusIn = () => retryPending();
  // during focusout the next focus target is not known yet, so look again afterwards
  const onFocusOut = () => {
    clearTimeout(focusTimer);
    focusTimer = setTimeout(retryPending, 0);
  };
  const syncFocusListeners = () => {
    const needed = Array.from(held.values()).some(h => h.pendingAria);
    const doc = root.ownerDocument;
    if (focusDoc && (!needed || focusDoc !== doc)) {
      focusDoc.removeEventListener("focusin", onFocusIn, true);
      focusDoc.removeEventListener("focusout", onFocusOut, true);
      clearTimeout(focusTimer);
      focusDoc = undefined;
    }
    if (needed && !focusDoc) {
      focusDoc = doc;
      doc.addEventListener("focusin", onFocusIn, true);
      doc.addEventListener("focusout", onFocusOut, true);
    }
  };

  const layer: Layer = {
    get targets() {
      return own;
    },
    get ignore() {
      return ignore;
    },
    sweep(force) {
      if (disposed) return;
      // Every target was removed from the document while the layer is open: keep what is held until the
      // layer is updated or closed (a modal unmounting a moment before its owner cleans up must not flash
      // the page to assistive technology) instead of releasing the whole page.
      if (!force && held.size > 0 && own.every(t => !t.isConnected)) return;
      // protected = own targets + ignore + live regions + targets of layers opened above this one
      const protectedEls: Element[] = [...own, ...ignore];
      // Live regions stay exposed only for aria-hidden (announcements still reach AT). With `inert` they
      // would stay interactive behind the modal, so they are hidden like everything else. A live region
      // that contains a lower layer's targets is never protected, so lower layers are always hidden.
      const index = layers.indexOf(layer);
      if (strategy === "aria-hidden") {
        const lower = layers.slice(0, index).flatMap(l => l.targets);
        for (const live of root.querySelectorAll(LIVE_SELECTOR))
          if (!lower.some(t => live.contains(t))) protectedEls.push(live);
      }
      for (let i = index + 1; i < layers.length; i++)
        protectedEls.push(...layers[i]!.targets, ...layers[i]!.ignore);
      const inRoot = protectedEls.filter(el => root.contains(el));

      const parents = new Set<Element>();
      const desired = new Set<Element>();
      // every protected element (targets included) needs its ancestors walked, up to and including `root`.
      // An element that is `root` itself has nothing above it to walk.
      for (const el of inRoot) {
        if (el === root) continue;
        for (let p = el.parentElement; p; p = p.parentElement) {
          parents.add(p);
          if (p === root) break;
        }
      }
      for (const parent of parents)
        for (const child of Array.from(parent.children)) {
          if (SKIPPED_TAGS.has(child.tagName)) continue;
          // skip anything that contains a protected element or lives inside one
          if (inRoot.some(p => child.contains(p) || p.contains(child))) continue;
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
      deepObserver.disconnect();
      if (strategy === "aria-hidden")
        for (const el of held.keys()) deepObserver.observe(el, { childList: true, subtree: true });
      syncFocusListeners();
    },
  };

  // the stack is the order in which layers open; update() keeps the position, a re-open goes on top
  layers.push(layer);
  for (const l of [...layers]) l.sweep();

  return {
    update(nextTargets, nextIgnore) {
      if (disposed) return;
      own = nextTargets;
      ignore = nextIgnore;
      if (!explicitRoot) root = own[0]!.ownerDocument.body;
      for (const l of [...layers]) l.sweep(l === layer);
    },
    close() {
      if (disposed) return;
      observer.disconnect();
      deepObserver.disconnect();
      for (const [el, hold] of held) release(el, hold);
      held.clear();
      disposed = true;
      syncFocusListeners();
      const index = layers.indexOf(layer);
      if (index !== -1) layers.splice(index, 1);
      // layers below can now hide whatever this layer used to protect
      for (const l of [...layers]) l.sweep();
    },
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
  // The layer is updated in place while it stays open, so it keeps its stack position when its inputs
  // change. Disabling and enabling again is a new open and goes on top, like a real modal stack.
  let handle: LayerHandle | undefined;
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
      if (!state) {
        handle?.close();
        handle = undefined;
      } else if (handle) handle.update(state.list, state.ignore);
      else handle = openLayer(state.list, state.ignore, options);
    },
  );
  onCleanup(() => {
    handle?.close();
    handle = undefined;
  });
}
