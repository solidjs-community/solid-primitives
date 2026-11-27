import { createSignal, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";

/** Why a dismissable layer is being asked to close. */
export type DismissReason = "escape" | "outside-pointer" | "outside-focus" | "programmatic";

/**
 * A layer registered in the shared layer stack. Instances are created by
 * {@link makeDismissableLayer} / {@link createDismissableLayer}; treat them as opaque handles.
 */
export interface DismissableLayer {
  /** The layer's root element. */
  readonly element: Element;
  /** A layer that is registered as the parent of this one (e.g. the dialog that opened a portaled popover). */
  readonly parent: DismissableLayer | undefined;
  /** A persistent layer stays in the stack but is never the layer that reacts to Escape / outside presses. */
  readonly persistent: boolean;
  /** Whether this layer disables pointer events outside of itself while registered. */
  readonly disableOutsidePointerEvents: boolean;
}

/** Internal: layer data the stack needs but consumers should not see. */
export interface LayerRecord extends DismissableLayer {
  prevPointerEvents?: string | undefined;
}

const layers: LayerRecord[] = [];

// `useLayerStack` is a reactive view of `layers`; created lazily on the client only.
let stackSignal: [Accessor<readonly DismissableLayer[]>, (v: readonly DismissableLayer[]) => void];
const getSignal = () =>
  (stackSignal ??= createSignal<readonly DismissableLayer[]>([], {
    ownedWrite: true,
  }) as unknown as typeof stackSignal);

const notify = () => getSignal()[1](layers.slice());

/** Saved `body.style.pointerEvents` of every document currently locked by a layer. */
const lockedDocs = new Map<Document, string>();

function updatePointerEvents(): void {
  // Documents that need their body locked, and the lowest disabling layer index per document.
  const firstDisabling = new Map<Document, number>();
  layers.forEach((l, i) => {
    if (l.disableOutsidePointerEvents) {
      const doc = l.element.ownerDocument;
      if (doc && !firstDisabling.has(doc)) firstDisabling.set(doc, i);
    }
  });
  // Restore documents that no longer need a lock.
  for (const [doc, saved] of lockedDocs) {
    if (firstDisabling.has(doc)) continue;
    if (doc.body) doc.body.style.pointerEvents = saved;
    lockedDocs.delete(doc);
  }
  // Lock newly needed documents.
  for (const doc of firstDisabling.keys()) {
    const body = doc.body;
    if (!body) continue;
    if (!lockedDocs.has(doc)) lockedDocs.set(doc, body.style.pointerEvents);
    body.style.pointerEvents = "none";
  }
  // Layers at or above the lowest disabling layer of their document must stay interactive.
  layers.forEach((layer, i) => {
    const el = layer.element as HTMLElement;
    if (!el.style) return;
    const first = firstDisabling.get(layer.element.ownerDocument);
    if (first !== undefined && i >= first) {
      if (layer.prevPointerEvents === undefined) layer.prevPointerEvents = el.style.pointerEvents;
      el.style.pointerEvents = "auto";
    } else if (layer.prevPointerEvents !== undefined) {
      el.style.pointerEvents = layer.prevPointerEvents;
      layer.prevPointerEvents = undefined;
    }
  });
}

/** @internal Adds a layer to the top of the stack. Returns a function removing it (idempotent, any order). */
export function registerLayer(layer: LayerRecord): () => void {
  if (isServer) return () => {};
  layers.push(layer);
  updatePointerEvents();
  notify();
  return () => {
    const i = layers.indexOf(layer);
    if (i === -1) return;
    layers.splice(i, 1);
    // restore this layer's own element before recomputing the others
    const el = layer.element as HTMLElement;
    if (layer.prevPointerEvents !== undefined && el.style) {
      el.style.pointerEvents = layer.prevPointerEvents;
      layer.prevPointerEvents = undefined;
    }
    updatePointerEvents();
    notify();
  };
}

/** A snapshot of the layer stack, bottom (oldest) first. Empty on the server. */
export function getLayerStack(): DismissableLayer[] {
  return layers.slice();
}

/** A reactive accessor of the layer stack, bottom (oldest) first. Always `[]` on the server. */
export function useLayerStack(): Accessor<readonly DismissableLayer[]> {
  if (isServer) return () => [];
  return getSignal()[0];
}

/**
 * The topmost non-persistent layer: the only one that reacts to Escape, outside presses and
 * outside focus. `undefined` when there is none.
 */
export function getTopLayer(): DismissableLayer | undefined {
  for (let i = layers.length - 1; i >= 0; i--) if (!layers[i]!.persistent) return layers[i];
  return undefined;
}

/** Whether `layer` is the topmost non-persistent layer (see {@link getTopLayer}). */
export function isTopLayer(layer: DismissableLayer): boolean {
  return getTopLayer() === layer;
}

/** `true` if `ancestor` is `layer` or one of its registered `parent`s. */
function isSelfOrAncestor(
  ancestor: DismissableLayer,
  layer: DismissableLayer | undefined,
): boolean {
  for (let l = layer; l; l = l.parent) if (l === ancestor) return true;
  return false;
}

/**
 * Whether `target` lies inside `layer`, or inside a layer that belongs to it: any layer opened
 * after it (above it in the stack), or one registered with it as an ancestor `parent`. Portaled
 * children therefore never read as "outside" their parent.
 */
export function isInsideLayer(layer: DismissableLayer, target: Node): boolean {
  if (layer.element.contains(target)) return true;
  const index = layers.indexOf(layer as LayerRecord);
  return layers.some(
    (other, i) =>
      other !== layer &&
      (i > index || isSelfOrAncestor(layer, other.parent)) &&
      other.element.contains(target),
  );
}
