import { createEffect, createMemo, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, noop, type MaybeAccessor } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";
import { makeInteractOutside } from "@solid-primitives/interaction";
import {
  getTopLayer,
  isInsideLayer,
  registerLayer,
  useLayerStack,
  type DismissableLayer,
  type DismissReason,
  type LayerRecord,
} from "./layer-stack.ts";

/** Which elements an outside press / focus should be ignored for. */
export type DismissableExclude = Element | readonly Element[] | ((element: Element) => boolean);

export interface DismissableLayerOptions {
  /** Called when the layer should close. The layer is not removed from the stack automatically. */
  onDismiss: (reason: DismissReason, event?: Event) => void;
  /**
   * Whether the layer may be dismissed. When `false`, a dismiss request calls
   * {@link DismissableLayerOptions.onDismissAttempt} instead of `onDismiss`. Default: `true`.
   */
  dismissible?: MaybeAccessor<boolean | undefined>;
  /**
   * Called when a dismiss was requested while `dismissible` is `false` — e.g. to shake the dialog.
   * Only the topmost layer is ever asked, so it fires once per request.
   */
  onDismissAttempt?: (reason: DismissReason, event?: Event) => void;
  /** Elements (or a predicate) whose presses / focus must not count as outside, e.g. the trigger. */
  exclude?: DismissableExclude;
  /**
   * A persistent layer stays registered (so content inside it is never "outside" its parents) but
   * is never auto-dismissed and does not take over Escape / outside presses from the layer below.
   * Programmatic `dismiss()` still works.
   */
  persistent?: MaybeAccessor<boolean | undefined>;
  /** Disable pointer events on everything outside the layer (and layers below) while registered. */
  disableOutsidePointerEvents?: boolean;
  /**
   * Register this layer as a descendant of `parent`: presses inside it never dismiss `parent`,
   * even if it is portaled elsewhere in the DOM.
   */
  parent?: DismissableLayer | undefined;
}

export interface MakeDismissableLayerOptions extends DismissableLayerOptions {
  /** The layer's root element. */
  element: Element;
}

export interface DismissableLayerControls {
  /** Request dismissal. Respects `dismissible` (calls `onDismissAttempt` when it is `false`). */
  dismiss: (reason?: DismissReason, event?: Event) => void;
  /** Remove the layer from the stack and detach all listeners. Idempotent. */
  cleanup: () => void;
  /** The layer's handle, usable with {@link isTopLayer}. */
  layer: DismissableLayer;
}

// An event may reach several layers' listeners (each layer listens on its own); the first layer to
// act on it wins, so a handler that removes its layer synchronously can't cascade to the parent.
const handled = new WeakSet<Event>();

/** How long after a touch is released the focus move it causes may still arrive (ms). */
const TOUCH_FOCUS_WINDOW = 700;

const matchesExclude = (exclude: DismissableExclude | undefined, el: Element): boolean => {
  if (!exclude) return false;
  if (typeof exclude === "function") return exclude(el);
  if (Array.isArray(exclude)) return (exclude as readonly Element[]).some(e => e.contains(el));
  return (exclude as Element).contains(el);
};

const serverLayer = (): DismissableLayerControls => ({
  dismiss: noop,
  cleanup: noop,
  layer: {
    element: undefined as never,
    parent: undefined,
    persistent: false,
    disableOutsidePointerEvents: false,
  },
});

/**
 * Registers `element` as a dismissable layer on the shared layer stack. Only the topmost
 * non-persistent layer reacts to Escape, an outside pointer press and focus moving outside.
 * Outside detection is delegated to `makeInteractOutside` from `@solid-primitives/interaction`.
 *
 * @returns `dismiss` (programmatic request), `cleanup` (unregister and detach), and the `layer` handle.
 */
export function makeDismissableLayer(
  options: MakeDismissableLayerOptions,
): DismissableLayerControls {
  if (isServer) return serverLayer();

  const { element } = options;

  const layer: LayerRecord = {
    element,
    parent: options.parent,
    get persistent() {
      return !!access(options.persistent);
    },
    disableOutsidePointerEvents: !!options.disableOutsidePointerEvents,
  };

  const request = (reason: DismissReason, event?: Event) => {
    if (access(options.dismissible) === false) options.onDismissAttempt?.(reason, event);
    else options.onDismiss(reason, event);
  };

  // Presses that started while this layer was the top one. A touch press is only reported on its
  // `click`, after the tapped element's own handler may already have opened a new layer above this
  // one; the layer must still be dismissed by the tap it was top for.
  const pressedAsTop = new WeakSet<Event>();
  // The element a press landed on while that press (and the focus move it causes) is still being
  // dispatched: the browser reports a click on an input as pointerdown then focusin (or, for touch,
  // focusin then click). That is one interaction, so only the first report may dismiss.
  let pressTarget: Element | null = null;
  // The control a pressed <label> forwards focus to (on click, after the press task ended).
  let pressControl: Element | null = null;
  let pressTimer: number | undefined;

  const clearPress = () => {
    window.clearTimeout(pressTimer);
    pressTimer = undefined;
    pressTarget = null;
    pressControl = null;
  };

  /** Handles an automatic dismissal source, only for the layer that is currently on top. */
  const auto = (reason: DismissReason, event: Event) => {
    if (handled.has(event)) return;
    // A layer that turned persistent (even during the tap that is being reported) never reacts.
    if (layer.persistent) return;
    // An outside press belongs to the layer that was on top when the press started: a touch press is
    // reported on its click, by which time the tap's own handler may have changed the stack.
    if (reason === "outside-pointer" ? !pressedAsTop.has(event) : getTopLayer() !== layer) return;
    handled.add(event);
    request(reason, event);
  };

  const isFocusOfPress = (event: Event): boolean => {
    if (!pressTarget) return false;
    const target = (event.composedPath()[0] as Element | undefined) ?? (event.target as Element);
    // Realm-independent node check: `instanceof Node` fails for elements of an iframe's document.
    const isNode = (n: unknown): n is Node =>
      !!n && typeof (n as Node).nodeType === "number" && typeof (n as Node).contains === "function";
    return (
      !!target &&
      (target === pressControl ||
        target === pressTarget ||
        (isNode(target) && (target.contains(pressTarget) || pressTarget.contains(target))))
    );
  };

  const unregister = registerLayer(layer);

  const onPress = (e: PointerEvent) => {
    if (getTopLayer() === layer) pressedAsTop.add(e);
    clearPress();
    pressTarget = (e.composedPath()[0] as Element | undefined) ?? (e.target as Element | null);
    pressControl = (pressTarget as Element | null)?.closest?.("label")?.control ?? null;
    // Mouse / pen: the focus move is dispatched in the same task as the press, except when a
    // label forwards focus to its control on click (handled from pointerup).
    if (e.pointerType !== "touch" && !pressControl) pressTimer = window.setTimeout(clearPress, 0);
  };
  // Touch / label: the focus move comes after release, with the compatibility mouse events.
  const onRelease = (e: PointerEvent) => {
    if (!pressTarget || (e.pointerType !== "touch" && !pressControl)) return;
    window.clearTimeout(pressTimer);
    pressTimer = window.setTimeout(clearPress, TOUCH_FOCUS_WINDOW);
  };
  const onCancel = () => clearPress();

  // Registered after a tick, like `makeInteractOutside`, so that `element.ownerDocument` is final
  // and the event that created the layer is not observed. Registered before it, so the snapshot
  // listener runs first.
  let pressDoc: Document | undefined;
  const pressTimerId = window.setTimeout(() => {
    pressDoc = element.ownerDocument;
    pressDoc.addEventListener("pointerdown", onPress, true);
    pressDoc.addEventListener("pointerup", onRelease, true);
    pressDoc.addEventListener("pointercancel", onCancel, true);
  }, 0);

  const stopEscape = makeEventListener(
    element.ownerDocument,
    "keydown",
    (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.isComposing) return;
      auto("escape", e);
    },
    { capture: true },
  );

  const stopOutside = makeInteractOutside(element, {
    shouldExcludeElement: el => matchesExclude(options.exclude, el) || isInsideLayer(layer, el),
    onPointerDownOutside: e => auto("outside-pointer", e.detail.originalEvent),
    onFocusOutside: e => {
      if (isFocusOfPress(e.detail.originalEvent)) return;
      auto("outside-focus", e.detail.originalEvent);
    },
  });

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    stopEscape();
    stopOutside();
    window.clearTimeout(pressTimerId);
    clearPress();
    pressDoc?.removeEventListener("pointerdown", onPress, true);
    pressDoc?.removeEventListener("pointerup", onRelease, true);
    pressDoc?.removeEventListener("pointercancel", onCancel, true);
    unregister();
  };

  return {
    dismiss: (reason = "programmatic", event) => request(reason, event),
    cleanup,
    layer,
  };
}

export interface CreateDismissableLayerOptions extends DismissableLayerOptions {
  /** The layer's root element (or an accessor of it, e.g. a ref signal). Registered once defined. */
  ref: MaybeAccessor<Element | null | undefined>;
}

export interface CreateDismissableLayerReturn {
  /** Request dismissal of this layer. Respects `dismissible`. A no-op until the element exists. */
  dismiss: (reason?: DismissReason, event?: Event) => void;
  /** Whether this layer is currently the one reacting to Escape / outside presses. */
  isTop: Accessor<boolean>;
}

/**
 * Reactive {@link makeDismissableLayer}: registers the layer when `ref` resolves to an element,
 * re-registers if the element changes, and unregisters on cleanup. On the server it is a no-op.
 *
 * @example
 * ```tsx
 * const [el, setEl] = createSignal<HTMLElement>();
 * createDismissableLayer({ ref: el, onDismiss: () => setOpen(false) });
 * return <div ref={setEl}>…</div>;
 * ```
 */
export function createDismissableLayer(
  options: CreateDismissableLayerOptions,
): CreateDismissableLayerReturn {
  if (isServer) return { dismiss: noop, isTop: () => false };

  let current: DismissableLayerControls | undefined;
  const stack = useLayerStack();

  createEffect(
    () => access(options.ref) ?? undefined,
    el => {
      if (!el) return;
      const controls = makeDismissableLayer({
        element: el,
        get onDismiss() {
          return options.onDismiss;
        },
        get onDismissAttempt() {
          return options.onDismissAttempt;
        },
        get dismissible() {
          return options.dismissible;
        },
        get exclude() {
          return options.exclude;
        },
        get persistent() {
          return options.persistent;
        },
        get parent() {
          return options.parent;
        },
        disableOutsidePointerEvents: options.disableOutsidePointerEvents,
      } as MakeDismissableLayerOptions);
      current = controls;
      return () => {
        controls.cleanup();
        if (current === controls) current = undefined;
      };
    },
  );

  const isTop = createMemo(() => {
    stack();
    return !!current && getTopLayer() === current.layer;
  });

  return { dismiss: (reason, event) => current?.dismiss(reason, event), isTop };
}
